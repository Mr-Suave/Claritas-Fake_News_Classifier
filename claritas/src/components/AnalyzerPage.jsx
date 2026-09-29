// src/pages/AnalyzerPage.jsx
import React from 'react';
import {
  Upload, RefreshCw, BrainCircuit, UserCheck, Eye, EyeOff,
  Download, AlertTriangle, CheckCircle2, History, X, Layers,
  Link, ArrowRight, Newspaper
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

  const sourceHistory = result?.source_history || [];

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
    e.target.value = '';
  };

  const handleStartAnalysis = async (e) => {
    if (e) e.preventDefault();
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

  const handleStartBatchProcessing = async (e) => {
    if (e) e.preventDefault();

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

  const handleExportCSV = (e) => {
    if (e) e.preventDefault();
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

  const handleLearnMore = async (e) => {
    if (e) e.preventDefault();
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
    <div className="max-w-4xl mx-auto space-y-8 py-2 relative">
      {/* Toast Notification Bar */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 flex items-center space-x-3 p-4 border-4 shadow-[6px_6px_0px_#1a1815] font-typewriter font-bold text-xs uppercase ${
          toast.type === 'error' ? 'bg-[#fff0f0] border-[#cc0000] text-[#cc0000]' : 'bg-[#f0fff0] border-[#008000] text-[#008000]'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Tabloid Front Page Headline */}
      <div className="text-center space-y-2 border-b-4 border-black pb-6">
        <div className="inline-block bg-[#cc0000] text-white px-3 py-1 font-typewriter font-bold text-xs uppercase tracking-widest rotate-[-1deg] mb-1">
          LATEST PRESS SCANNER WIRE
        </div>
        <h1 className="text-4xl sm:text-6xl font-blackletter tracking-tight text-black font-extrabold uppercase">
          CLASSIFY ANY CLAIM OR URL
        </h1>
        <p className="text-slate-800 font-serif-headline text-base sm:text-lg italic max-w-2xl mx-auto">
          "Submit rumors, web articles, or wire text for instant two-layer neural audit and local explainable AI."
        </p>
      </div>

      {/* Input Container */}
      <div className="bg-[#fffdf7] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#1a1815] space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-slate-800">
              PRESS SUBMISSION WIRE INPUT
            </span>
            <span className="font-typewriter text-[10px] text-slate-600 uppercase">
              PLAIN TEXT OR ARTICLE URL
            </span>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste news link (https://...), claim text, or press report here to scan..."
            className="w-full bg-[#f7f3e9] border-2 border-black p-4 text-sm text-black placeholder-slate-600 focus:outline-none focus:bg-white transition resize-none font-serif-headline leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-black pt-4">
            <div className="flex items-center space-x-4">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2 text-xs font-typewriter font-bold text-black hover:text-[#cc0000] cursor-pointer transition uppercase"
              >
                <Upload className="w-4 h-4" />
                <span>{file ? file.name : "Import Press File (.txt/.csv)"}</span>
                <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Process in Batch Button */}
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-typewriter font-bold text-black hover:text-[#cc0000] transition cursor-pointer uppercase border-l-2 border-black pl-4"
              >
                <Layers className="w-4 h-4 text-black" />
                <span>Process Batch Wire</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={status === 'scanning' || !inputText.trim()}
              className="bg-black hover:bg-[#cc0000] text-[#f4efe6] font-typewriter font-bold px-6 py-3 border-2 border-black text-xs uppercase tracking-wider flex items-center space-x-2 transition shadow-[3px_3px_0px_#1a1815] cursor-pointer disabled:opacity-50"
            >
              {status === 'scanning' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>{status === 'scanning' ? "Scanning Wire..." : "ANALYZE CLAIM"}</span>
            </button>
          </div>
        </div>

        {/* Results Visualizer */}
        {status === 'analyzed' && result && (
          <div className="border-t-4 border-black pt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* URL Extracted Text Preview Card */}
            {isInputUrl && (
              <div className="bg-[#f7f3e9] border-2 border-black p-5 space-y-3 shadow-[4px_4px_0px_#1a1815]">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-black" />
                    <h4 className="text-xs font-typewriter font-bold uppercase text-black">
                      EXTRACTED WEB ARTICLE CONTENT PREVIEW
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullScrapedText(!showFullScrapedText)}
                    className="flex items-center space-x-1 text-xs font-typewriter font-bold text-black hover:text-[#cc0000] transition cursor-pointer uppercase"
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

                <div className="p-3 bg-[#fffdf7] border border-black text-xs text-black font-serif-headline leading-relaxed">
                  <p className={showFullScrapedText ? "" : "line-clamp-3"}>
                    {result.cleaned_text}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-typewriter text-slate-700">
                  <span>SOURCE URL: {result.raw_text}</span>
                  <span>WORD COUNT: {result.linguistic_metrics?.word_count || 0} WORDS</span>
                </div>
              </div>
            )}

            {/* Disagreement Badge */}
            {result.has_layer_disagreement && (
              <div className="p-4 bg-[#fff0f0] border-4 border-[#cc0000] flex items-center justify-between text-xs text-[#cc0000] font-typewriter font-bold shadow-[4px_4px_0px_#cc0000]">
                <span className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-[#cc0000]" />
                  <span>LAYER DISAGREEMENT DETECTED: RoBERTa vs LightGBM differ by {result.disagreement_delta}%</span>
                </span>
                <span className="bg-[#cc0000] text-white px-2 py-0.5 text-[10px] uppercase font-bold">Ensemble Active</span>
              </div>
            )}

            <VerdictCard
              confidence={result.confidence_score}
              verdict={result.verdict}
              text={result.cleaned_text}
              misinformationProb={result.misinformation_prob}
            />

            {/* Feature Contribution Bars */}
            <div className="bg-[#fffdf7] border-4 border-black p-5 space-y-3 shadow-[4px_4px_0px_#1a1815]">
              <h4 className="text-xs font-typewriter font-bold uppercase text-black border-b border-black pb-1">
                LINGUISTIC SIGNAL DRIVERS (SHAP INFLUENCE)
              </h4>
              <div className="space-y-3 pt-1">
                {result.feature_contributions?.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-typewriter font-bold text-black uppercase">
                      <span>{feat.name}</span>
                      <span>{feat.value}%</span>
                    </div>
                    <div className="w-full bg-[#e8e1d3] h-3 border border-black overflow-hidden">
                      <div className="bg-black h-full transition-all duration-700" style={{ width: `${feat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Credibility Trend Box */}
            <div className="bg-[#fffdf7] border-4 border-black p-5 shadow-[4px_4px_0px_#1a1815] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-base font-typewriter font-bold text-black uppercase flex items-center gap-2">
                  <span className="w-3 h-3 bg-black"></span>
                  SOURCE CREDIBILITY ARCHIVE
                </h3>
                {result?.domain && (
                  <span className="text-xs font-typewriter font-bold bg-[#1a1815] text-[#f4efe6] px-2 py-1 uppercase">
                    {result.domain}
                  </span>
                )}
              </div>

              {!result?.source_history || result.source_history.length === 0 || result?.domain === "Direct Input" ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-700 bg-[#f7f3e9] border-2 border-dashed border-black">
                  <p className="text-sm font-typewriter font-bold text-black uppercase">NO SOURCE HISTORY RECORDED</p>
                  <p className="text-xs font-serif-headline text-slate-700 mt-1">
                    {result?.domain === "Direct Input" 
                      ? "Historical domain tracking requires a web article URL." 
                      : "This domain has not been scanned enough times yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.source_history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-[#f7f3e9] border-2 border-black text-xs font-typewriter">
                      <div>
                        <p className="font-bold text-black">{item.date}</p>
                        <p className="text-slate-800">{item.verdict}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#cc0000]">{item.score}%</span>
                        <p className="text-[10px] text-slate-600 uppercase">Confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions & Export */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleLearnMore}
                className="flex-1 bg-black hover:bg-[#cc0000] text-[#f4efe6] font-typewriter font-bold py-3 px-4 border-2 border-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-[3px_3px_0px_#1a1815] cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>{explainStatus === 'explaining' ? "Asking Local Ollama..." : "Explain with Ollama"}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-[#fffdf7] hover:bg-[#f7f3e9] border-2 border-black text-black font-typewriter font-bold py-3 px-4 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-[3px_3px_0px_#1a1815] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-[#cc0000] text-[#f4efe6] font-typewriter font-bold py-3 px-4 border-2 border-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-[3px_3px_0px_#1a1815] cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Audit Result</span>
              </button>
            </div>

            {explainStatus === 'done' && (
              <div className="bg-[#fffdf7] border-4 border-black p-5 text-xs text-black font-serif-headline shadow-[4px_4px_0px_#1a1815]">
                <div className="prose max-w-none">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Processing Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#fffdf7] border-4 border-black p-6 max-w-2xl w-full shadow-[8px_8px_0px_#1a1815] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h3 className="font-typewriter font-bold text-black text-base uppercase flex items-center space-x-2">
                <Layers className="w-5 h-5 text-black" />
                <span>BATCH PRESS PIPELINE</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (!isBatchProcessing) setIsBatchModalOpen(false);
                }}
                className="p-1 text-black hover:bg-black hover:text-[#f4efe6] transition border border-black"
                disabled={isBatchProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-typewriter text-slate-700 uppercase">
                INPUT BATCH ENTRIES (ONE URL OR TEXT CLAIM PER LINE)
              </label>
              <textarea
                rows={4}
                disabled={isBatchProcessing}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={"https://example.com/article-1\nClaim 2 text here...\nhttps://example.com/article-3"}
                className="w-full bg-[#f7f3e9] border-2 border-black p-3 text-xs text-black font-typewriter focus:outline-none focus:bg-white resize-none disabled:opacity-50"
              />
            </div>

            {isBatchProcessing && (
              <div className="space-y-2 font-typewriter">
                <div className="flex justify-between text-xs font-bold text-black uppercase">
                  <span>Processing item {batchProgress.current} of {batchProgress.total}...</span>
                  <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-[#e8e1d3] h-3 border border-black overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Clickable Batch Execution Results */}
            {batchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-typewriter text-slate-700 uppercase font-bold">
                    BATCH EXECUTION RESULTS (CLICK ANY ITEM TO INSPECT)
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 font-typewriter">
                  {batchResults.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectBatchResult(res)}
                      className={`bg-[#f7f3e9] border-2 border-black p-3 flex items-center justify-between gap-3 text-xs transition ${
                        res.status === 'success'
                          ? 'hover:bg-black hover:text-[#f4efe6] cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className="mr-2 font-bold">#{idx + 1}</span>
                        <span>{res.input}</span>
                      </div>

                      {res.status === 'success' ? (
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="px-2 py-0.5 border border-black text-[10px] font-bold uppercase bg-[#fffdf7] text-black">
                            {res.data.verdict} ({res.data.confidence_score}%)
                          </span>
                        </div>
                      ) : (
                        <span className="bg-[#cc0000] text-white px-2 py-0.5 text-[10px] uppercase font-bold">
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
                type="button"
                onClick={handleStartBatchProcessing}
                disabled={isBatchProcessing || !batchInput.trim()}
                className="flex-1 bg-black hover:bg-[#cc0000] text-[#f4efe6] font-typewriter font-bold py-3 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition border-2 border-black shadow-[3px_3px_0px_#1a1815] cursor-pointer disabled:opacity-50"
              >
                {isBatchProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>{isBatchProcessing ? "Processing Batch..." : "RUN BATCH ANALYSIS"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                disabled={isBatchProcessing}
                className="bg-[#fffdf7] hover:bg-[#f7f3e9] border-2 border-black text-black font-typewriter font-bold py-3 px-5 text-xs uppercase transition cursor-pointer shadow-[3px_3px_0px_#1a1815] disabled:opacity-50"
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