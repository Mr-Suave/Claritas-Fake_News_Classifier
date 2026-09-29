// EvidencePanel.jsx
import { useState } from 'react';

const DIRECTION_STYLES = {
  fake: { bar: 'bg-[#cc0000]', text: 'text-[#cc0000]' },
  real: { bar: 'bg-[#008000]', text: 'text-[#008000]' },
};

function FeatureBar({ feature, weight_pct, direction }) {
  const style = DIRECTION_STYLES[direction] || DIRECTION_STYLES.fake;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-typewriter">
        <span className="text-slate-900 font-bold uppercase">{feature}</span>
        <span className={`font-black ${style.text}`}>{weight_pct}%</span>
      </div>
      <div className="h-2.5 w-full bg-[#e8e1d3] border border-black overflow-hidden">
        <div
          className={`h-full ${style.bar} transition-all duration-500`}
          style={{ width: `${Math.min(weight_pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function HighlightedText({ tokens }) {
  return (
    <div className="leading-relaxed text-sm text-black font-serif-headline whitespace-pre-wrap">
      {tokens.map((tok, i) => {
        if (tok.weight === null || tok.weight === undefined) {
          return <span key={i}>{tok.text}</span>;
        }

        const isFake = tok.direction === 'fake';
        const bg = isFake
          ? `rgba(204, 0, 0, ${0.15 + 0.55 * tok.weight})`
          : `rgba(0, 128, 0, ${0.15 + 0.55 * tok.weight})`;

        return (
          <span
            key={i}
            title={`${isFake ? '+' : '-'}${tok.weight.toFixed(2)} toward ${tok.direction}`}
            className="px-0.5 border-b border-dashed border-black"
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
        } catch (_) { }
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

  if (!evidence && !error) {
    return (
      <div className="bg-[#fffdf7] border-4 border-black p-5 flex items-center justify-between gap-4 shadow-[4px_4px_0px_#1a1815]">
        <div>
          <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700 block">LINGUISTIC EXPLAINABILITY DISCLOSURE</span>
          <p className="text-sm font-serif-headline text-black mt-0.5 font-semibold">Inspect which terms & stylistic indicators drove this verdict</p>
        </div>
        <button
          type="button"
          onClick={fetchEvidence}
          disabled={loading}
          className="shrink-0 px-4 py-2.5 bg-black text-[#f4efe6] font-typewriter text-xs font-bold uppercase tracking-wider hover:bg-[#cc0000] transition disabled:opacity-50 border border-black cursor-pointer shadow-[2px_2px_0px_#1a1815]"
        >
          {loading ? 'Analyzing Press Wire…' : 'Expose Evidence'}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fff0f0] border-4 border-[#cc0000] p-5 space-y-2 shadow-[4px_4px_0px_#cc0000]">
        <span className="text-[10px] font-typewriter uppercase tracking-widest text-[#cc0000] block">EVIDENCE DISCLOSURE FAILED</span>
        <p className="text-sm font-serif-headline text-[#cc0000]">{error}</p>
        <button
          type="button"
          onClick={fetchEvidence}
          className="text-xs font-typewriter text-black underline hover:text-[#cc0000]"
        >
          Re-issue Press Query
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fffdf7] border-4 border-black p-6 space-y-6 shadow-[6px_6px_0px_#1a1815]">
      <div>
        <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700 block mb-2">
          EDITORIAL FINDINGS SUMMARY
        </span>
        <p className="text-base font-serif-headline text-black leading-relaxed italic border-l-4 border-black pl-4">
          "{evidence.summary_sentence}"
        </p>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700 block">
          CONTRIBUTING SIGNAL WEIGHTS (SHAP ANALYSIS)
        </span>
        {evidence.feature_breakdown?.length > 0 ? (
          evidence.feature_breakdown.map((f, i) => <FeatureBar key={i} {...f} />)
        ) : (
          <p className="text-xs font-typewriter text-slate-600">No dominant features recorded.</p>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t-2 border-black">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700">
            HIGHLIGHTED PRESS TOKEN ANALYSIS (LIME)
          </span>
          <div className="flex items-center gap-3 text-[10px] font-typewriter text-slate-700 uppercase">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#cc0000]/60 border border-black inline-block" /> toward fake
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#008000]/60 border border-black inline-block" /> toward real
            </span>
          </div>
        </div>
        <div className="bg-[#f7f3e9] border-2 border-black p-4 max-h-64 overflow-y-auto">
          {evidence.highlighted_tokens?.length > 0 ? (
            <HighlightedText tokens={evidence.highlighted_tokens} />
          ) : (
            <p className="text-xs font-typewriter text-slate-600">No highlighted tokens returned.</p>
          )}
        </div>
      </div>
    </div>
  );
}