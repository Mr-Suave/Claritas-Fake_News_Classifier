// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Activity, UserCheck, Compass, Newspaper } from 'lucide-react';

export default function Navbar() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="border-b-4 border-black bg-[#f4efe6] sticky top-0 z-50 shadow-md">
      {/* Top Banner Issue Line */}
      <div className="border-b border-black py-1 px-6 bg-[#1a1815] text-[#f4efe6] text-[11px] font-typewriter flex justify-between items-center tracking-widest uppercase">
        <span>Vol. CXXIV No. 42 &bull; Extra Edition</span>
        <span>{currentDate}</span>
        <span>Price: 50 Cents &bull; Truth Is Priceless</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Newspaper Title Masthead */}
        <NavLink to="/" className="flex items-center space-x-4 group text-center md:text-left">
          <div className="w-12 h-12 bg-black text-[#f4efe6] border-2 border-black flex items-center justify-center font-masthead font-black text-3xl shadow-[3px_3px_0px_#cc0000] group-hover:scale-105 transition">
            C
          </div>
          <div>
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <h1 className="font-masthead text-3xl sm:text-4xl tracking-wider text-black font-extrabold uppercase drop-shadow-sm">
                The Claritas Gazette
              </h1>
              <span className="text-[10px] font-typewriter bg-[#cc0000] text-white px-2 py-0.5 font-bold uppercase tracking-wider rotate-[-2deg]">
                XAI TRUST ENGINE
              </span>
            </div>
            <p className="text-xs font-serif-headline italic text-slate-800 tracking-wide">
              "All The News Fit To Scan — Powered By Two-Layer Ensemble AI & Local Ollama"
            </p>
          </div>
        </NavLink>

        {/* Newspaper Section Navigation Tabs */}
        <nav className="flex space-x-1 bg-[#e8e1d3] p-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#1a1815]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 text-xs font-typewriter font-bold uppercase transition ${
                isActive ? 'bg-black text-[#f4efe6] shadow-sm' : 'text-black hover:bg-[#d8cfbe]'
              }`
            }
          >
            <Activity className="w-4 h-4" />
            <span>Analyzer</span>
          </NavLink>

          <NavLink
            to="/review"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 text-xs font-typewriter font-bold uppercase transition ${
                isActive ? 'bg-black text-[#f4efe6] shadow-sm' : 'text-black hover:bg-[#d8cfbe]'
              }`
            }
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Queue</span>
          </NavLink>

          <NavLink
            to="/how-it-works"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 text-xs font-typewriter font-bold uppercase transition ${
                isActive ? 'bg-black text-[#f4efe6] shadow-sm' : 'text-black hover:bg-[#d8cfbe]'
              }`
            }
          >
            <Compass className="w-4 h-4" />
            <span>How It Works</span>
          </NavLink>
        </nav>
      </div>
      <div className="border-t-2 border-b border-black py-0.5 bg-black"></div>
    </header>
  );
}