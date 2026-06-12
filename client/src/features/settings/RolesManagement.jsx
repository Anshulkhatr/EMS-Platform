import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';

const RolesManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
  });
  const [msg, setMsg] = useState(null);

  const fetchSettings = async () => {
    try {
      const deptRes = await axiosInstance.get('/settings/departments');
      setDepartments(deptRes.data?.data || []);

      const shiftRes = await axiosInstance.get('/settings/shifts');
      setShifts(shiftRes.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/settings/departments', deptForm);
      setDeptForm({ name: '', code: '' });
      fetchSettings();
      setMsg({ type: 'success', text: 'Department created successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create department' });
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/settings/shifts', shiftForm);
      setShiftForm({ name: '', startTime: '09:00', endTime: '18:00', gracePeriod: 15 });
      fetchSettings();
      setMsg({ type: 'success', text: 'Shift timing configured successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to configure shift' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-slate-400 mt-1">Configure company departments and daily shifts timings.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department section */}
        <div className="glass p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Department Configuration</h3>
          <form onSubmit={handleCreateDept} className="space-y-4 text-xs font-semibold text-slate-450 uppercase tracking-wider">
            <div>
              <label className="block mb-1.5">Department Name</label>
              <input
                type="text"
                required
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>
            <div>
              <label className="block mb-1.5">Dept Code</label>
              <input
                type="text"
                required
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                placeholder="e.g. ENG"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              Add Department
            </button>
          </form>

          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold uppercase text-slate-500">Active Departments</h4>
            {departments.map((dept) => (
              <div key={dept._id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{dept.name}</span>
                <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-mono">
                  {dept.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Section */}
        <div className="glass p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Shift Planning</h3>
          <form onSubmit={handleCreateShift} className="space-y-4 text-xs font-semibold text-slate-450 uppercase tracking-wider">
            <div>
              <label className="block mb-1.5">Shift Name</label>
              <input
                type="text"
                required
                value={shiftForm.name}
                onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                placeholder="e.g. General Shift"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5">Start Time</label>
                <input
                  type="text"
                  required
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  placeholder="09:00"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>
              <div>
                <label className="block mb-1.5">End Time</label>
                <input
                  type="text"
                  required
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  placeholder="18:00"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1.5">Grace Period (Minutes)</label>
              <input
                type="number"
                required
                value={shiftForm.gracePeriod}
                onChange={(e) => setShiftForm({ ...shiftForm, gracePeriod: parseInt(e.target.value) })}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              Add Shift Timings
            </button>
          </form>

          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold uppercase text-slate-500">Active Shifts</h4>
            {shifts.map((shift) => (
              <div key={shift._id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{shift.name}</span>
                <span className="text-xs bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded text-teal-300 font-mono">
                  {shift.startTime} - {shift.endTime} (Grace: {shift.gracePeriod}m)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesManagement;
