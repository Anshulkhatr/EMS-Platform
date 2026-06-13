import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';

export default function LandingPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const handleStart = () => navigate(user ? '/dashboard' : '/login');

  return (
    <div className="relative h-screen min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col justify-between">

      {/* ── ambient glows ── */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[140px] animate-pulse-glow z-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[130px] animate-pulse-glow animation-delay-400 z-0" />
      <div className="pointer-events-none absolute top-[25%] left-[25%] w-[40%] h-[40%] rounded-full bg-indigo-950/20 blur-[120px] z-0" />

      {/* ══════════════════════════════ HEADER ══════════════════════════════ */}
      <header className="z-50 w-full bg-slate-950/40 backdrop-blur-md border-b border-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-extrabold text-base">E</span>
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight leading-none text-slate-100">EMS Platform</p>
              <span className="text-[10px] text-indigo-400 font-medium">Enterprise Hub</span>
            </div>
          </div>

          {/* Sign In / Dashboard CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800/40 text-slate-200 transition-all active:scale-95">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col items-center justify-center flex-grow z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise Workspace
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 leading-tight">
            Streamline Workforce Operations<br className="hidden sm:block" /> With Ultimate Precision.
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            A comprehensive, multi-tenant Employee Management System engineered with secure shift logs, live attendance tracking, dynamic request approvals, and analytics dashboards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {user ? 'Enter Dashboard' : 'Get Started Now'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-900/40 text-xs text-slate-500 z-10">
        <div>&copy; {new Date().getFullYear()} EMS Platform. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-600" /> Enterprise Secured
        </div>
      </footer>

    </div>
  );
}
