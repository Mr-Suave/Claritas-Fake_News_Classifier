// src/pages/ReviewQueuePage.jsx
import React, { useState, useEffect } from 'react';
import { UserCheck, Eye, X, ShieldAlert, ShieldCheck, HelpCircle, MessageSquare } from 'lucide-react';
import { fetchAllReviews } from '../services/api';

export default function ReviewQueuePage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchAllReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <span>Human-In-The-Loop Review Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            List of claims reviewed and saved by human auditors.
          </p>
        </div>
        <button
          onClick={loadReviews}
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500">
          Loading saved reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Audited Items Yet</h3>
          <p className="text-xs text-slate-500">
            Submit an audit from the Analyzer tab using "Add to Review List".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-500">Claritas Model:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      item.model_verdict === 'Likely Misinformation'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {item.model_verdict}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500">→ Auditor:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      item.auditor_verdict === 'Likely Misinformation'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {item.auditor_verdict}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 font-mono">
                  {item.cleaned_text || item.raw_text}
                </p>
              </div>

              {/* Eye Button to expand detail modal */}
              <button
                onClick={() => setSelectedReview(item)}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                title="Inspect Review Details"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">Inspect</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Inspector Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <span>Audited Claim Inspection</span>
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Preview */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">User Input Preview</span>
              <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono max-h-36 overflow-y-auto leading-relaxed">
                {selectedReview.raw_text || selectedReview.cleaned_text}
              </div>
            </div>

            {/* Verdict Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Claritas Model Verdict</span>
                <span className="text-xs font-bold text-indigo-400 block">{selectedReview.model_verdict}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Reviewer Verdict</span>
                <span className="text-xs font-bold text-emerald-400 block">{selectedReview.auditor_verdict}</span>
              </div>
            </div>

            {/* Reviewer Note */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center space-x-1">
                <MessageSquare className="w-3 h-3 text-indigo-400" />
                <span>Reviewer's Note</span>
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono italic">
                "{selectedReview.note || "No custom note supplied."}"
              </div>
            </div>

            <button
              onClick={() => setSelectedReview(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}