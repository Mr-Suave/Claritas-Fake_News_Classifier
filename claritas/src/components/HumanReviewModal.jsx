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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-indigo-400" />
            <span>Human-In-The-Loop Audit Review</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-white text-lg">Added to Review List</h4>
            <p className="text-xs text-slate-400">Review recorded! Claritas will remember this verdict.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Analyzed Text Sample</span>
              <p className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono max-h-28 overflow-y-auto">
                {currentResult.cleaned_text}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Auditor Assessment</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDecision('confirm')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    decision === 'confirm'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Model Correct</span>
                </button>

                <button
                  onClick={() => setDecision('relabel')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    decision === 'relabel'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>False Positive / Incorrect</span>
                </button>
              </div>

              {decision === 'relabel' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-indigo-400 uppercase font-mono">Correct Auditor Verdict</label>
                  <select
                    value={auditorVerdict}
                    onChange={(e) => setAuditorVerdict(e.target.value)}
                    className="w-full bg-slate-950 border border-indigo-800/80 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Likely Misinformation">Likely Misinformation</option>
                    <option value="Likely Real">Likely Real</option>
                    <option value="Uncertain">Uncertain</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-mono">Audit Explanation Notes</label>
              <textarea
                rows={3}
                placeholder="Describe why the model was right or wrong..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Add to Review List</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}