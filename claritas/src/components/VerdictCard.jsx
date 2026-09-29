// VerdictCard.jsx - Tabloid style verdict card with newspaper stamp aesthetic
import { EvidencePanel } from './EvidencePanel';

export function VerdictCard({ confidence, verdict, text, misinformationProb, apiBaseUrl }) {
  const getBadgeStyle = () => {
    if (verdict === 'Likely Misinformation') {
      return 'border-[#cc0000] text-[#cc0000] bg-[#fff0f0] shadow-[4px_4px_0px_#cc0000]';
    }
    if (verdict === 'Likely Real') {
      return 'border-[#008000] text-[#008000] bg-[#f0fff0] shadow-[4px_4px_0px_#008000]';
    }
    return 'border-[#d97706] text-[#b45309] bg-[#fffbeb] shadow-[4px_4px_0px_#d97706]';
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fffdf7] border-4 border-black p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[6px_6px_0px_#1a1815] relative overflow-hidden">
        
        {/* Decorative corner tag */}
        <div className="absolute -top-3 -right-3 bg-black text-[#f4efe6] font-typewriter text-[10px] px-4 py-1 uppercase font-bold transform rotate-6 border border-black">
          Official Verdict Print
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className={`px-5 py-3 border-4 font-typewriter uppercase tracking-wider text-xl sm:text-2xl font-black rotate-[-2deg] ${getBadgeStyle()}`}>
            {verdict}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700 block">CLASSIFICATION REPORT VERDICT</span>
            <h3 className="text-xl font-serif-headline font-bold text-black italic">
              "{verdict === 'Likely Misinformation' ? 'Fabricated or Highly Unreliable Claim Detected' : verdict === 'Likely Real' ? 'Verified Authentic Reporting Style' : 'Ambiguous / Needs Human Verification'}"
            </h3>
          </div>
        </div>

        <div className="text-center sm:text-right border-t-2 sm:border-t-0 sm:border-l-2 border-black pt-4 sm:pt-0 sm:pl-6 shrink-0">
          <span className="text-[10px] font-typewriter uppercase tracking-widest text-slate-700 block">AI CONFIDENCE SCORE</span>
          <span className="text-4xl sm:text-5xl font-typewriter font-black text-black">{confidence}%</span>
        </div>
      </div>

      <EvidencePanel
        text={text}
        verdict={verdict}
        misinformationProb={misinformationProb}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}