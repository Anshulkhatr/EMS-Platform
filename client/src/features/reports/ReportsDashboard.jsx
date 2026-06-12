import React, { useEffect, useState } from 'react';
import { Users, ClipboardList, Calendar, AlertCircle } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const ReportsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headcountData, setHeadcountData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [headcountRes, attendanceRes, leaveRes] = await Promise.all([
        axiosInstance.get('/reports/headcount'),
        axiosInstance.get('/reports/attendance'),
        axiosInstance.get('/reports/leave')
      ]);

      if (headcountRes.data.success) setHeadcountData(headcountRes.data.data);
      if (attendanceRes.data.success) setAttendanceData(attendanceRes.data);
      if (leaveRes.data.success) setLeaveData(leaveRes.data);

    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <p className="text-slate-200 font-semibold mb-2">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-xl transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics & Reports</h1>
        <p className="text-slate-400 mt-1">Real-time metrics, headcount distributions, and status reports.</p>
      </div>

      {/* Headcount Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Headcount</p>
            <p className="text-3xl font-bold mt-1 text-slate-100">{headcountData?.total || 0}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Employees</p>
            <p className="text-3xl font-bold mt-1 text-emerald-400">{headcountData?.active || 0}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Today's Presence</p>
            <p className="text-3xl font-bold mt-1 text-indigo-400">
              {attendanceData?.summary?.totalPresent || 0}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Leaves</p>
            <p className="text-3xl font-bold mt-1 text-amber-400">
              {leaveData?.summary?.totalPending || 0}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-6">
          <h2 className="text-lg font-bold text-slate-200">Department Distribution</h2>
          <div className="space-y-4">
            {headcountData?.byDepartment?.map((dept, idx) => {
              const pct = headcountData.total > 0 ? (dept.count / headcountData.total) * 100 : 0;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-300">{dept.deptName}</span>
                    <span className="text-slate-400">{dept.count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {(!headcountData?.byDepartment || headcountData.byDepartment.length === 0) && (
              <p className="text-sm text-slate-500 py-4 text-center">No department headcount information</p>
            )}
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-6">
          <h2 className="text-lg font-bold text-slate-200">Today's Attendance Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Present</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">{attendanceData?.summary?.totalPresent || 0}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Late Arrivals</span>
              <span className="text-2xl font-bold mt-1 text-amber-400">{attendanceData?.summary?.totalLate || 0}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Half Days</span>
              <span className="text-2xl font-bold mt-1 text-indigo-400">{attendanceData?.summary?.totalHalfDay || 0}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Absent</span>
              <span className="text-2xl font-bold mt-1 text-rose-500">{attendanceData?.summary?.totalAbsent || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Status Summary */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-slate-200">Leave Requests Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Approved Leaves</span>
              <span className="text-2xl font-bold mt-1 text-emerald-400">{leaveData?.summary?.totalApproved || 0}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Pending Requests</span>
              <span className="text-2xl font-bold mt-1 text-amber-400">{leaveData?.summary?.totalPending || 0}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Rejected Requests</span>
              <span className="text-2xl font-bold mt-1 text-rose-400">{leaveData?.summary?.totalRejected || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
