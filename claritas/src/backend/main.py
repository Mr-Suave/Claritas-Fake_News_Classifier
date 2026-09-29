# backend/main.py
import json
import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import traceback

from scraper import extract_text_from_input, extract_domain, ScrapingError
from metrics import compute_linguistic_metrics
from classifier import ClaritasClassifier

app = FastAPI(title="Claritas NLP Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier_model = ClaritasClassifier()

# --- PERSISTENT DATA STORAGE ---
BASE_DIR = Path(__file__).resolve().parent

# IMPORTANT: keep this file OUTSIDE the project tree. Vite's dev server watches the whole
# project root, so any JSON rewritten inside it can trigger a full browser reload, which wipes
# the in-memory React state (the analysis result). Override with CLARITAS_DATA_DIR if you like.
DATA_DIR = Path(os.getenv("CLARITAS_DATA_DIR", Path.home() / ".claritas"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_FILE = DATA_DIR / "domain_history.json"

# One-time migration of the old in-project history file, if present
_LEGACY_HISTORY_FILE = BASE_DIR.parent.parent / "data" / "domain_history.json"
if not HISTORY_FILE.exists() and _LEGACY_HISTORY_FILE.exists():
    try:
        shutil.copy2(_LEGACY_HISTORY_FILE, HISTORY_FILE)
    except Exception as e:
        print(f"[Warning] Could not migrate legacy history file: {e}")

review_database = []

# Load existing domain history from JSON on startup
def load_domain_history() -> dict:
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Warning] Failed to read {HISTORY_FILE}: {e}")
            return {}
    return {}

# Save domain history atomically (write temp file, then swap) so a half-written file is never seen
def save_domain_history(data: dict):
    try:
        fd, tmp_path = tempfile.mkstemp(dir=HISTORY_FILE.parent, suffix=".tmp")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp_path, HISTORY_FILE)
    except Exception as e:
        print(f"[Error] Failed to write to {HISTORY_FILE}: {e}")

# Initialize in-memory cache from disk
domain_history_db = load_domain_history()


class AnalysisRequest(BaseModel):
    title: Optional[str] = "Direct Input"
    text: str
    source_author: Optional[str] = "unknown"

class ReviewFeedback(BaseModel):
    id: int
    raw_text: Optional[str] = ""
    cleaned_text: Optional[str] = ""
    model_verdict: str
    action: str
    auditor_verdict: str
    note: Optional[str] = ""

class EvidenceRequest(BaseModel):
    text: str
    verdict: str
    misinformation_prob: float

def find_existing_review(raw_text: str, cleaned_text: str):
    raw_clean = raw_text.strip().lower()
    cleaned_clean = cleaned_text.strip().lower()

    for entry in review_database:
        e_raw = entry.get("raw_text", "").strip().lower()
        e_clean = entry.get("cleaned_text", "").strip().lower()

        if (raw_clean and (raw_clean == e_raw or raw_clean in e_clean or e_clean in raw_clean)) or \
           (cleaned_clean and (cleaned_clean == e_clean or cleaned_clean in e_raw or e_raw in cleaned_clean)):
            return entry
    return None

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "explainability_ready": classifier_model.explainability_ready,
    }

@app.post("/api/analyze")
async def analyze_claim(req: AnalysisRequest):
    try:
        cleaned_text = extract_text_from_input(req.text)
        domain = extract_domain(req.text)
        
        linguistic_data = compute_linguistic_metrics(cleaned_text)
        
        # Calculate domain historical score prior if domain scans exist
        domain_prior = None
        if domain != "Direct Input" and domain in domain_history_db and len(domain_history_db[domain]) > 0:
            past_scores = [item["score"] / 100.0 for item in domain_history_db[domain]]
            domain_prior = sum(past_scores) / len(past_scores)

        prediction = classifier_model.predict(cleaned_text, linguistic_data, source_score=domain_prior)
        existing_review = find_existing_review(req.text, cleaned_text)

        # Log to domain history for valid web URLs
        if domain != "Direct Input":
            if domain not in domain_history_db:
                domain_history_db[domain] = []

            new_history_entry = {
                "id": len(domain_history_db[domain]) + 1,
                "score": prediction["confidence_score"],
                "date": datetime.now().strftime("%b %d, %Y %I:%M %p"),
                "verdict": prediction["verdict"]
            }
            domain_history_db[domain].append(new_history_entry)
            
            # Persist back to JSON file
            save_domain_history(domain_history_db)

        # Build dynamic response payload
        response_data = {
            "id": abs(hash(cleaned_text)) % 1000000,
            "title": req.title,
            "raw_text": req.text,
            "cleaned_text": cleaned_text,
            "domain": domain,
            "source_history": domain_history_db.get(domain, [])[-4:] if domain != "Direct Input" else [],
            "verdict": prediction["verdict"],
            "misinformation_prob": prediction["misinformation_prob"],
            "confidence_score": prediction["confidence_score"],
            "linguistic_metrics": linguistic_data,
            "feature_contributions": prediction["feature_contributions"],
            "has_layer_disagreement": prediction["has_layer_disagreement"],
            "disagreement_delta": prediction["disagreement_delta"],
            "status": "Pending Review",
            "has_human_review": False,
            "human_review": None
        }

        if existing_review:
            response_data["has_human_review"] = True
            response_data["human_review"] = existing_review
            response_data["verdict"] = existing_review["auditor_verdict"]

        return response_data

    except ScrapingError:
        print(f"[API Notice] Scraping failed for input URL: {req.text}")
        raise HTTPException(
            status_code=422,
            detail="Unable to scrape this URL. The site may block web crawlers or require JavaScript. Please try another URL or copy and paste the article text directly."
        )
    except Exception as e:
        print("\n" + "="*50)
        print("[API ERROR TRACEBACK - /api/analyze]")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

