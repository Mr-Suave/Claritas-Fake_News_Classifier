// src/pages/HowItWorksPage.jsx
import React from 'react';
import { 
  BrainCircuit, TreePine, MessageSquareText, Cpu, ScrollText, ZoomIn
} from 'lucide-react';

// 1. Import your PNG image here
import flowchartImg from '../assets/how-it-works.png'; 

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
    </div>
  );
}