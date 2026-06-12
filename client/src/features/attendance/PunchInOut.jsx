import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const PunchInOut = () => {
  const dispatch = useDispatch();
  const { todayStatus, history, loading } = useSelector((state) => state.attendance);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [regularizeForm, setRegularizeForm] = useState({
    attendanceId: '',
    punchIn: '',
    punchOut: '',
    reason: '',
  });
  const [showRegModal, setShowRegModal] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    dispatch({ type: 'attendance/fetchRequest' });
    try {
      const statusRes = await axiosInstance.get('/attendance/status');
      dispatch({ type: 'attendance/fetchStatusSuccess', payload: statusRes.data });

      const historyRes = await axiosInstance.get('/attendance/history');
      dispatch({ type: 'attendance/fetchHistorySuccess', payload: historyRes.data.data });
    } catch (err) {
      dispatch({ type: 'attendance/fetchFailure', payload: err.message });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePunch = async () => {
    try {
      const endpoint = todayStatus.punchedIn ? '/attendance/punch-out' : '/attendance/punch-in';
      const res = await axiosInstance.post(endpoint);
      dispatch({ type: 'attendance/punchSuccess', payload: res.data.data });
      fetchStatus();
      setMsg({ type: 'success', text: todayStatus.punchedIn ? 'Successfully punched out!' : 'Successfully punched in!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Punch failed' });
    }
  };

  const handleRegularize = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/attendance/regularization', regularizeForm);
      setShowRegModal(false);
      setRegularizeForm({ attendanceId: '', punchIn: '', punchOut: '', reason: '' });
      fetchStatus();
      setMsg({ type: 'success', text: 'Regularization request submitted successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit regularization' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>
        <p className="text-slate-400 mt-1">Punch check-in/out, claim regularization, and track hours history.</p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeclock widget */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between items-center text-center space-y-6">
          <div>
            <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Digital Webclock</h3>
            <div className="text-4xl font-extrabold tracking-tight mt-3 text-indigo-400 font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="w-full max-w-[200px]">
            <button
              onClick={handlePunch}
              disabled={todayStatus.punchedIn && todayStatus.punchedOut}
              className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.97] disabled:opacity-50 ${
                todayStatus.punchedIn && todayStatus.punchedOut
                  ? 'bg-slate-800 border border-slate-750 text-slate-500 shadow-none cursor-not-allowed'
                  : todayStatus.punchedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/15'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15'
              }`}
            >
              {todayStatus.punchedIn && todayStatus.punchedOut
                ? 'Shift Completed'
                : todayStatus.punchedIn
                ? 'Punch Check-Out'
                : 'Punch Check-In'}
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5" />
            Last Sync: {todayStatus.attendance ? new Date(todayStatus.attendance.updatedAt).toLocaleTimeString() : 'No punch logs today'}
          </div>
        </div>

        {/* Status card */}
        <div className="glass p-6 rounded-2xl space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Shift Info & Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Check-in time</span>
              <p className="font-mono text-sm mt-1 text-slate-200">
                {todayStatus.attendance?.punchIn ? new Date(todayStatus.attendance.punchIn).toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Check-out time</span>
              <p className="font-mono text-sm mt-1 text-slate-200">
                {todayStatus.attendance?.punchOut ? new Date(todayStatus.attendance.punchOut).toLocaleTimeString() : '--:--'}
              </p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Working hours</span>
              <p className="font-mono text-sm mt-1 text-slate-200">
                {todayStatus.attendance?.workHours ? `${todayStatus.attendance.workHours} hrs` : '0.00 hrs'}
              </p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Today Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                {todayStatus.attendance?.status === 'Present' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Present
                  </span>
                ) : todayStatus.attendance?.status === 'Late' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Late
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">Not active</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="glass rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-450 uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/20">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((record) => (
                <tr key={record._id} className="hover:bg-slate-800/10">
                  <td className="py-3.5 px-4 font-medium">{record.date}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">{record.workHours || '0.0'} hrs</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        record.status === 'Present'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : record.status === 'Late'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {(!record.punchIn || !record.punchOut) && (
                      <button
                        onClick={() => {
                          setRegularizeForm({
                            attendanceId: record._id,
                            punchIn: record.punchIn ? new Date(record.punchIn).toISOString().slice(0, 16) : '',
                            punchOut: record.punchOut ? new Date(record.punchOut).toISOString().slice(0, 16) : '',
                            reason: '',
                          });
                          setShowRegModal(true);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Claim Missed Punch
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-semibold">Missed Punch Claim</h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-450 hover:text-slate-200 text-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleRegularize} className="space-y-4 text-xs font-semibold text-slate-450 uppercase tracking-wider">
              <div>
                <label className="block mb-1.5">Correct Punch In</label>
                <input
                  type="datetime-local"
                  value={regularizeForm.punchIn}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, punchIn: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block mb-1.5">Correct Punch Out</label>
                <input
                  type="datetime-local"
                  value={regularizeForm.punchOut}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, punchOut: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block mb-1.5">Reason for Regularization</label>
                <textarea
                  required
                  value={regularizeForm.reason}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, reason: e.target.value })}
                  placeholder="e.g. Card scanner error"
                  rows="3"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 lowercase normal-case"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                >
                  Submit Regularization Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchInOut;
