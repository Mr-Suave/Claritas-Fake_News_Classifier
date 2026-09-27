# backend/classifier.py
import re
import joblib
import torch
import torch.nn.functional as F
import pandas as pd
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from textblob import TextBlob
import textstat
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from typing import Optional

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('vader_lexicon', quiet=True)

BASE_DIR = Path(__file__).resolve().parent
PIPELINE_DIR = BASE_DIR / "models" / "claritas_kaggle_model" / "saved_fake_news_pipeline"

class ClaritasClassifier:
    def __init__(self):
        print(f"Loading Claritas Ensemble Pipeline from: {PIPELINE_DIR}...")
        
        transformer_path = PIPELINE_DIR / "distilroberta_layer1"
        lgbm_path = PIPELINE_DIR / "calibrated_lgbm_meta.joblib"
        metadata_path = PIPELINE_DIR / "pipeline_metadata.joblib"
        
        self.tokenizer = AutoTokenizer.from_pretrained(str(transformer_path))
        self.model = AutoModelForSequenceClassification.from_pretrained(str(transformer_path))
        self.model.eval()
        
        self.calibrated_lgbm = joblib.load(str(lgbm_path))
        self.metadata = joblib.load(str(metadata_path))
        self.vader = SentimentIntensityAnalyzer()
        
        print("✓ Claritas Ensemble Pipeline loaded successfully.")

    def _deep_clean(self, text: str) -> str:
        text = re.sub(r'\(Reuters\)', '', text)
        text = re.sub(r'http\S+|www\.\S+', '', text)
        text = re.sub(r'pic\.twitter\.\S+', '', text)
        text = re.sub(r'\[.*?\]', '', text)
        return text.strip()

    def predict(self, text: str, linguistic_metrics: Optional[dict] = None) -> dict:
        clean_text = self._deep_clean(text)
        
        # --- Step 1: Layer 1 Transformer ---
        inputs = self.tokenizer(
            clean_text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=256, 
            padding=True
        )
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1)[0]
        
        roberta_prob = float(probs[1].item())

        # --- Step 2: Extract Features ---
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

        features = {
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

        features_df = pd.DataFrame([features])[self.metadata['feature_names']]

        # --- Step 3: Layer 2 LightGBM ---
        calibrated_prob = float(self.calibrated_lgbm.predict_proba(features_df)[0][1])

        # Feature contribution visualization calculation
        feature_contributions = [
            {"name": "RoBERTa Deep Style Signal", "value": round(features['roberta_prob'] * 100, 1), "color": "bg-indigo-500"},
            {"name": "Subjectivity Index", "value": round(features['subjectivity'] * 100, 1), "color": "bg-amber-500"},
            {"name": "VADER Sentiment Intensity", "value": round(abs(features['vader_compound']) * 100, 1), "color": "bg-emerald-500"},
            {"name": "Caps Ratio (Exclamation)", "value": round(min(features['caps_ratio'] * 500, 100), 1), "color": "bg-rose-500"},
            {"name": "Readability Complexity", "value": round(100 - min(max(features['flesch_reading_ease'], 0), 100), 1), "color": "bg-purple-500"}
        ]

        # Check model layer disagreement threshold
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