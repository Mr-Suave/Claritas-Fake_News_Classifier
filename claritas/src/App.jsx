// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnalyzerPage from './components/AnalyzerPage';
import ReviewQueuePage from './components/ReviewQueuePage';
import HowItWorksPage from './components/HowItWorksPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<AnalyzerPage />} />
            <Route path="/review" element={<ReviewQueuePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}