// src/pages/AnalyzerPage.jsx
import React from 'react';
import {
  Upload, RefreshCw, BrainCircuit, UserCheck, Eye, EyeOff,
  Download, AlertTriangle, CheckCircle2, History, X, Layers,
  Link, ArrowRight
} from 'lucide-react';
import { analyzeClaim, getOllamaExplanation } from '../services/api';
import HumanReviewModal from '../components/HumanReviewModal';
import { VerdictCard } from '../components/VerdictCard';
import ReactMarkdown from 'react-markdown';
import { useAnalysis } from '../context/AnalysisContext';

export default function AnalyzerPage() {
  const {
    inputText, setInputText,
    file, setFile,
    status, setStatus,
    result, setResult,
    toast, setToast,
    showFullScrapedText, setShowFullScrapedText,
    explainStatus, setExplainStatus,
    explanation, setExplanation,
    isModalOpen, setIsModalOpen,
    isBatchModalOpen, setIsBatchModalOpen,
    batchInput, setBatchInput,
    batchResults, setBatchResults,
    isBatchProcessing, setIsBatchProcessing,
    batchProgress, setBatchProgress,
  } = useAnalysis();

  const sourceHistory = [
    { id: 1, date: '2026-09-20', score: 88, verdict: 'Likely Real' },
    { id: 2, date: '2026-09-22', score: 92, verdict: 'Likely Real' },
    { id: 3, date: '2026-09-25', score: 74, verdict: 'Uncertain' },
    { id: 4, date: 'Current Scan', score: result?.confidence_score || 85, verdict: result?.verdict || 'Likely Real' }
  ];

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      const reader = new FileReader();
      reader.onload = (event) => setInputText(event.target.result);
      reader.readAsText(uploaded);
    }
  };

  const handleStartAnalysis = async () => {
    if (!inputText.trim()) return;

    setStatus('scanning');
    setResult(null);
    setExplainStatus('idle');
    setExplanation('');

    const res = await analyzeClaim({ text: inputText });

    if (res.success) {
      setResult(res.data);
      setStatus('analyzed');
      showToast("Claim successfully scanned and classified!", "success");
    } else {
      showToast(res.error, "error");
      setInputText('');
      setFile(null);
      setStatus('idle');
    }
  };

  const handleStartBatchProcessing = async () => {
    const items = batchInput
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    setIsBatchProcessing(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: items.length });

    const resultsAccumulator = [];

    for (let i = 0; i < items.length; i++) {
      const itemText = items[i];
      setBatchProgress({ current: i + 1, total: items.length });

      const res = await analyzeClaim({ text: itemText });
      if (res.success) {
        resultsAccumulator.push({
          input: itemText,
          status: 'success',
          data: res.data
        });
      } else {
        resultsAccumulator.push({
          input: itemText,
          status: 'error',
          error: res.error
        });
      }
      setBatchResults([...resultsAccumulator]);
    }

    setIsBatchProcessing(false);
    showToast(`Batch processing completed for ${items.length} items!`, "success");
  };

  // Inspect specific batch result in Analyzer View
  const handleSelectBatchResult = (batchItem) => {
    if (batchItem.status !== 'success') return;

    setInputText(batchItem.input);
    setResult(batchItem.data);
    setStatus('analyzed');
    setExplainStatus('idle');
    setExplanation('');
    setIsBatchModalOpen(false);

    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    if (!result) return;
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Verdict,Confidence,MisinformationProb,Text\n" +
      `"${result.id}","${result.verdict}","${result.confidence_score}%","${result.misinformation_prob}","${result.cleaned_text.replace(/"/g, '""')}"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `claritas_report_${result.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLearnMore = async () => {
    if (!result) return;
    setExplainStatus('explaining');

    const xaiOutput = await getOllamaExplanation({
      text: result.cleaned_text,
      verdict: result.verdict,
      confidence: result.confidence_score,
      metrics: result.linguistic_metrics
    });

    setExplanation(xaiOutput);
    setExplainStatus('done');
  };

  const isInputUrl = result?.raw_text?.trim().startsWith('http://') || result?.raw_text?.trim().startsWith('https://');

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 relative">
      {/* Toast Notification Bar */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center space-x-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-800 text-rose-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Claritas <span className="text-indigo-400">Trust Engine</span>
        </h1>
        <p className="text-slate-400 text-m max-w-xl mx-auto">
          Scan claims, URLs, or documents with two-layer ensemble models and local explainable AI.
        </p>
      </div>

      {/* Input Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-4">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste news link (https://...), claim text, or drag & drop text file here..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>{file ? file.name : "Import Text/CSV File"}</span>
                <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Process in Batch Button */}
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Process in Batch</span>
              </button>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={status === 'scanning' || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {status === 'scanning' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>{status === 'scanning' ? "Scanning Content..." : "Analyze Claim"}</span>
            </button>
          </div>
        </div>

        {/* Results Visualizer */}
        {status === 'analyzed' && result && (
          <div className="border-t border-slate-800 pt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* URL Extracted Text Preview Card */}
            {isInputUrl && (
              <div className="bg-slate-950 border border-indigo-900/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold font-mono uppercase text-indigo-300">
                      Extracted URL Content Preview
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowFullScrapedText(!showFullScrapedText)}
                    className="flex items-center space-x-1 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    {showFullScrapedText ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Collapse Preview</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                  <p className={showFullScrapedText ? "" : "line-clamp-3"}>
                    {result.cleaned_text}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Source URL: {result.raw_text}</span>
                  <span>Word Count: {result.linguistic_metrics?.word_count || 0} words</span>
                </div>
              </div>
            )}

            {/* Disagreement Badge */}
            {result.has_layer_disagreement && (
              <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-300 font-mono">
                <span className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Layer Disagreement Detected: RoBERTa vs LightGBM differ by {result.disagreement_delta}%</span>
                </span>
                <span className="bg-amber-900/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Ensemble Active</span>
              </div>
            )}

            <VerdictCard
              confidence={result.confidence_score}
              verdict={result.verdict}
              text={result.cleaned_text}
              misinformationProb={result.misinformation_prob}
            />

            {/* Feature Contribution Bars */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-indigo-400">Linguistic Signal Drivers</h4>
              <div className="space-y-2">
                {result.feature_contributions?.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>{feat.name}</span>
                      <span>{feat.value}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className={`${feat.color} h-full transition-all duration-700`} style={{ width: `${feat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Credibility Timeline */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-indigo-400 flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Source Credibility Trend</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sourceHistory.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block">{item.date}</span>
                    <span className="text-sm font-black text-indigo-300 block">{item.score}%</span>
                    <span className="text-[9px] font-mono text-slate-400">{item.verdict}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions & Export */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLearnMore}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>{explainStatus === 'explaining' ? "Asking Local Ollama..." : "Explain with Ollama"}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV Report</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Audit Result</span>
              </button>
            </div>

            {explainStatus === 'done' && (
              <div className="glass-card p-5 rounded-2xl text-xs text-slate-300">
                <div className="prose prose-invert prose-xs max-w-none prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Processing Modal with Clickable Results */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Batch Processing Pipeline</span>
              </h3>
              <button
                onClick={() => {
                  if (!isBatchProcessing) setIsBatchModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                disabled={isBatchProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-mono">
                Input Batch Entries (One URL or Text Claim per line)
              </label>
              <textarea
                rows={4}
                disabled={isBatchProcessing}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={"https://example.com/article-1\nClaim 2 text here...\nhttps://example.com/article-3"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none disabled:opacity-50"
              />
            </div>

            {isBatchProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-indigo-300">
                  <span>Processing item {batchProgress.current} of {batchProgress.total}...</span>
                  <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Clickable Batch Execution Results */}
            {batchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    Batch Execution Results (Click any item to view detailed report)
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {batchResults.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectBatchResult(res)}
                      className={`bg-slate-950 border rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs font-mono transition group ${
                        res.status === 'success'
                          ? 'border-slate-800 hover:border-indigo-500 hover:bg-slate-900/90 cursor-pointer'
                          : 'border-rose-900/50 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className="text-slate-500 mr-2">#{idx + 1}</span>
                        <span className="text-slate-200 group-hover:text-indigo-300 transition">
                          {res.input}
                        </span>
                      </div>

                      {res.status === 'success' ? (
                        <div className="flex items-center space-x-2 shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 ${
                              res.data.verdict === 'Likely Misinformation'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                : res.data.verdict === 'Likely Real'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            }`}
                          >
                            <span>{res.data.verdict} ({res.data.confidence_score}%)</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </span>
                        </div>
                      ) : (
                        <span className="bg-rose-950 text-rose-400 px-2 py-0.5 rounded text-[10px] border border-rose-800 shrink-0">
                          Failed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleStartBatchProcessing}
                disabled={isBatchProcessing || !batchInput.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {isBatchProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>{isBatchProcessing ? "Processing Batch..." : "Run Batch Analysis"}</span>
              </button>

              <button
                onClick={() => setIsBatchModalOpen(false)}
                disabled={isBatchProcessing}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <HumanReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentResult={result} />
    </div>
  );
}