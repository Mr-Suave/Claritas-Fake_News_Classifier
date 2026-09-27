# backend/classifier.py
import re
import joblib
import torch
import torch.nn.functional as F
import numpy as np
import pandas as pd
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from textblob import TextBlob
import textstat
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from typing import Optional

import shap
from lime.lime_text import LimeTextExplainer

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('vader_lexicon', quiet=True)

BASE_DIR = Path(__file__).resolve().parent
PIPELINE_DIR = BASE_DIR / "models" / "claritas_kaggle_model" / "saved_fake_news_pipeline"

# Friendly display names for the dashboard's evidence panel
FRIENDLY_NAMES = {
    'roberta_prob': "the AI model's own reading of the text",
    'sentiment_polarity': "emotional tone (positive/negative)",
    'subjectivity': "how opinion-based vs factual the writing is",
    'vader_compound': "emotional intensity",
    'flesch_reading_ease': "readability / writing complexity",
    'avg_word_len': "word complexity",
    'caps_ratio': "use of ALL CAPS",
    'excl_ratio': "use of exclamation marks",
    'word_count': "article length",
    'source_score': "the source/author's track record",
}


def _get_underlying_lgbm(calibrated_model):
    """
    CalibratedClassifierCV wraps LightGBM; SHAP's TreeExplainer needs the
    raw tree model, not the calibration wrapper. The attribute name that
    holds the fitted base model has changed across sklearn versions:
      - sklearn < 1.6 : `base_estimator`
      - sklearn >= 1.6: `estimator`
    We try every known name so this works regardless of installed version.
    """
    try:
        cc = calibrated_model.calibrated_classifiers_[0]
    except (AttributeError, IndexError) as e:
        print(f"[classifier] Could not read calibrated_classifiers_: {e}")
        return None

    for attr in ("estimator", "base_estimator", "_estimator"):
        model = getattr(cc, attr, None)
        if model is not None:
            print(f"[classifier] Found underlying LightGBM model via attribute '{attr}'")
            return model

    print(f"[classifier] WARNING: none of the expected attributes found on "
          f"{type(cc)}. Available attributes: {[a for a in dir(cc) if not a.startswith('__')]}")
    return None


