import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  FileText,
  Lock,
  ChevronDown,
  HelpCircle,
  Activity,
  Database,
  CloudLightning,
  Clock,
  Terminal,
  Menu,
  X,
} from 'lucide-react';

/* ─── constants ─── */
const SHIFTS = [
  {
    id: 'general',
    name: 'General Shift',
    start: '09:00 AM',
    end: '06:00 PM',
    grace: '15 min',
    dept: 'All Departments',
    employees: 42,
    badgeCls: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    barCls: 'bg-indigo-500',
  },
  {
    id: 'night',
    name: 'Night Shift',
    start: '10:00 PM',
    end: '06:00 AM',
    grace: '10 min',
    dept: 'Technical Dept',
    employees: 18,
    badgeCls: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    barCls: 'bg-purple-500',
  },
  {
    id: 'emergency',
    name: 'Emergency Response',
    start: '07:00 AM',
    end: '03:00 PM',
    grace: '5 min',
    dept: 'HR & Finance',
    employees: 9,
    badgeCls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    barCls: 'bg-amber-500',
  },
];

const LOG_POOL = [
  { type: 'info', text: 'EMP-1042 (Arjun Mehta) clocked in — General Shift' },
  { type: 'success', text: 'Leave request LR-4481 approved by Manager Priya S.' },
  { type: 'info', text: 'EMP-2018 (Kavita Rao) clocked out — Night Shift' },
  { type: 'warn', text: 'EMP-3307 (Rohan Das) clocked in 8 min past grace window' },
  { type: 'info', text: 'Notification dispatched to EMP-1042 — leave balance updated' },
  { type: 'success', text: 'Document DOC-889 (Contract.pdf) archived to S3 bucket' },
  { type: 'info', text: 'Audit log: Role updated for EMP-2018 → HR by Admin' },
  { type: 'warn', text: 'EMP-5501 (Amit Patel) marked absent — no punch detected' },
  { type: 'success', text: 'Headcount report generated: 42 active, 3 on leave' },
  { type: 'info', text: 'EMP-3307 (Rohan Das) clocked out — Emergency Response Shift' },
  { type: 'success', text: 'Leave balance reset completed for new fiscal cycle' },
  { type: 'info', text: 'Shift config updated: Night Shift grace → 10 min by Admin' },
  { type: 'warn', text: 'Redis fallback active — using in-memory session cache' },
  { type: 'success', text: 'MongoDB Atlas connected (Primary) — ac-z9uxiv0.mongodb.net' },
  { type: 'info', text: 'EMP-1099 (Simran Kaur) punch-in logged — General Shift' },
];

const LOG_META = {
  info: { label: 'INFO', cls: 'text-indigo-400' },
  success: { label: 'OK', cls: 'text-emerald-400' },
  warn: { label: 'WARN', cls: 'text-amber-400' },
};

const FEATURES = [
  {
    Icon: CalendarDays,
    title: 'Smart Attendance',
    desc: 'Log clock-ins and clock-outs seamlessly with geolocation fallback capabilities.',
    iconWrap: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400',
    hoverTitle: 'group-hover:text-indigo-400',
  },
  {
    Icon: ShieldCheck,
    title: 'Leave Management',
    desc: 'Submit requests, view leave balances, and handle team approvals instantly.',
    iconWrap: 'bg-purple-500/10 border border-purple-500/20 text-purple-400',
    hoverTitle: 'group-hover:text-purple-400',
  },
  {
    Icon: BarChart3,
    title: 'Analytics Reports',
    desc: 'Track attendance trends, leave cycles, and department headcounts in real time.',
    iconWrap: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
    hoverTitle: 'group-hover:text-sky-400',
  },
  {
    Icon: FileText,
    title: 'Document Vault',
    desc: 'Securely store contracts and tax filings with local fallback upload drivers.',
    iconWrap: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    hoverTitle: 'group-hover:text-emerald-400',
  },
];

const STEPS = [
  { num: '01', title: 'Corporate Registration', desc: 'Create a unique enterprise tenant workspace and provision the initial administrator profile automatically.' },
  { num: '02', title: 'Shift & Department Seeding', desc: 'Set up working shifts (e.g. general, night), department codes, and customised leave policy balances.' },
  { num: '03', title: 'Employee Onboarding', desc: 'Invite team members, assign role permissions (HR, Manager, Employee), and auto-generate unique IDs.' },
  { num: '04', title: 'Monitor & Log', desc: 'Track punch timings in real-time, generate audit trail logs, request leaves, and review statistics.' },
];

