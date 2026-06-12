import React, { useState, useEffect } from 'react';
import { Sparkles, Search, ShieldAlert, Users, TrendingDown, FileText, AlertCircle, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const AIAnalytics = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Smart Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Employee Summary state
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empSummary, setEmpSummary] = useState(null);

  // Workforce Planning state
  const [workforceData, setWorkforceData] = useState(null);

  // Burnout Attrition state
  const [burnoutData, setBurnoutData] = useState(null);

  // Attendance Anomalies state
  const [anomalyData, setAnomalyData] = useState(null);

  // Resume Screening state
  const [jobDesc, setJobDesc] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [screeningResult, setScreeningResult] = useState(null);

  useEffect(() => {
    // Pre-fetch employees directory for Summary dropdown
    const fetchDir = async () => {
      try {
        const res = await axiosInstance.get('/employees/directory');
        setEmployees(res.data?.data || []);
        if (res.data?.data?.length > 0) {
          setSelectedEmpId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDir();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/ai/search', { query: searchQuery });
      setSearchResults(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete AI search.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedEmpId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/ai/summary/${selectedEmpId}`);
      setEmpSummary(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchWorkforce = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/ai/workforce-planning');
      setWorkforceData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workforce planning analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBurnout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/ai/burnout-attrition');
      setBurnoutData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch burnout analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/ai/attendance-anomalies');
      setAnomalyData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance anomalies.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeScreening = async (e) => {
    e.preventDefault();
    if (!jobDesc || !resumeText) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/ai/resume-screening', {
        jobDescription: jobDesc,
        resumeText: resumeText
      });
      setScreeningResult(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to screen resume.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (level === 'Medium') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI & Advisory Analytics</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Nemotron 70B
            </span>
          </div>
          <p className="text-slate-400 mt-1">Advisory intelligence layers built on top of your live employee data.</p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 bg-slate-900/40 border border-indigo-500/20 text-slate-300 rounded-2xl flex items-start gap-3 text-sm">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-100 font-semibold">Advisory Intelligence Notice:</strong> All AI outputs and summaries are advisory only, carry calculated confidence scores, and critical HR actions always require manual human approval.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1">
        {[
          { id: 'search', name: 'Smart Search', icon: Search },
          { id: 'summary', name: 'Employee Summary', icon: Users },
          { id: 'workforce', name: 'Workforce Planning', icon: TrendingDown },
          { id: 'burnout', name: 'Burnout & Attrition', icon: ShieldAlert },
          { id: 'anomalies', name: 'Timekeeping Anomalies', icon: AlertCircle },
          { id: 'resume', name: 'Resume Screening', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Content Area */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Running Nemotron AI Reasoning...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* 1. Smart Search */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative max-w-2xl mx-auto">
                    <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Find managers in Finance department, or Software Engineers who live in Delhi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Ask AI Search
                    </button>
                  </div>
                </form>

                {searchResults && (
                  <div className="space-y-6 mt-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <h3 className="font-semibold text-lg">AI Matches</h3>
                      <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                        Confidence: {searchResults.confidenceScore || 90}%
                      </span>
                    </div>

                    <p className="text-sm text-slate-350 bg-slate-950/45 p-4 rounded-xl border border-slate-800/70">
                      <strong>AI Explanation:</strong> {searchResults.explanation}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.matches?.map((match, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/20 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-bold text-slate-100 text-base">{match.name}</h4>
                            <span className="text-xs text-slate-500">{match.employeeId}</span>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div>
                                <span className="text-slate-500 block uppercase font-semibold">Designation</span>
                                <span className="text-slate-350">{match.designation}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block uppercase font-semibold">Department</span>
                                <span className="text-slate-350">{match.department}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!searchResults.matches || searchResults.matches.length === 0) && (
                        <p className="text-sm text-slate-500 col-span-2 text-center py-6">No matching employees found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Employee Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Employee</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => {
                        setSelectedEmpId(e.target.value);
                        setEmpSummary(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="self-end">
                    <button
                      onClick={handleGenerateSummary}
                      disabled={!selectedEmpId}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                    >
                      Generate Summary
                    </button>
                  </div>
                </div>

                {empSummary && (
                  <div className="space-y-6 mt-8 p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <h3 className="font-bold text-lg text-slate-200">AI Profile Assessment</h3>
                      <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                        Confidence Score: {empSummary.confidenceScore}%
                      </span>
                    </div>

                    <div className="prose prose-invert text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      {empSummary.summary}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-350 list-disc list-inside">
                          {empSummary.strengths?.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          Growth Concerns
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-350 list-disc list-inside">
                          {empSummary.concerns?.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Workforce Planning */}
            {activeTab === 'workforce' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center py-6">
                  <button
                    onClick={handleFetchWorkforce}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    Analyze Headcount & Skill Gaps
                  </button>
                </div>

                {workforceData && (
                  <div className="space-y-6 mt-8 p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <h3 className="font-bold text-lg text-slate-200">Workforce & Headcount Health</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-semibold">
                          Human Approval Required
                        </span>
                        <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                          Confidence: {workforceData.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-invert text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      {workforceData.recommendations}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-850">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Department Statuses</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {workforceData.departmentHealth?.map((dept, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                            <span className="font-bold text-slate-200 text-sm">{dept.departmentName}</span>
                            <span className={`block w-fit mt-1 px-2 py-0.5 text-xxs font-bold rounded ${
                              dept.healthStatus === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {dept.healthStatus}
                            </span>
                            <p className="text-xs text-slate-500 mt-2">{dept.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-850">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Identified Skill Gaps</h4>
                      <ul className="space-y-1.5 text-xs text-slate-350 list-disc list-inside">
                        {workforceData.skillGaps?.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Burnout & Attrition */}
            {activeTab === 'burnout' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center py-6">
                  <button
                    onClick={handleFetchBurnout}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    Assess Attrition & Burnout Risks
                  </button>
                </div>

                {burnoutData && (
                  <div className="space-y-6 mt-8 p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <h3 className="font-bold text-lg text-slate-200">Organization Burnout Index</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-rose-400">{burnoutData.burnoutIndex}%</span>
                        <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                          Confidence: {burnoutData.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Risk Assessment List</h4>
                      <div className="space-y-3">
                        {burnoutData.atRiskEmployees?.map((emp, idx) => (
                          <div key={idx} className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${getRiskColor(emp.riskLevel)}`}>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-200 text-base">{emp.name}</h5>
                                <span className={`px-2 py-0.5 text-xxs font-bold border rounded ${getRiskColor(emp.riskLevel)}`}>
                                  {emp.riskLevel} Risk
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">{emp.designation} &bull; {emp.department}</span>
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {emp.flags?.map((flag, fIdx) => (
                                  <span key={fIdx} className="px-2 py-0.5 text-xxs bg-slate-900 border border-slate-800 rounded text-slate-400 font-medium">
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="max-w-md text-xs text-slate-350 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4">
                              <strong>Recommendation:</strong> {emp.recommendations}
                            </div>
                          </div>
                        ))}
                        {(!burnoutData.atRiskEmployees || burnoutData.atRiskEmployees.length === 0) && (
                          <p className="text-sm text-slate-550 text-center py-4">No critical burnout/attrition risks detected.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Attendance Anomalies */}
            {activeTab === 'anomalies' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center py-6">
                  <button
                    onClick={handleFetchAnomalies}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    Scan for Timekeeping Anomalies
                  </button>
                </div>

                {anomalyData && (
                  <div className="space-y-6 mt-8 p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <h3 className="font-bold text-lg text-slate-200">Flagged Anomalies</h3>
                      <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                        Confidence Score: {anomalyData.confidenceScore || 85}%
                      </span>
                    </div>

                    <div className="space-y-4">
                      {anomalyData.anomalies?.map((anomaly, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-slate-200">{anomaly.name}</h5>
                              <span className="text-xs text-slate-500">Date: {anomaly.date}</span>
                            </div>
                            <span className="px-2 py-0.5 text-xxs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded">
                              {anomaly.anomalyType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-350">
                            <strong>Audit:</strong> {anomaly.explanation}
                          </p>
                          <div className="text-xs text-indigo-300 font-semibold bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                            Suggestion: {anomaly.regularizationSuggestion}
                          </div>
                        </div>
                      ))}
                      {(!anomalyData.anomalies || anomalyData.anomalies.length === 0) && (
                        <p className="text-sm text-slate-500 text-center py-4">No timeclock anomalies found in the past 30 days.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Resume Screening */}
            {activeTab === 'resume' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <form onSubmit={handleResumeScreening} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Job Description Requirements</label>
                      <textarea
                        required
                        rows="8"
                        placeholder="e.g. Senior MERN Stack Developer. Core skills needed: Node.js, React, MongoDB, S3..."
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-all font-sans"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Candidate Resume Profile (Text)</label>
                      <textarea
                        required
                        rows="8"
                        placeholder="Paste plain text of resume..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-all font-sans"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={!jobDesc || !resumeText}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Screen Candidate
                    </button>
                  </div>
                </form>

                {screeningResult && (
                  <div className="space-y-6 mt-8 p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                      <h3 className="font-bold text-lg text-slate-200">Resume Screening Report</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-indigo-400">{screeningResult.matchPercentage}% Match</span>
                        <span className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                          Confidence: {screeningResult.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-invert text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      <strong>AI Summary / Recommendation:</strong><br />
                      {screeningResult.recommendation}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Perfect Fits</h4>
                        <ul className="space-y-1 text-xs text-slate-350 list-disc list-inside">
                          {screeningResult.strengths?.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400">Missing / Gap Skills</h4>
                        <ul className="space-y-1 text-xs text-slate-350 list-disc list-inside">
                          {screeningResult.gaps?.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIAnalytics;
