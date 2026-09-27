# Claritas - Explainable AI Misinformation Trust Engine

Claritas is an end-to-end, privacy-focused Misinformation & Trust Detection Platform that combines layered ensemble classifiers, live web text extraction, batch analysis, and local explainable AI (XAI).

---

## Features

- **Two-Layer Ensemble Classification Pipeline**:
  - **Layer 1**: Deep fine-tuned DistilRoBERTa evaluating syntactic density, stylistic markers, and semantics.
  - **Layer 2**: Calibrated LightGBM meta-classifier integrating transformer probabilities with linguistic features (TextBlob polarity/subjectivity, VADER compound sentiment, Flesch Reading Ease score, and capitalization ratios).
- **Web Content Scraping & Live Preview**:
  - Automatically fetches and cleans main article text directly from input URLs.
  - Displays a full Extracted Article Preview in the main Analyzer view.
- **Batch Processing Engine**:
  - Input multiple claims or article URLs line-by-line.
  - Sequential processing with real-time progress tracking.
  - **Interactive Results**: Click any batch entry to instantly view its detailed linguistic analysis, confidence breakdown, and signal drivers.
- **Local Explainable AI (XAI via Ollama)**:
  - Generates plain-English 3-point explanation breakdowns using a locally hosted LLM (e.g., Llama 3) without leaking tokens or relying on external cloud APIs.
- **Human-In-The-Loop Audit Queue**:
  - Review model predictions, override incorrect verdicts, add custom reviewer notes, and store audit records in the database.
- **Export & Reporting**:
  - Export analysis reports instantly as CSV files.

---

## Tech Stack

### Backend
- **Framework**: FastAPI
- **NLP / ML Engine**: PyTorch, Hugging Face Transformers (DistilRoBERTa), LightGBM, TextBlob, TextStat, NLTK (VADER)
- **Scraper**: BeautifulSoup4, Requests
- **LLM Integration**: Ollama (Local Llama 3 engine)

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown Rendering**: react-markdown

---

## Repository Structure

```text
claritas/
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── how-it-works.png
│   │   ├── javascript.svg
│   │   ├── TEST_DATA.md
│   │   └── vite.svg
│   ├── backend/
│   │   ├── models/
│   │   ├── classifier.py
│   │   ├── main.py
│   │   ├── metrics.py
│   │   └── scraper.py
│   ├── components/
│   │   ├── AnalyzerPage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   ├── HumanReviewModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ReviewQueuePage.jsx
│   │   └── VerdictCard.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── counter.js
│   ├── main.jsx
│   └── style.css
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

---

## Quick Start Guide

### 1. Prerequisites
- **Python**: 3.9+
- **Node.js**: v18+
- **Ollama** (Optional, for XAI local summaries): Download and run `ollama run llama3`

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd src/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn torch transformers lightgbm pandas textblob textstat nltk beautifulsoup4 requests joblib

# Start the FastAPI Server
python main.py
```

The API server will run at: `http://localhost:8000`

---

### 3. Frontend Setup

```bash
# Navigate to project root directory
cd claritas

# Install NPM dependencies
npm install

# Start the Vite development server
npm run dev
```

The React app will run at: `http://localhost:5173`

---

## How To Use

1. **Single Analysis**:
   - Paste any article URL or text claim into the main text box and click **Analyze Claim**.
   - If a URL was provided, view the extracted article text preview.
2. **Batch Analysis**:
   - Click **Process in Batch**, input multiple URLs or claims (one per line), and click **Run Batch Analysis**.
   - Click any completed item row to view its full breakdown on the Analyzer page.
3. **Local Explanation**:
   - Click **Explain with Ollama** to generate a plain-English explanation of why the model flagged or cleared the claim.
4. **Human Review Audit**:
   - Click **Audit Result** to confirm or correct the model verdict and log notes to the **Review Queue**.

---

## License

Distributed under the MIT License.