const FAQ = [
  { q: 'How does the multi-tenant architecture work?', a: 'The EMS Platform partitions all company data using a database-level tenant identifier (Tenant ID). Each organisation has a separate workspace, ensuring completely isolated configs, departments, attendance records, and files.' },
  { q: 'What happens if the primary database is unavailable?', a: 'The platform is configured with an automated database fallback. If the primary MongoDB Atlas cluster fails to respond, the server dynamically switches to a local replica to avoid downtime.' },
  { q: 'How does the document vault secure files?', a: 'All files (contracts, resumes, credentials) are stored securely. In production, uploads sync to an encrypted AWS S3 Bucket; in local testing the system falls back to secure directory paths automatically.' },
  { q: 'Does the application require a local Redis server?', a: 'No — Redis is optional. The platform tests connectivity on startup and switches to an in-memory mock client if Redis is offline, preventing log spam and application crashes.' },
];

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#preview', label: 'Preview' },
  { href: '#onboarding', label: 'How It Works' },
  { href: '#shifts', label: 'Shifts & Logs' },
  { href: '#faq', label: 'FAQ' },
];

/* ─── component ─── */
export default function LandingPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState(null);
  const [activeShift, setActiveShift] = useState(SHIFTS[0]);
  const [logs, setLogs] = useState([]);
  const [logIdx, setLogIdx] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logsEndRef = useRef(null);

  const handleStart = () => navigate(user ? '/dashboard' : '/login');
  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  /* live audit ticker */
  useEffect(() => {
    const t = setInterval(() => {
      setLogIdx((prev) => {
        const idx = prev % LOG_POOL.length;
        const entry = LOG_POOL[idx];
        const ts = new Date().toLocaleTimeString('en-GB');
        setLogs((old) => [...old.slice(-17), { ...entry, ts, id: `${Date.now()}-${idx}` }]);
        return idx + 1;
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">

      {/* ── ambient glows ── */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[140px] animate-pulse-glow z-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[130px] animate-pulse-glow animation-delay-400 z-0" />
      <div className="pointer-events-none absolute top-[35%] right-[15%] w-[35%] h-[35%] rounded-full bg-indigo-950/25 blur-[120px] animate-float-slow z-0" />

      {/* ══════════════════════════════ HEADER ══════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

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

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm text-slate-400 font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-slate-200 transition-colors">{label}</a>
            ))}
          </nav>

          {/* desktop CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
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
            {/* hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-md px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 transition-all"
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-800/60">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-800 text-slate-200 hover:bg-slate-800/60 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center z-10">
        <div className="max-w-4xl mx-auto text-center space-y-7 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise Workspace
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 leading-tight">
            Streamline Workforce Operations<br className="hidden sm:block" /> With Ultimate Precision.
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            A comprehensive, multi-tenant Employee Management System engineered with secure shift logs, live attendance tracking, dynamic request approvals, and analytics dashboards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {user ? 'Enter Dashboard' : 'Get Started Now'} <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-center transition-all"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ LIVE PREVIEW WIDGET ══════════════════════════ */}
      <section id="preview" className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 z-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-1.5 shadow-2xl glass">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6 space-y-5">
            {/* fake window bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-500 ml-3 font-mono">dashboard_preview.sh</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 font-mono">
                Environment: Active (Mock)
              </div>
            </div>
            {/* status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Server Response</span>
                  <p className="text-sm font-bold text-slate-200">12ms (Normal)</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Database</span>
                  <p className="text-sm font-bold text-slate-200">MongoDB Atlas</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <CloudLightning className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">S3 Backup Sync</span>
                  <p className="text-sm font-bold text-slate-200">Connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FEATURES GRID ══════════════════════════ */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Everything You Need</h2>
          <p className="text-sm text-slate-400">Core modules built for modern enterprise workforce management.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ Icon, title, desc, iconWrap, hoverTitle }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 hover:bg-slate-900/70 transition-all duration-300 group flex flex-col gap-4"
            >
              <div className={`p-3 ${iconWrap} rounded-xl w-fit group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-slate-200 text-sm ${hoverTitle} transition-colors`}>{title}</h3>
                <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ ONBOARDING STEPS ══════════════════════════ */}
      <section id="onboarding" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative border-t border-slate-900/60">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Workflow & Onboarding</h2>
          <p className="text-sm text-slate-400">Get your organisation up and running in minutes with four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl border border-slate-800/60 bg-slate-900/20 space-y-3">
              <span className="text-5xl font-extrabold text-indigo-500/15 block font-mono leading-none">{step.num}</span>
              <h3 className="font-bold text-slate-200 text-sm">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════ FAQ ══════════════════════════ */}
      <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative border-t border-slate-900/60">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-indigo-400" /> Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">Common questions about platform configurations, backups, and security.</p>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-2xl border border-slate-800/80 bg-slate-900/10 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-left focus:outline-none hover:bg-slate-900/20 transition-colors gap-4"
                >
                  <span className="font-semibold text-slate-200 text-sm">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-800/40 pt-4 bg-slate-950/20">
                    <p className="text-xs text-slate-400 leading-relaxed font-light">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-900/60 text-xs text-slate-500 z-10">
        <div>&copy; {new Date().getFullYear()} EMS Platform. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-600" /> Enterprise Secured
        </div>
      </footer>

    </div>
  );
}
