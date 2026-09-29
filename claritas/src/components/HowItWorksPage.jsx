// src/pages/HowItWorksPage.jsx
import React from 'react';
import { 
  BrainCircuit, TreePine, MessageSquareText, Cpu, ScrollText, ZoomIn,
  Target, CheckCircle2, Crosshair, Gauge, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';

import flowchartImg from '../assets/how-it-works.png'; 

const METRICS = {
  accuracy: 0.9993,
  precision: 1.0000,
  recall: 0.9987,
  f1: 0.9994,
  auc: 0.99999,
};

const CONFUSION_MATRIX = {
  trueReal: 4284,
  falseFake: 0,   
  falseReal: 6,   
  trueFake: 4690,
};

const SUPPORT = {
  real: 4284,
  fake: 4696,
  total: 8980,
};

function MetricCard({ icon: Icon, label, value, suffix = '%' }) {
  return (
    <div className="bg-[#fffdf7] border-4 border-black p-5 flex flex-col space-y-2 shadow-[4px_4px_0px_#1a1815]">
      <div className="w-8 h-8 bg-black text-[#f4efe6] flex items-center justify-center font-bold">
        <Icon className="w-4 h-4 text-[#f4efe6]" />
      </div>
      <div>
        <p className="text-2xl font-typewriter font-black text-black tracking-tight">
          {value}{suffix}
        </p>
        <p className="text-[10px] font-typewriter uppercase tracking-wider text-slate-700 mt-0.5 font-bold">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 py-2 px-2">
      {/* Header */}
      <div className="text-center space-y-2 border-b-4 border-black pb-6">
        <div className="inline-block bg-black text-[#f4efe6] px-3 py-1 font-typewriter font-bold text-xs uppercase tracking-widest mb-1">
          TECHNICAL BLUEPRINT & ARCHITECTURE
        </div>
        <h1 className="text-4xl sm:text-6xl font-blackletter tracking-tight text-[#1a1815] font-extrabold uppercase">
          SYSTEM DATA PIPELINE
        </h1>
        <p className="text-slate-800 font-serif-headline text-base sm:text-lg italic max-w-2xl mx-auto">
          "Claritas blends Transformer embeddings with calibrated LightGBM decision trees and local explainable LLM generation."
        </p>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Explanatory Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdf7] border-4 border-black p-6 space-y-3 shadow-[6px_6px_0px_#1a1815]">
            <h3 className="text-sm font-typewriter font-bold text-black uppercase flex items-center space-x-2 border-b-2 border-black pb-2">
              <BrainCircuit className="w-5 h-5 text-black" />
              <span>Layer 1: Deep DistilRoBERTa</span>
            </h3>
            <p className="text-xs font-serif-headline text-black leading-relaxed">
              Processes raw clean text to evaluate linguistic style, vocabulary density, and syntactic patterns, generating a foundational misinformation probability score.
            </p>
          </div>

          <div className="bg-[#fffdf7] border-4 border-black p-6 space-y-3 shadow-[6px_6px_0px_#1a1815]">
            <h3 className="text-sm font-typewriter font-bold text-black uppercase flex items-center space-x-2 border-b-2 border-black pb-2">
              <TreePine className="w-5 h-5 text-black" />
              <span>Layer 2: Calibrated LightGBM</span>
            </h3>
            <p className="text-xs font-serif-headline text-black leading-relaxed">
              Blends the Layer 1 transformer score with 9 engineered feature metrics (TextBlob polarity, VADER compound sentiment, capital letter ratios, and Flesch reading ease scores) into calibrated probabilities.
            </p>
          </div>

          <div className="bg-[#fffdf7] border-4 border-black p-6 space-y-3 shadow-[6px_6px_0px_#1a1815]">
            <h3 className="text-sm font-typewriter font-bold text-black uppercase flex items-center space-x-2 border-b-2 border-black pb-2">
              <MessageSquareText className="w-5 h-5 text-black" />
              <span>Local Ollama XAI Engine</span>
            </h3>
            <p className="text-xs font-serif-headline text-black leading-relaxed">
              When triggered, a locally hosted LLM interprets feature contributions to generate clear, plain-English audit summaries without leaking external API tokens.
            </p>
          </div>
        </div>

        {/* Right Column: Newspaper Diagram Box */}
        <div className="lg:col-span-7 bg-[#fffdf7] border-4 border-black p-6 shadow-[8px_8px_0px_#1a1815] space-y-4 sticky top-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-black" />
              <h3 className="text-xs font-typewriter font-bold uppercase tracking-wider text-black">
                ARCHITECTURAL PRESS DIAGRAM
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-typewriter text-slate-700 font-bold uppercase">
              <ScrollText className="w-3.5 h-3.5" />
              <span>Scroll to inspect full schematic</span>
            </div>
          </div>

          {/* Scrollable Container with PNG Image */}
          <div className="overflow-auto max-h-[600px] border-2 border-black bg-[#f7f3e9] p-4">
            <a href={flowchartImg} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in group">
              <img 
                src={flowchartImg} 
                alt="Claritas Architecture Flowchart" 
                className="min-w-[650px] w-full h-auto object-contain rounded-none group-hover:opacity-90 transition duration-300 border border-black" 
              />
            </a>
          </div>
        </div>

      </div>

      {/* Model Evaluation Results Section */}
      <div className="space-y-6 pt-4 border-t-4 border-black">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-blackletter font-black tracking-tight text-black uppercase">
            MODEL EVALUATION VERIFICATION
          </h2>
          <p className="text-slate-800 font-serif-headline text-sm italic max-w-2xl mx-auto">
            Held-out test split &middot; {SUPPORT.total.toLocaleString()} samples &middot; calibrated LightGBM meta-classifier output
          </p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MetricCard
            icon={Target}
            label="Accuracy"
            value={(METRICS.accuracy * 100).toFixed(2)}
          />
          <MetricCard
            icon={Crosshair}
            label="Precision"
            value={(METRICS.precision * 100).toFixed(2)}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Recall"
            value={(METRICS.recall * 100).toFixed(2)}
          />
          <MetricCard
            icon={Gauge}
            label="F1 Score"
            value={(METRICS.f1 * 100).toFixed(2)}
          />
          <MetricCard
            icon={TrendingUp}
            label="AUC"
            value={(METRICS.auc * 100).toFixed(2)}
          />
        </div>

        {/* Confusion Matrix + Failure Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-typewriter">

          {/* Confusion Matrix */}
          <div className="lg:col-span-6 bg-[#fffdf7] border-4 border-black p-6 space-y-4 shadow-[6px_6px_0px_#1a1815]">
            <h3 className="text-sm font-bold text-black uppercase flex items-center space-x-2 border-b-2 border-black pb-2">
              <ShieldCheck className="w-5 h-5 text-black" />
              <span>CONFUSION MATRIX LEDGER</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-typewriter">
                <thead>
                  <tr className="text-black border-b-2 border-black">
                    <th className="p-2"></th>
                    <th className="p-2 font-bold uppercase tracking-wider">Predicted Real</th>
                    <th className="p-2 font-bold uppercase tracking-wider">Predicted Fake</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-2 text-slate-800 uppercase tracking-wider text-left font-bold">Actual Real</td>
                    <td className="p-3 bg-[#f0fff0] border-r border-black text-[#008000] font-black text-base">
                      {CONFUSION_MATRIX.trueReal.toLocaleString()}
                    </td>
                    <td className="p-3 bg-[#f7f3e9] text-black font-black text-base">
                      {CONFUSION_MATRIX.falseFake}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800 uppercase tracking-wider text-left font-bold">Actual Fake</td>
                    <td className="p-3 bg-[#fff0f0] border-r border-black text-[#cc0000] font-black text-base">
                      {CONFUSION_MATRIX.falseReal}
                    </td>
                    <td className="p-3 bg-[#f0fff0] text-[#008000] font-black text-base">
                      {CONFUSION_MATRIX.trueFake.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-serif-headline">
              Support: {SUPPORT.real.toLocaleString()} real &middot; {SUPPORT.fake.toLocaleString()} fake &middot; {SUPPORT.total.toLocaleString()} total
            </p>
          </div>

          {/* Failure Case Summary */}
          <div className="lg:col-span-6 bg-[#fffdf7] border-4 border-black p-6 space-y-4 shadow-[6px_6px_0px_#1a1815]">
            <h3 className="text-sm font-bold text-[#1a1815] uppercase flex items-center space-x-2 border-b-2 border-black pb-2">
              <AlertTriangle className="w-5 h-5 text-[#cc0000]" />
              <span>FAILURE CASE ANALYSIS</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#f7f3e9] border-2 border-black px-4 py-3">
                <span className="text-xs text-black font-bold">False Positives <span className="text-slate-600 font-normal">(real flagged as fake)</span></span>
                <span className="text-lg font-black text-[#008000]">{CONFUSION_MATRIX.falseFake}</span>
              </div>
              <div className="flex items-center justify-between bg-[#f7f3e9] border-2 border-black px-4 py-3">
                <span className="text-xs text-black font-bold">False Negatives <span className="text-slate-600 font-normal">(fake flagged as real)</span></span>
                <span className="text-lg font-black text-[#cc0000]">{CONFUSION_MATRIX.falseReal}</span>
              </div>
            </div>

            <p className="text-[11px] font-serif-headline text-slate-800 leading-relaxed pt-2 border-t-2 border-black">
              Zero false positives means no genuine article was incorrectly flagged in this split.
              The 6 false negatives are reviewed as candidates for the human-in-the-loop
              relabeling queue.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}