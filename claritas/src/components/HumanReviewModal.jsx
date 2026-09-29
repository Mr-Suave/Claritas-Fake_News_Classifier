// src/components/HumanReviewModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { submitReviewFeedback } from '../services/api';

export default function HumanReviewModal({ isOpen, onClose, currentResult, onReviewSubmitted }) {
  if (!isOpen || !currentResult) return null;

  const [decision, setDecision] = useState('confirm'); // 'confirm' | 'relabel'
  const [auditorVerdict, setAuditorVerdict] = useState(
    currentResult.verdict === 'Likely Misinformation' ? 'Likely Real' : 'Likely Misinformation'
  );
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const finalAuditorVerdict = decision === 'confirm' ? currentResult.verdict : auditorVerdict;

    const payload = {
      id: currentResult.id,
      raw_text: currentResult.raw_text || currentResult.cleaned_text,
      cleaned_text: currentResult.cleaned_text,
      model_verdict: currentResult.verdict,
      action: decision,
      auditor_verdict: finalAuditorVerdict,
      note: notes
    };

    const res = await submitReviewFeedback(payload);
    
    if (onReviewSubmitted && res.review) {
      onReviewSubmitted(res.review);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#fffdf7] border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_#1a1815] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b-2 border-black pb-3">
          <h3 className="font-serif-headline font-bold text-black text-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#cc0000]" />
            <span className="uppercase tracking-wide font-typewriter">Press Bureau Audit Review</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-black hover:bg-black hover:text-[#f4efe6] transition border border-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#008000] mx-auto animate-bounce" />
            <h4 className="font-typewriter font-bold text-black text-lg uppercase">Audit Logged To Desk</h4>
            <p className="text-xs font-serif-headline text-slate-700">Audit recorded! The Claritas Gazette archive updated.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <span className="text-[10px] font-typewriter text-slate-700 uppercase">INSPECTED PRESS WIRE TEXT</span>
              <p className="text-xs bg-[#f7f3e9] p-3 border-2 border-black text-black font-serif-headline max-h-28 overflow-y-auto leading-relaxed">
                {currentResult.cleaned_text}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-typewriter text-slate-700 uppercase">EDITOR ASSESSMENT</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('confirm')}
                  className={`p-3 border-2 font-typewriter text-xs font-bold uppercase transition flex items-center justify-center space-x-2 ${
                    decision === 'confirm'
                      ? 'bg-[#f0fff0] border-[#008000] text-[#008000] shadow-[2px_2px_0px_#008000]'
                      : 'bg-[#fffdf7] border-black text-black hover:bg-[#f7f3e9]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Model Correct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('relabel')}
                  className={`p-3 border-2 font-typewriter text-xs font-bold uppercase transition flex items-center justify-center space-x-2 ${
                    decision === 'relabel'
                      ? 'bg-[#fff0f0] border-[#cc0000] text-[#cc0000] shadow-[2px_2px_0px_#cc0000]'
                      : 'bg-[#fffdf7] border-black text-black hover:bg-[#f7f3e9]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Incorrect Verdict</span>
                </button>
              </div>

              {decision === 'relabel' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-typewriter text-[#cc0000] uppercase">CORRECT EDITOR VERDICT</label>
                  <select
                    value={auditorVerdict}
                    onChange={(e) => setAuditorVerdict(e.target.value)}
                    className="w-full bg-[#f7f3e9] border-2 border-black p-2.5 text-xs text-black font-typewriter font-bold uppercase focus:outline-none"
                  >
                    <option value="Likely Misinformation">Likely Misinformation</option>
                    <option value="Likely Real">Likely Real</option>
                    <option value="Uncertain">Uncertain</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-typewriter text-slate-700 uppercase">EDITOR'S AUDIT DISCLOSURE NOTE</label>
              <textarea
                rows={3}
                placeholder="Log why the model was right or wrong for the record..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#f7f3e9] border-2 border-black p-3 text-xs text-black font-serif-headline focus:outline-none resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-[#cc0000] text-[#f4efe6] font-typewriter font-bold py-3 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-[3px_3px_0px_#1a1815] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Record Editorial Review</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}