class ClaritasClassifier:
    def __init__(self):
        print(f"Loading Claritas Ensemble Pipeline from: {PIPELINE_DIR}...")

        transformer_path = PIPELINE_DIR / "distilroberta_layer1"
        lgbm_path = PIPELINE_DIR / "calibrated_lgbm_meta.joblib"
        metadata_path = PIPELINE_DIR / "pipeline_metadata.joblib"

        if not transformer_path.exists():
            raise FileNotFoundError(f"Transformer folder not found at: {transformer_path}")
        if not lgbm_path.exists():
            raise FileNotFoundError(f"LightGBM file not found at: {lgbm_path}")
        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found at: {metadata_path}")

        self.tokenizer = AutoTokenizer.from_pretrained(str(transformer_path))
        self.model = AutoModelForSequenceClassification.from_pretrained(str(transformer_path))
        self.model.eval()

        self.calibrated_lgbm = joblib.load(str(lgbm_path))
        self.metadata = joblib.load(str(metadata_path))
        self.vader = SentimentIntensityAnalyzer()

        print("✓ Core prediction pipeline loaded successfully.")

        # -----------------------------------------------------------------
        # Explainability engines (SHAP + LIME). Wrapped so that if THIS
        # fails for any reason (version mismatch, etc.), the core /api/analyze
        # endpoint still works — only /api/evidence will be unavailable.
        # -----------------------------------------------------------------
        self.explainability_ready = False
        self.shap_explainer = None
        self.lime_explainer = None
        try:
            underlying_lgbm = _get_underlying_lgbm(self.calibrated_lgbm)
            if underlying_lgbm is None:
                raise ValueError("Could not extract underlying LightGBM estimator from calibrated wrapper")
            self.shap_explainer = shap.TreeExplainer(underlying_lgbm)
            self.lime_explainer = LimeTextExplainer(class_names=['real', 'fake'])
            self.explainability_ready = True
            print("✓ Explainability engines (SHAP + LIME) ready.")
        except Exception as e:
            print(f"[WARNING] Explainability engines failed to initialize: {e}")
            print("[WARNING] /api/analyze will still work normally. "
                  "/api/evidence will return a 503 until this is resolved.")

    def _deep_clean(self, text: str) -> str:
        text = re.sub(r'\(Reuters\)', '', text)
        text = re.sub(r'http\S+|www\.\S+', '', text)
        text = re.sub(r'pic\.twitter\.\S+', '', text)
        text = re.sub(r'\[.*?\]', '', text)
        return text.strip()

    def _roberta_prob(self, clean_text: str) -> float:
        inputs = self.tokenizer(
            clean_text, return_tensors="pt", truncation=True, max_length=256, padding=True
        )
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1)[0]
        return float(probs[1].item())

    def _roberta_probs_batch(self, texts, batch_size: int = 16):
        """Batched roberta P(fake) — used by LIME to score many perturbed
        variants of the input text quickly."""
        probs = []
        texts = list(texts)
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            inputs = self.tokenizer(batch, truncation=True, padding=True, max_length=256, return_tensors="pt")
            with torch.no_grad():
                logits = self.model(**inputs).logits
            probs.extend(torch.softmax(logits, dim=1)[:, 1].tolist())
        return probs

    def _build_features(self, clean_text: str, roberta_prob: float, linguistic_metrics: Optional[dict] = None) -> dict:
        words = clean_text.split()
        word_count = len(words)
        char_count = max(len(clean_text), 1)

        blob = TextBlob(clean_text)
        polarity = linguistic_metrics.get("polarity", blob.sentiment.polarity) if linguistic_metrics else blob.sentiment.polarity
        subjectivity = linguistic_metrics.get("subjectivity", blob.sentiment.subjectivity) if linguistic_metrics else blob.sentiment.subjectivity
        vader_compound = linguistic_metrics.get("vader_compound", self.vader.polarity_scores(clean_text)['compound']) if linguistic_metrics else self.vader.polarity_scores(clean_text)['compound']

        try:
            flesch = linguistic_metrics.get("flesch_reading_ease", textstat.flesch_reading_ease(clean_text)) if linguistic_metrics else textstat.flesch_reading_ease(clean_text)
        except Exception:
            flesch = 50.0

        return {
            'sentiment_polarity': float(polarity),
            'roberta_prob': float(roberta_prob),
            'subjectivity': float(subjectivity),
            'word_count': float(word_count),
            'vader_compound': float(vader_compound),
            'avg_word_len': float(sum(len(w) for w in words) / max(word_count, 1)),
            'caps_ratio': float(sum(1 for c in clean_text if c.isupper()) / char_count),
            'flesch_reading_ease': float(flesch),
            'excl_ratio': float(clean_text.count('!') / char_count),
            'source_score': float(self.metadata.get('global_source_prior', 0.438281))
        }

    def predict(self, text: str, linguistic_metrics: Optional[dict] = None) -> dict:
        clean_text = self._deep_clean(text)
        roberta_prob = self._roberta_prob(clean_text)
        features = self._build_features(clean_text, roberta_prob, linguistic_metrics)
        features_df = pd.DataFrame([features])[self.metadata['feature_names']]

        calibrated_prob = float(self.calibrated_lgbm.predict_proba(features_df)[0][1])

        feature_contributions = [
            {"name": "RoBERTa Deep Style Signal", "value": round(features['roberta_prob'] * 100, 1), "color": "bg-indigo-500"},
            {"name": "Subjectivity Index", "value": round(features['subjectivity'] * 100, 1), "color": "bg-amber-500"},
            {"name": "VADER Sentiment Intensity", "value": round(abs(features['vader_compound']) * 100, 1), "color": "bg-emerald-500"},
            {"name": "Caps Ratio (Exclamation)", "value": round(min(features['caps_ratio'] * 500, 100), 1), "color": "bg-rose-500"},
            {"name": "Readability Complexity", "value": round(100 - min(max(features['flesch_reading_ease'], 0), 100), 1), "color": "bg-purple-500"}
        ]

        disagreement_delta = abs(roberta_prob - calibrated_prob)
        has_layer_disagreement = disagreement_delta >= 0.35

        real_max = self.metadata['classification_thresholds']['likely_real_max']
        fake_min = self.metadata['classification_thresholds']['likely_fake_min']

        if calibrated_prob <= real_max:
            verdict = "Likely Real"
            confidence = round((1 - calibrated_prob) * 100, 1)
        elif calibrated_prob >= fake_min:
            verdict = "Likely Misinformation"
            confidence = round(calibrated_prob * 100, 1)
        else:
            verdict = "Uncertain"
            confidence = round((1 - abs(calibrated_prob - 0.5) * 2) * 100, 1)

        return {
            "verdict": verdict,
            "misinformation_prob": round(calibrated_prob, 4),
            "confidence_score": confidence,
            "feature_contributions": feature_contributions,
            "has_layer_disagreement": has_layer_disagreement,
            "disagreement_delta": round(disagreement_delta * 100, 1),
            "raw_probs": {
                "layer1_roberta_prob": round(roberta_prob, 4),
                "layer2_calibrated_prob": round(calibrated_prob, 4)
            }
        }

    def get_full_evidence(self, text: str, verdict: str, misinformation_prob: float,
                           linguistic_metrics: Optional[dict] = None, num_lime_features: int = 15,
                           num_lime_samples: int = 200) -> dict:
        if not self.explainability_ready:
            raise RuntimeError(
                "Explainability engine is not available (SHAP/LIME failed to initialize at "
                "startup — check the server logs from when uvicorn started for the exact error)."
            )

        clean_text = self._deep_clean(text)
        roberta_prob = self._roberta_prob(clean_text)
        features = self._build_features(clean_text, roberta_prob, linguistic_metrics)
        features_df = pd.DataFrame([features])[self.metadata['feature_names']]

        # --- SHAP: which of the 10 features drove the meta-model's decision ---
        sv = self.shap_explainer.shap_values(features_df)
        sv_row = sv[1][0] if isinstance(sv, list) else sv[0]
        contribs = dict(zip(self.metadata['feature_names'], sv_row))

        abs_contribs = {k: abs(v) for k, v in contribs.items()}
        total = sum(abs_contribs.values()) or 1e-9
        weighted = {k: (v / total) * 100 for k, v in abs_contribs.items()}
        sorted_features = sorted(weighted.items(), key=lambda x: x[1], reverse=True)

        feature_breakdown = [
            {
                "feature": FRIENDLY_NAMES.get(feat, feat),
                "weight_pct": round(weight, 1),
                "direction": "fake" if contribs[feat] > 0 else "real",
            }
            for feat, weight in sorted_features if weight > 0.5
        ]

        top_parts = [
            f"{FRIENDLY_NAMES.get(f, f)} ({w:.0f}% weight, pushing toward "
            f"{'FAKE' if contribs[f] > 0 else 'REAL'})"
            for f, w in sorted_features[:3]
        ]
        summary_sentence = (
            f"This article was classified as {verdict} "
            f"(confidence: {misinformation_prob * 100:.1f}% likely fake). "
            f"The main factors were: " + "; ".join(top_parts) + "."
        )

        # --- LIME: which words in the raw text drove the transformer layer ---
        def predict_proba_for_lime(texts):
            probs = self._roberta_probs_batch(texts)
            return np.array([[1 - p, p] for p in probs])

        lime_exp = self.lime_explainer.explain_instance(
            clean_text, predict_proba_for_lime,
            num_features=num_lime_features, num_samples=num_lime_samples
        )
        word_weights = dict(lime_exp.as_list())
        max_abs_weight = max((abs(w) for w in word_weights.values()), default=1e-9) or 1e-9

        tokens = re.findall(r"\S+|\s+", clean_text)
        highlighted_tokens = []
        for tok in tokens:
            if not tok.strip():
                highlighted_tokens.append({"text": tok, "weight": None, "direction": None})
                continue
            stripped = tok.strip(".,!?\"'").lower()
            match = word_weights.get(stripped)
            if match is None:
                highlighted_tokens.append({"text": tok, "weight": None, "direction": None})
            else:
                highlighted_tokens.append({
                    "text": tok,
                    "weight": round(abs(match) / max_abs_weight, 3),
                    "direction": "fake" if match > 0 else "real",
                })

        return {
            "summary_sentence": summary_sentence,
            "feature_breakdown": feature_breakdown,
            "highlighted_tokens": highlighted_tokens,
        }