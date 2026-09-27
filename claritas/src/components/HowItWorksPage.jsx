// src/pages/HowItWorksPage.jsx
import React from 'react';
import { 
  BrainCircuit, TreePine, MessageSquareText, Cpu, ScrollText, ZoomIn,
  Target, CheckCircle2, Crosshair, Gauge, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';

// 1. Import your PNG image here
import flowchartImg from '../assets/how-it-works.png'; 

// ---------------------------------------------------------
// Evaluation results from the held-out test split (n = 8,980)
// Update these values if you re-train / re-evaluate the model
// ---------------------------------------------------------
const METRICS = {
  accuracy: 0.9993,
  precision: 1.0000,
  recall: 0.9987,
  f1: 0.9994,
  auc: 0.99999,
};

const CONFUSION_MATRIX = {
  trueReal: 4284,
  falseFake: 0,   // false positives: real flagged as fake
  falseReal: 6,   // false negatives: fake flagged as real
  trueFake: 4690,
};

const SUPPORT = {
  real: 4284,
  fake: 4696,
  total: 8980,
};

function MetricCard({ icon: Icon, label, value, accent, suffix = '%' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-2 shadow-xl">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent.bg}`}>
        <Icon className={`w-4.5 h-4.5 ${accent.text}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-white tracking-tight">
          {value}{suffix}
        </p>
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Architecture & <span className="text-indigo-400">Data Flow</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Claritas blends Transformer embeddings with calibrated LightGBM decision trees and local explainable LLM generation.
        </p>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Explanatory Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span>Layer 1: Deep Fine-Tuned DistilRoBERTa</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processes raw clean text to evaluate linguistic style, vocabulary density, and syntactic patterns, generating a foundational misinformation probability score.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TreePine className="w-5 h-5 text-emerald-400" />
              <span>Layer 2: Calibrated LightGBM Meta-Classifier</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Blends the Layer 1 transformer score with 9 engineered feature metrics (TextBlob polarity, VADER compound sentiment, capital letter ratios, and Flesch reading ease scores) into calibrated probabilities.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5 text-cyan-400" />
              <span>Explainable Local Ollama Engine</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When triggered, a locally hosted LLM interprets feature contributions to generate clear, plain-English audit summaries without leaking external API tokens.
            </p>
          </div>
        </div>

        {/* Right Column: Purple Scrollable Box for your PNG Image */}
        <div className="lg:col-span-7 bg-purple-950/40 border border-purple-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4 sticky top-6">
          <div className="flex items-center justify-between border-b border-purple-800/50 pb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-purple-300" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
                System Data Pipeline
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-purple-300/80">
              <ScrollText className="w-3.5 h-3.5" />
              <span>Scroll / Zoom to view full diagram</span>
            </div>
          </div>

          {/* Scrollable Container with PNG Image */}
          <div className="overflow-auto max-h-[600px] rounded-2xl border border-purple-900/50 bg-slate-950/50 p-4 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-950/50">
            <a href={flowchartImg} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in group">
              <img 
                src={flowchartImg} 
                alt="Claritas Architecture Flowchart" 
                className="min-w-[650px] w-full h-auto object-contain rounded-xl group-hover:opacity-90 transition duration-300" 
              />
            </a>
          </div>
        </div>

      </div>

      {/* Model Evaluation Results Section */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Model <span className="text-emerald-400">Evaluation Results</span>
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl mx-auto">
            Held-out test split &middot; {SUPPORT.total.toLocaleString()} samples &middot; calibrated LightGBM meta-classifier output
          </p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MetricCard
            icon={Target}
            label="Accuracy"
            value={(METRICS.accuracy * 100).toFixed(2)}
            accent={{ bg: 'bg-indigo-500/10', text: 'text-indigo-400' }}
          />
          <MetricCard
            icon={Crosshair}
            label="Precision"
            value={(METRICS.precision * 100).toFixed(2)}
            accent={{ bg: 'bg-emerald-500/10', text: 'text-emerald-400' }}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Recall"
            value={(METRICS.recall * 100).toFixed(2)}
            accent={{ bg: 'bg-cyan-500/10', text: 'text-cyan-400' }}
          />
          <MetricCard
            icon={Gauge}
            label="F1 Score"
            value={(METRICS.f1 * 100).toFixed(2)}
            accent={{ bg: 'bg-purple-500/10', text: 'text-purple-400' }}
          />
          <MetricCard
            icon={TrendingUp}
            label="AUC"
            value={(METRICS.auc * 100).toFixed(2)}
            accent={{ bg: 'bg-amber-500/10', text: 'text-amber-400' }}
          />
        </div>

        {/* Confusion Matrix + Failure Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Confusion Matrix */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Confusion Matrix</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="text-slate-500">
                    <th className="p-2"></th>
                    <th className="p-2 font-normal uppercase tracking-wider">Predicted Real</th>
                    <th className="p-2 font-normal uppercase tracking-wider">Predicted Fake</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 text-slate-500 uppercase tracking-wider text-left">Actual Real</td>
                    <td className="p-3 bg-emerald-500/10 border border-emerald-800/40 rounded-lg text-emerald-300 font-bold text-base">
                      {CONFUSION_MATRIX.trueReal.toLocaleString()}
                    </td>
                    <td className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg text-slate-400 font-bold text-base">
                      {CONFUSION_MATRIX.falseFake}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-500 uppercase tracking-wider text-left">Actual Fake</td>
                    <td className="p-3 bg-amber-500/10 border border-amber-800/40 rounded-lg text-amber-300 font-bold text-base">
                      {CONFUSION_MATRIX.falseReal}
                    </td>
                    <td className="p-3 bg-emerald-500/10 border border-emerald-800/40 rounded-lg text-emerald-300 font-bold text-base">
                      {CONFUSION_MATRIX.trueFake.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Support: {SUPPORT.real.toLocaleString()} real &middot; {SUPPORT.fake.toLocaleString()} fake &middot; {SUPPORT.total.toLocaleString()} total
            </p>
          </div>

          {/* Failure Case Summary */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Failure Case Analysis</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
                <span className="text-xs text-slate-400">False Positives <span className="text-slate-600">(real flagged as fake)</span></span>
                <span className="text-lg font-black text-emerald-400">{CONFUSION_MATRIX.falseFake}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
                <span className="text-xs text-slate-400">False Negatives <span className="text-slate-600">(fake flagged as real)</span></span>
                <span className="text-lg font-black text-amber-400">{CONFUSION_MATRIX.falseReal}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-800">
              Zero false positives means no genuine article was incorrectly flagged in this split.
              The 6 false negatives are being reviewed as candidates for the human-in-the-loop
              relabeling queue, and cross-dataset testing (LIAR) is used separately to probe
              generalization beyond ISOT's source-style patterns.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}