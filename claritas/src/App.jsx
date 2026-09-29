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
      <div className="min-h-screen bg-[#f7f3e9] text-[#1a1815] font-serif-headline selection:bg-[#cc0000] selection:text-white news-paper">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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