// src/context/AnalysisContext.jsx
//
// Holds all Analyzer page state (input text, current result, batch state, etc.)
// at a level ABOVE the tab/route switching, so navigating to Review Queue or
// How It Works and back does not reset the current analysis.
import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showFullScrapedText, setShowFullScrapedText] = useState(false);
  const [explainStatus, setExplainStatus] = useState('idle');
  const [explanation, setExplanation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Batch processing state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const value = {
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
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error('useAnalysis must be used within an <AnalysisProvider>. ' +
      'Make sure main.jsx wraps <App /> with <AnalysisProvider>.');
  }
  return ctx;
}