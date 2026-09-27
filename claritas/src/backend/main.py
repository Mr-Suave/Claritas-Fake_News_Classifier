# backend/main.py
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import traceback

from scraper import extract_text_from_input, ScrapingError
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
review_database = []

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

@app.post("/api/analyze")
async def analyze_claim(req: AnalysisRequest):
    try:
        # Step 1: Web Scrape URL or clean raw text
        cleaned_text = extract_text_from_input(req.text)
        
        # Step 2: Extract linguistic features
        linguistic_data = compute_linguistic_metrics(cleaned_text)
        
        # Step 3: Run Transformer model inference
        prediction = classifier_model.predict(cleaned_text, linguistic_data)
        
        # Step 4: Check if item was reviewed by human
        existing_review = find_existing_review(req.text, cleaned_text)
        
        response_data = {
            "id": abs(hash(cleaned_text)) % 1000000,
            "title": req.title,
            "raw_text": req.text,
            "cleaned_text": cleaned_text,
            "verdict": prediction["verdict"],
            "misinformation_prob": prediction["misinformation_prob"],
            "confidence_score": prediction["confidence_score"],
            "linguistic_metrics": linguistic_data,
            "feature_contributions": prediction["feature_contributions"],  # ADD THIS
            "has_layer_disagreement": prediction["has_layer_disagreement"],  # ADD THIS
            "disagreement_delta": prediction["disagreement_delta"],  # ADD THIS
            "status": "Pending Review",
            "has_human_review": False,
            "human_review": None
        }

        if existing_review:
            response_data["has_human_review"] = True
            response_data["human_review"] = existing_review
            response_data["verdict"] = existing_review["auditor_verdict"]

        return response_data

    except ScrapingError as se:
        # Handle scraping failure cleanly without cluttering terminal logs or running model
        print(f"[API Notice] Scraping failed for input URL: {req.text}")
        raise HTTPException(
            status_code=422, 
            detail="Unable to scrape this URL. The site may block web crawlers or require JavaScript. Please try another URL or copy and paste the article text directly."
        )
    except Exception as e:
        print("\n" + "="*50)
        print("[API ERROR TRACEBACK]")
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

@app.post("/api/explain")
async def explain_with_ollama(payload: dict):
    try:
        import requests
        
        text = payload.get("text", "")
        verdict = payload.get("verdict", "")
        confidence = payload.get("confidence", 0)
        metrics = payload.get("metrics", {})
        
        prompt = f"""Analyze this misinformation detection result and explain the key drivers:

Text: {text[:500]}...

Model Verdict: {verdict}
Confidence: {confidence}%
Subjectivity Score: {metrics.get('subjectivity', 0)}
Readability (Flesch): {metrics.get('flesch_reading_ease', 0)}
Word Count: {metrics.get('word_count', 0)}

Provide a brief 3-point explanation of why the model reached this verdict. Focus on linguistic patterns and signals."""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",  # or whatever model you have running
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )
        
        if response.status_code == 200:
            explanation = response.json().get("response", "")
            return {"explanation": explanation}
        else:
            return {"explanation": "Ollama returned an error. Check your model is running."}
            
    except requests.exceptions.ConnectionError:
        return {"explanation": "Cannot connect to Ollama. Make sure it's running on http://localhost:11434"}
    except Exception as e:
        return {"explanation": f"Explanation generation failed: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)