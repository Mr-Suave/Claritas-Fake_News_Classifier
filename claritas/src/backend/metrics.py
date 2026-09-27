# backend/metrics.py
from textblob import TextBlob
import re

def compute_linguistic_metrics(text: str) -> dict:
    """
    Calculates subjectivity index and Flesch Reading Ease score.
    """
    blob = TextBlob(text)
    
    # TextBlob subjectivity score (0.0 = Objective, 1.0 = Highly Subjective)
    subjectivity = round(blob.sentiment.subjectivity, 2)
    
    words = len(re.findall(r'\w+', text))
    sentences = max(len(blob.sentences), 1)
    
    # Flesch Reading Ease score calculation
    avg_sentence_len = words / sentences
    flesch = round(206.835 - (1.015 * avg_sentence_len), 1)
    flesch_score = max(0.0, min(100.0, flesch))
    
    return {
        "subjectivity": subjectivity,
        "flesch_reading_ease": flesch_score,
        "word_count": words,
        "sentence_count": sentences
    }