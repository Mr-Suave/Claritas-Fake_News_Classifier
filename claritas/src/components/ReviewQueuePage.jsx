// src/pages/ReviewQueuePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Eye, X, MessageSquare, ArrowUpDown, Newspaper } from 'lucide-react';
import { fetchAllReviews } from '../services/api';

export default function ReviewQueuePage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchAllReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return (b.id || 0) - (a.id || 0);
      }
      if (sortBy === 'date_asc') {
        return (a.id || 0) - (b.id || 0);
      }
      if (sortBy === 'model_verdict') {
        return (a.model_verdict || '').localeCompare(b.model_verdict || '');
      }
      if (sortBy === 'auditor_verdict') {
        return (a.auditor_verdict || '').localeCompare(b.auditor_verdict || '');
      }
      return 0;
    });
  }, [reviews, sortBy]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="border-b-4 border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-black text-[#f4efe6] px-2.5 py-0.5 font-typewriter font-bold text-[10px] uppercase tracking-widest mb-1">
            EDITORIAL ARCHIVE RECORD
          </div>
          <h2 className="text-3xl font-blackletter text-black uppercase font-extrabold flex items-center space-x-2">
            <UserCheck className="w-7 h-7 text-black" />
            <span>Human-In-The-Loop Audit Ledger</span>
          </h2>
          <p className="text-xs font-serif-headline text-slate-800 mt-1 italic">
            Official record of news claims audited, verified, or relabeled by newsroom editors.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-typewriter">
          <div className="flex items-center space-x-1.5 bg-[#fffdf7] border-2 border-black px-3 py-1.5 text-xs text-black shadow-[2px_2px_0px_#1a1815]">
            <ArrowUpDown className="w-3.5 h-3.5 text-black" />
            <span className="text-[10px] uppercase font-bold text-slate-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-black focus:outline-none cursor-pointer font-bold uppercase"
            >
              <option value="date_desc">Latest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="model_verdict">Model Verdict</option>
              <option value="auditor_verdict">Auditor Verdict</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadReviews}
            className="text-xs font-typewriter font-bold text-black hover:text-[#cc0000] underline uppercase"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-typewriter text-black uppercase font-bold">
          Loading archived review ledger...
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="p-12 text-center bg-[#fffdf7] border-4 border-black space-y-2 shadow-[6px_6px_0px_#1a1815]">
          <UserCheck className="w-10 h-10 text-black mx-auto" />
          <h3 className="text-base font-typewriter font-bold text-black uppercase">No Audited Items Logged</h3>
          <p className="text-xs font-serif-headline text-slate-700">
            Audit any scanned claim from the Analyzer tab using "Audit Result" to record it in this ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((item) => (
            <div
              key={item.id}
              className="bg-[#fffdf7] border-4 border-black p-5 flex items-center justify-between gap-4 shadow-[4px_4px_0px_#1a1815] hover:shadow-[6px_6px_0px_#1a1815] transition"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center space-x-2 font-typewriter flex-wrap gap-y-1">
                  <span className="text-[10px] text-slate-700 uppercase font-bold">Claritas Model:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold border-2 uppercase ${
                      item.model_verdict === 'Likely Misinformation'
                        ? 'bg-[#fff0f0] border-[#cc0000] text-[#cc0000]'
                        : 'bg-[#f0fff0] border-[#008000] text-[#008000]'
                    }`}
                  >
                    {item.model_verdict}
                  </span>

                  <span className="text-[10px] text-slate-700 uppercase font-bold">→ Editor:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold border-2 uppercase ${
                      item.auditor_verdict === 'Likely Misinformation'
                        ? 'bg-[#fff0f0] border-[#cc0000] text-[#cc0000]'
                        : 'bg-[#f0fff0] border-[#008000] text-[#008000]'
                    }`}
                  >
                    {item.auditor_verdict}
                  </span>
                </div>

                <p className="text-sm text-black font-serif-headline line-clamp-2 leading-relaxed italic">
                  "{item.cleaned_text || item.raw_text}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(item)}
                className="p-3 bg-black hover:bg-[#cc0000] text-[#f4efe6] border-2 border-black transition flex items-center space-x-1 cursor-pointer font-typewriter font-bold text-xs uppercase shadow-[2px_2px_0px_#1a1815]"
                title="Inspect Review Details"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Inspect Record</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Inspector Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#fffdf7] border-4 border-black p-6 max-w-xl w-full shadow-[8px_8px_0px_#1a1815] space-y-5 animate-in fade-in zoom-in-95 duration-200 font-typewriter">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h3 className="font-bold text-black text-base uppercase flex items-center space-x-2">
                <Eye className="w-5 h-5 text-black" />
                <span>ARCHIVED AUDIT INSPECTION</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="p-1 text-black hover:bg-black hover:text-[#f4efe6] transition border border-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-700 uppercase font-bold">SUBMITTED PRESS TEXT</span>
              <div className="text-xs bg-[#f7f3e9] p-3 border-2 border-black text-black font-serif-headline max-h-36 overflow-y-auto leading-relaxed">
                {selectedReview.raw_text || selectedReview.cleaned_text}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f7f3e9] p-3 border-2 border-black space-y-1">
                <span className="text-[10px] text-slate-700 uppercase block font-bold">MODEL VERDICT</span>
                <span className="text-xs font-bold text-black block uppercase">{selectedReview.model_verdict}</span>
              </div>

              <div className="bg-[#f7f3e9] p-3 border-2 border-black space-y-1">
                <span className="text-[10px] text-slate-700 uppercase block font-bold">EDITOR VERDICT</span>
                <span className="text-xs font-bold text-[#008000] block uppercase">{selectedReview.auditor_verdict}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-700 uppercase flex items-center space-x-1 font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-black" />
                <span>EDITOR NOTE RECORD</span>
              </span>
              <div className="bg-[#f7f3e9] p-3 border-2 border-black text-xs text-black font-serif-headline italic">
                "{selectedReview.note || "No custom note supplied."}"
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReview(null)}
              className="w-full bg-black hover:bg-[#cc0000] text-[#f4efe6] font-bold py-2.5 text-xs uppercase tracking-wider transition border-2 border-black shadow-[3px_3px_0px_#1a1815] cursor-pointer"
            >
              Close Record Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}