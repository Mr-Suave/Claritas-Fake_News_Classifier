// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Activity, UserCheck, Compass } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            C
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white">CLARITAS</h1>
              <span className="text-[10px] font-mono tracking-widest bg-indigo-950 text-indigo-400 border border-indigo-800/80 px-2 py-0.5 rounded-full font-bold">
                XAI TRUST ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Layered Classifier + Local Ollama Explainability</p>
          </div>
        </NavLink>

        <nav className="flex space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Activity className="w-4 h-4" />
            <span>Analyzer</span>
          </NavLink>

          <NavLink
            to="/review"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Queue</span>
          </NavLink>

          <NavLink
            to="/how-it-works"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Compass className="w-4 h-4" />
            <span>How It Works</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}