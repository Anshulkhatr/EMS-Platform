import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const LeaveRequestForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, history, approvals, loading } = useSelector((state) => state.leave);

  const [reqForm, setReqForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [msg, setMsg] = useState(null);

  const fetchData = async () => {
    dispatch({ type: 'leave/fetchRequest' });
    try {
      const balRes = await axiosInstance.get('/leaves/balance');
      dispatch({ type: 'leave/fetchBalanceSuccess', payload: balRes.data.data });

      const historyRes = await axiosInstance.get('/leaves/history');
      dispatch({ type: 'leave/fetchHistorySuccess', payload: historyRes.data.data });

      if (['Admin', 'HR', 'Manager'].includes(user?.role)) {
        const appRes = await axiosInstance.get('/leaves/approvals');
        dispatch({ type: 'leave/fetchApprovalsSuccess', payload: appRes.data.data });
      }
    } catch (err) {
      dispatch({ type: 'leave/fetchFailure', payload: err.message });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/leaves/request', reqForm);
      setReqForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      fetchData();
      setMsg({ type: 'success', text: 'Leave request submitted successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to request leave' });
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axiosInstance.post(`/leaves/request/${id}/${action}`);
      fetchData();
      setMsg({ type: 'success', text: `Leave request successfully ${action}ed` });
    } catch (err) {
      setMsg({ type: 'error', text: `Failed to ${action} request` });
    }
  };

  const isApprover = ['Admin', 'HR', 'Manager'].includes(user?.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time-Off & Leave</h1>
        <p className="text-slate-400 mt-1">Check leave balances, request time-off, and process pending approvals.</p>
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

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500 uppercase">Casual Leaves</span>
          <h3 className="text-3xl font-extrabold mt-1 text-indigo-400">{balance.casual} d</h3>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500 uppercase">Sick Leaves</span>
          <h3 className="text-3xl font-extrabold mt-1 text-teal-400">{balance.sick} d</h3>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500 uppercase">Earned Leaves</span>
          <h3 className="text-3xl font-extrabold mt-1 text-amber-400">{balance.earned} d</h3>
        </div>
        <div className="glass p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500 uppercase">Unpaid Leaves</span>
          <h3 className="text-3xl font-extrabold mt-1 text-slate-400">{balance.unpaid} d</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="glass p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Request Time-Off</h3>
          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-semibold text-slate-450 uppercase tracking-wider">
            <div>
              <label className="block mb-1.5">Leave Type</label>
              <select
                value={reqForm.leaveType}
                onChange={(e) => setReqForm({ ...reqForm, leaveType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Earned">Earned Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={reqForm.startDate}
                  onChange={(e) => setReqForm({ ...reqForm, startDate: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>
              <div>
                <label className="block mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={reqForm.endDate}
                  onChange={(e) => setReqForm({ ...reqForm, endDate: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5">Reason</label>
              <textarea
                required
                value={reqForm.reason}
                onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
                placeholder="Explain the reason for time-off..."
                rows="3"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 normal-case lowercase"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Approvals Queue */}
        <div className="glass p-6 rounded-2xl space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Approvals Pending</h3>
          {!isApprover ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              You do not have access rights to approve leave requests.
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No pending approvals in queue.
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {approvals.map((req) => (
                <div key={req._id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Employee'}
                    </h4>
                    <p className="text-xs text-indigo-400 font-medium mt-1">
                      {req.leaveType} Leave • {req.totalDays} day{req.totalDays > 1 ? 's' : ''} ({new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()})
                    </p>
                    <p className="text-xs text-slate-400 mt-2 italic font-normal">"{req.reason}"</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleAction(req._id, 'approve')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'reject')}
                      className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="glass rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Time-Off Claims History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-450 uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/20">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((record) => (
                <tr key={record._id} className="hover:bg-slate-800/10">
                  <td className="py-3.5 px-4 font-medium">
                    {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-300">{record.leaveType}</td>
                  <td className="py-3.5 px-4">{record.totalDays} days</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{record.reason}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        record.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : record.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-slate-500 font-medium">
                    No time-off request logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