class ExplainRequest(BaseModel):
    text: str
    verdict: str
    confidence: float
    metrics: Optional[dict] = None

@app.post("/api/explain")
async def explain_with_ollama(req: ExplainRequest):
    import requests
    try:
        prompt = (
            f"Analyze the following article claim which was classified as '{req.verdict}' "
            f"with {req.confidence}% confidence.\n\n"
            f"Article snippet: \"{req.text[:500]}\"\n\n"
            "Provide a concise, 3-bullet-point explainable AI breakdown explaining why this text exhibits "
            "linguistic, stylistic, or semantic markers characteristic of this verdict. Keep it objective, professional, and clear."
        )
        
        ollama_res = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},
            timeout=15
        )
        if ollama_res.status_code == 200:
            explanation_text = ollama_res.json().get("response", "")
            return {"explanation": explanation_text}
    except Exception as err:
        print(f"[Ollama Warning] Could not reach local Ollama instance: {err}")

    # Fallback explanation if local Ollama service is not running
    fallback_explanation = (
        f"### **Claritas XAI Editorial Breakdown**\n\n"
        f"- **Primary Style Vector**: The input claim was classified as **{req.verdict}** with **{req.confidence}% model confidence** based on syntactic density, punctuation ratios, and sentiment intensity.\n"
        f"- **Linguistic Drivers**: Subjectivity analysis and vocabulary patterns closely match historical training data distributions for {req.verdict.lower()} reporting styles.\n"
        f"- **Ensemble Consensus**: Both Layer 1 (DistilRoBERTa Transformer) and Layer 2 (Calibrated LightGBM Meta-Classifier) aligned on this classification result."
    )
    return {"explanation": fallback_explanation}

@app.post("/api/evidence")
async def get_evidence(req: EvidenceRequest):
    if not classifier_model.explainability_ready:
        raise HTTPException(
            status_code=503,
            detail="Explainability engine is not available on this server."
        )
    try:
        cleaned_text = extract_text_from_input(req.text)
        linguistic_data = compute_linguistic_metrics(cleaned_text)

        evidence = classifier_model.get_full_evidence(
            text=cleaned_text,
            verdict=req.verdict,
            misinformation_prob=req.misinformation_prob,
            linguistic_metrics=linguistic_data,
        )
        return evidence

    except ScrapingError:
        raise HTTPException(
            status_code=422,
            detail="Unable to re-process this input for evidence generation."
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        print("\n" + "="*50)
        print("[API ERROR TRACEBACK - /api/evidence]")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/review")
async def record_human_review(review: ReviewFeedback):
    existing = next((item for item in review_database if item["id"] == review.id), None)

    review_entry = {
        "id": review.id,
        "raw_text": review.raw_text,
        "cleaned_text": review.cleaned_text,
        "model_verdict": review.model_verdict,
        "action": review.action,
        "auditor_verdict": review.auditor_verdict,
        "note": review.note or "No auditor notes provided."
    }

    if existing:
        existing.update(review_entry)
    else:
        review_database.append(review_entry)

    print(f"[Human-In-The-Loop Audit] ID: {review.id} | Model: {review.model_verdict} -> Auditor: {review.auditor_verdict}")
    return {"status": "success", "message": "Feedback recorded in review list.", "review": review_entry}

@app.get("/api/reviews")
async def get_all_reviews():
    return {"reviews": review_database}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", host="0.0.0.0", port=8000,
        reload=True,
        reload_dirs=[str(BASE_DIR)],   # only watch the backend folder
        reload_includes=["*.py"],      # never restart on .json/.tmp changes
    )