// VerdictCard.jsx - Simple and clean, no gauge nonsense
import { EvidencePanel } from './EvidencePanel';

export function VerdictCard({ confidence, verdict, text, misinformationProb, apiBaseUrl }) {
  const getIcon = () => {
    if (verdict === 'Likely Misinformation') {
      return (
        <svg className="w-12 h-12 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      );
    }
    if (verdict === 'Likely Real') {
      return (
        <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 9c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block">Classification Verdict</span>
            <h3 className={`text-2xl font-black ${
              verdict === 'Likely Misinformation' ? 'text-rose-400' :
              verdict === 'Likely Real' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {verdict}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block">Model Confidence</span>
          <span className="text-4xl font-mono font-black text-indigo-400">{confidence}%</span>
        </div>
      </div>

      {/*
        Evidence panel: SHAP feature breakdown + LIME highlighted text.
        REQUIRES the parent to pass `text` (the cleaned article text) and
        `misinformationProb` (the raw 0-1 probability) in addition to the
        original confidence/verdict props, e.g.:

          <VerdictCard
            confidence={result.confidence_score}
            verdict={result.verdict}
            text={result.cleaned_text}
            misinformationProb={result.misinformation_prob}
          />

        If these two props aren't passed, EvidencePanel renders nothing
        (see its internal guard) rather than throwing — so this component
        stays safe to use anywhere without breaking existing call sites.
      */}
      <EvidencePanel
        text={text}
        verdict={verdict}
        misinformationProb={misinformationProb}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}