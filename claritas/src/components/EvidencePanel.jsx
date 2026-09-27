// EvidencePanel.jsx
// Displays the model's explainability output: a plain-English summary +
// feature-weight breakdown (SHAP) and inline highlighted text showing
// which words drove the transformer's decision (LIME).
import { useState } from 'react';

const DIRECTION_STYLES = {
  fake: { bar: 'bg-rose-500', text: 'text-rose-400' },
  real: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
};

function FeatureBar({ feature, weight_pct, direction }) {
  const style = DIRECTION_STYLES[direction] || DIRECTION_STYLES.fake;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{feature}</span>
        <span className={`font-mono font-bold ${style.text}`}>{weight_pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${style.bar} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(weight_pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function HighlightedText({ tokens }) {
  return (
    <div className="leading-relaxed text-sm text-slate-300 whitespace-pre-wrap">
      {tokens.map((tok, i) => {
        if (tok.weight === null || tok.weight === undefined) {
          return <span key={i}>{tok.text}</span>;
        }

        const isFake = tok.direction === 'fake';
        const bg = isFake
          ? `rgba(244, 63, 94, ${0.15 + 0.55 * tok.weight})`
          : `rgba(16, 185, 129, ${0.15 + 0.55 * tok.weight})`;

        return (
          <span
            key={i}
            title={`${isFake ? '+' : '-'}${tok.weight.toFixed(2)} toward ${tok.direction}`}
            className="rounded px-0.5"
            style={{ backgroundColor: bg }}
          >
            {tok.text}
          </span>
        );
      })}
    </div>
  );
}

export function EvidencePanel({ text, verdict, misinformationProb, apiBaseUrl = 'http://localhost:8000' }) {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guard: don't even show the button if we don't have what we need
  if (!text || misinformationProb === undefined || misinformationProb === null) {
    return null;
  }

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          verdict,
          misinformation_prob: misinformationProb,
        }),
      });

      if (!res.ok) {
        let detail = `Request failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody?.detail) detail = errBody.detail;
        } catch (_) { /* response wasn't JSON, keep default detail */ }
        throw new Error(detail);
      }

      const data = await res.json();
      setEvidence(data);
    } catch (e) {
      console.error('[EvidencePanel] fetch failed:', e);
      setError(e.message || 'Could not generate evidence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State 1: nothing fetched yet — show the trigger button
  if (!evidence && !error) {
    return (
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block">Explainability</span>
          <p className="text-sm text-slate-300 mt-0.5">See which words and features drove this verdict</p>
        </div>
        <button
          onClick={fetchEvidence}
          disabled={loading}
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Show Evidence'}
        </button>
      </div>
    );
  }

  // State 2: error
  if (error) {
    return (
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-rose-900/50 rounded-2xl p-5 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wide text-rose-500 block">Evidence request failed</span>
        <p className="text-sm text-rose-400">{error}</p>
        <button
          onClick={fetchEvidence}
          className="text-xs text-slate-400 underline hover:text-slate-300"
        >
          Retry
        </button>
      </div>
    );
  }

  // State 3: success — full panel
  return (
    <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">

      <div>
        <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block mb-2">
          Why this verdict
        </span>
        <p className="text-sm text-slate-200 leading-relaxed">
          {evidence.summary_sentence}
        </p>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block">
          Contributing factors
        </span>
        {evidence.feature_breakdown?.length > 0 ? (
          evidence.feature_breakdown.map((f, i) => <FeatureBar key={i} {...f} />)
        ) : (
          <p className="text-xs text-slate-500">No dominant features found.</p>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
            Highlighted evidence
          </span>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/60 inline-block" /> toward fake
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 inline-block" /> toward real
            </span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto">
          {evidence.highlighted_tokens?.length > 0 ? (
            <HighlightedText tokens={evidence.highlighted_tokens} />
          ) : (
            <p className="text-xs text-slate-500">No highlighted tokens returned.</p>
          )}
        </div>
      </div>
    </div>
  );
}