import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, CalendarCheck, Clock, FileCheck2, UserCheck, ShieldAlert } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    pendingRegularizations: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        if (['Admin', 'HR', 'Manager', 'Leadership'].includes(user?.role)) {
          const empRes = await axiosInstance.get('/employees');
          const leavesRes = await axiosInstance.get('/leaves/approvals');
          const regRes = await axiosInstance.get('/attendance/regularization-requests');

          setStats({
            totalEmployees: empRes.data?.count || 0,
            presentToday: empRes.data?.count ? Math.ceil(empRes.data.count * 0.8) : 0, // Mock calculation for today's present count
            pendingLeaves: leavesRes.data?.data?.length || 0,
            pendingRegularizations: regRes.data?.data?.length || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchDashboardStats();
  }, [user]);

  const isAdminOrHR = ['Admin', 'HR', 'Leadership'].includes(user?.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {user?.employeeProfile?.firstName || 'User'}! Here is your overview for today.
        </p>
      </div>

      {/* Admin stats */}
      {isAdminOrHR && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Headcount</span>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{stats.totalEmployees}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Shift Attendance</span>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{stats.presentToday}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Leave Requests</span>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{stats.pendingLeaves}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Regularizations</span>
              <h3 className="text-3xl font-bold mt-1 text-slate-100">{stats.pendingRegularizations}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Widget */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <h3 className="font-semibold text-lg">Shift & Timing Status</h3>
            <span className="text-xs text-indigo-400 font-medium">Auto-updated</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Punch operations</h4>
              <p className="text-sm text-slate-400 mt-1">
                Access your Attendance tab to punch in/out and view records.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              to="/attendance"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15 transition-all active:scale-[0.98]"
            >
              Go to Timeclock
            </Link>
          </div>
        </div>

        {/* Quick Operations / Actions */}
        <div className="glass p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link
              to="/leaves"
              className="block w-full text-center px-4 py-3 rounded-xl border border-slate-800 hover:bg-slate-850 hover:border-indigo-500/30 text-sm font-medium text-slate-300 transition-all"
            >
              Request Leave
            </Link>
            {isAdminOrHR && (
              <Link
                to="/employees"
                className="block w-full text-center px-4 py-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 text-sm font-semibold transition-all"
              >
                Onboard Employee
              </Link>
            )}
            <Link
              to="/attendance"
              className="block w-full text-center px-4 py-3 rounded-xl border border-slate-800 hover:bg-slate-850 hover:border-indigo-500/30 text-sm font-medium text-slate-300 transition-all"
            >
              Missed Punch Claim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
