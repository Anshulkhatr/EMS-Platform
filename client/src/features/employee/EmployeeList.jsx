import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Search, UserPlus, X, CalendarDays, ClipboardCheck,
  FileText, User, Phone, Mail, Briefcase, DollarSign,
  Building2, Calendar, ExternalLink, ChevronRight, Clock,
  CheckCircle2, XCircle, AlertCircle, Download
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

// ─── Status badge helpers ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Present:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Approved:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Late:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Half-Day':'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Pending:   'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Rejected:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Terminated:'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Absent:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  const cls = map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${cls}`}>
      {status}
    </span>
  );
};

// ─── Detail Field ─────────────────────────────────────────────────────
const DetailField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-indigo-400" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-200 font-medium mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────
const EmployeeList = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [orgChart, setOrgChart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('directory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [newEmp, setNewEmp] = useState({
    firstName: '', lastName: '', email: '', designation: '',
    role: 'Employee', password: '', phone: '', salary: '', currency: 'USD', department: '',
  });
  const [editEmp, setEditEmp] = useState({
    _id: '', firstName: '', lastName: '', email: '', designation: '',
    role: 'Employee', password: '', phone: '', salary: '', currency: 'USD', department: '',
  });

  // Profile drawer state
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [drawerData, setDrawerData] = useState({
    leaves: [], leaveBalance: null, attendance: [], documents: [],
  });
  const [drawerLoading, setDrawerLoading] = useState(false);

  const isEmployee = user?.role === 'Employee';
  const isHR = user?.role === 'HR';
  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role);
  const canViewDetails = ['Admin', 'HR', 'Manager', 'Leadership', 'Employee'].includes(user?.role);

  // ── Fetchers ──
  const fetchEmployees = async () => {
    if (isEmployee) return;
    try {
      const res = await axiosInstance.get(`/employees/directory?search=${search}`);
      setEmployees(res.data?.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchOrgChart = async () => {
    if (isEmployee) return;
    try {
      const res = await axiosInstance.get('/employees/org-chart');
      setOrgChart(res.data?.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchSettings = async () => {
    try {
      const deptRes = await axiosInstance.get('/settings/departments');
      setDepartments(deptRes.data?.data || []);
    } catch (err) { console.error(err); }
  };

  const openEmployeeDrawer = async (emp) => {
    setSelectedEmp(emp);
    setDrawerTab('overview');
    setDrawerLoading(true);
    try {
      const [leavesRes, balanceRes, attendanceRes, docsRes] = await Promise.allSettled([
        axiosInstance.get(`/leaves/employee/${emp._id}/history`),
        axiosInstance.get(`/leaves/employee/${emp._id}/balance`),
        axiosInstance.get(`/attendance/employee/${emp._id}`),
        axiosInstance.get(`/documents/employee/${emp._id}`),
      ]);
      setDrawerData({
        leaves:       leavesRes.status === 'fulfilled'     ? (leavesRes.value.data?.data || [])     : [],
        leaveBalance: balanceRes.status === 'fulfilled'    ? (balanceRes.value.data?.data || null)   : null,
        attendance:   attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data?.data || [])  : [],
        documents:    docsRes.status === 'fulfilled'       ? (docsRes.value.data?.data || [])        : [],
      });
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [search]);
  useEffect(() => { if (activeTab === 'org') fetchOrgChart(); }, [activeTab]);
  useEffect(() => { if (showAddModal || showEditModal) fetchSettings(); }, [showAddModal, showEditModal]);

  useEffect(() => {
    if (isEmployee && user?.employeeProfile) {
      const empId = user.employeeProfile._id || user.employeeProfile;
      const loadSelfProfile = async () => {
        setDrawerLoading(true);
        try {
          const empRes = await axiosInstance.get(`/employees/${empId}`);
          const emp = empRes.data?.data;
          setSelectedEmp(emp);
          
          const [leavesRes, balanceRes, attendanceRes, docsRes] = await Promise.allSettled([
            axiosInstance.get(`/leaves/employee/${empId}/history`),
            axiosInstance.get(`/leaves/employee/${empId}/balance`),
            axiosInstance.get(`/attendance/employee/${empId}`),
            axiosInstance.get(`/documents/employee/${empId}`),
          ]);
          setDrawerData({
            leaves:       leavesRes.status === 'fulfilled'     ? (leavesRes.value.data?.data || [])     : [],
            leaveBalance: balanceRes.status === 'fulfilled'    ? (balanceRes.value.data?.data || null)   : null,
            attendance:   attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data?.data || [])  : [],
            documents:    docsRes.status === 'fulfilled'       ? (docsRes.value.data?.data || [])        : [],
          });
        } catch (err) {
          console.error('Failed to load self profile details:', err);
        } finally {
          setDrawerLoading(false);
        }
      };
      loadSelfProfile();
    }
  }, [isEmployee, user]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post('/employees', newEmp);
      setShowAddModal(false);
      setNewEmp({ firstName: '', lastName: '', email: '', designation: '', role: 'Employee', password: '', phone: '', salary: '', department: '' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard employee');
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...editEmp };
      if (!payload.password) {
        delete payload.password;
      }
      await axiosInstance.put(`/employees/${editEmp._id}`, payload);
      setShowEditModal(false);
      fetchEmployees();
      // Update drawer's selectedEmp dynamically
      const updatedRes = await axiosInstance.get(`/employees/${editEmp._id}`);
      setSelectedEmp(updatedRes.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee details');
    }
  };

  const DRAWER_TABS = [
    { id: 'overview',    label: 'Overview',    icon: User },
    { id: 'leaves',      label: 'Leaves',      icon: ClipboardCheck },
    { id: 'attendance',  label: 'Attendance',  icon: CalendarDays },
    { id: 'documents',   label: 'Documents',   icon: FileText },
  ];

  if (isEmployee) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center font-bold text-white text-4xl shadow-xl shadow-indigo-500/20">
            {selectedEmp?.firstName?.[0] || user?.employeeProfile?.firstName?.[0] || 'U'}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Loading Profile...'}
            </h1>
            <p className="text-indigo-400 text-base font-semibold mt-1.5">{selectedEmp?.designation || 'Employee'}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-slate-400 font-medium">
              <span>ID: {selectedEmp?.employeeId || 'N/A'}</span>
              <span className="text-slate-655">•</span>
              <span className="px-3 py-1 bg-indigo-550/10 border border-indigo-500/20 text-indigo-300 rounded-full font-bold">
                {selectedEmp?.department?.name || 'Unassigned'}
              </span>
              <span className="text-slate-655">•</span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700/60 rounded-full capitalize font-semibold">
                Role: {selectedEmp?.role || user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 p-1 rounded-2xl gap-1">
          {DRAWER_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setDrawerTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  drawerTab === tab.id
                    ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-650/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content area */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800/80 min-h-[300px]">
          {drawerLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {drawerTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField icon={Mail}      label="Email"        value={selectedEmp?.email} />
                    <DetailField icon={Phone}     label="Phone"        value={selectedEmp?.phone} />
                    <DetailField icon={Briefcase} label="Designation"  value={selectedEmp?.designation} />
                    <DetailField icon={Building2} label="Department"   value={selectedEmp?.department?.name} />
                    <DetailField icon={DollarSign} label="Salary"      value={selectedEmp?.salary ? `${selectedEmp.currency || 'USD'} ${selectedEmp.salary.toLocaleString()}` : null} />
                    <DetailField icon={Calendar}  label="Joined"       value={selectedEmp?.dateOfJoining ? new Date(selectedEmp.dateOfJoining).toLocaleDateString() : null} />
                  </div>

                  {/* Leave Balance Summary */}
                  {drawerData.leaveBalance && (
                    <div className="pt-6 border-t border-slate-800/60">
                      <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Leave Balance</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Annual', key: 'annual', color: 'indigo' },
                          { label: 'Sick',   key: 'sick',   color: 'emerald' },
                          { label: 'Unpaid', key: 'unpaid', color: 'amber' },
                        ].map(({ label, key, color }) => (
                          <div key={key} className={`p-4 rounded-2xl border bg-${color}-500/5 border-${color}-500/20 text-center`}>
                            <p className={`text-3xl font-extrabold text-${color}-400`}>{drawerData.leaveBalance[key] ?? 0}</p>
                            <p className="text-xs text-slate-550 mt-1 font-semibold">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="pt-6 border-t border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Attendance Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 text-center">
                        <p className="text-3xl font-extrabold text-emerald-400">
                          {drawerData.attendance.filter(a => a.status === 'Present').length}
                        </p>
                        <p className="text-xs text-slate-550 mt-1 font-semibold">Present</p>
                      </div>
                      <div className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20 text-center">
                        <p className="text-3xl font-extrabold text-amber-400">
                          {drawerData.attendance.filter(a => a.status === 'Late').length}
                        </p>
                        <p className="text-xs text-slate-550 mt-1 font-semibold">Late</p>
                      </div>
                      <div className="p-4 rounded-2xl border bg-rose-500/5 border-rose-500/20 text-center">
                        <p className="text-3xl font-extrabold text-rose-400">
                          {drawerData.attendance.filter(a => a.status === 'Absent').length}
                        </p>
                        <p className="text-xs text-slate-550 mt-1 font-semibold">Absent</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaves Tab */}
              {drawerTab === 'leaves' && (
                <div className="space-y-6">
                  {drawerData.leaveBalance && (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Annual', key: 'annual', color: 'indigo' },
                        { label: 'Sick',   key: 'sick',   color: 'emerald' },
                        { label: 'Unpaid', key: 'unpaid', color: 'amber' },
                      ].map(({ label, key, color }) => (
                        <div key={key} className={`p-4 rounded-2xl border bg-${color}-500/5 border-${color}-500/20 text-center`}>
                          <p className={`text-4xl font-extrabold text-${color}-400`}>{drawerData.leaveBalance[key] ?? 0}</p>
                          <p className="text-xs text-slate-550 mt-1.5 font-bold">{label} Days Left</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Leave Request History</h3>
                    {drawerData.leaves.length === 0 ? (
                      <p className="text-center py-12 text-slate-500 text-sm">No leave requests found.</p>
                    ) : (
                      <div className="space-y-3">
                        {drawerData.leaves.map(leave => (
                          <div key={leave._id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-sm text-slate-200 capitalize">{leave.leaveType} Leave</p>
                                <p className="text-xs text-slate-500 mt-1 font-semibold">
                                  {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                                  <span className="ml-2 text-slate-600">({leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''})</span>
                                </p>
                                {leave.reason && <p className="text-xs text-slate-400 mt-2 italic">"{leave.reason}"</p>}
                              </div>
                              <StatusBadge status={leave.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attendance Tab */}
              {drawerTab === 'attendance' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Recent Attendance (Last 30 Records)</h3>
                  {drawerData.attendance.length === 0 ? (
                    <p className="text-center py-12 text-slate-500 text-sm">No attendance records found.</p>
                  ) : (
                    <div className="space-y-3">
                      {drawerData.attendance.map(record => (
                        <div key={record._id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-slate-450" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200">{record.date}</p>
                              <p className="text-xs text-slate-550 mt-1 font-semibold">
                                {record.punchIn ? `In: ${new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not punched in'}
                                {record.punchOut ? ` · Out: ${new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                {record.workHours ? ` · ${record.workHours}h` : ''}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={record.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {drawerTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Your Documents ({drawerData.documents.length})</h3>
                  {drawerData.documents.length === 0 ? (
                    <p className="text-center py-12 text-slate-500 text-sm">No documents found.</p>
                  ) : (
                    <div className="space-y-3">
                      {drawerData.documents.map(doc => (
                        <div key={doc._id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-250">{doc.name}</p>
                              <p className="text-xs text-slate-500 mt-1 font-semibold">
                                {doc.type?.toUpperCase()} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                            title="Open document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People &amp; Directory</h1>
          <p className="text-slate-400 mt-1">Manage team members, view company structure, and onboard new talent.</p>
        </div>
        {isHR && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-800">
        {['directory', 'org'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-3 text-sm font-medium border-b-2 capitalize transition-all ${
              activeTab === t
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'org' ? 'Organizational Chart' : 'Directory'}
          </button>
        ))}
      </div>

      {/* Directory View */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, designation, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">ID &amp; Name</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4 pr-6">Contact</th>
                    {canViewDetails && <th className="p-4 pr-6"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-350">
                  {employees.map((emp) => (
                    <tr
                      key={emp.employeeId}
                      className="hover:bg-slate-800/30 transition-all group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            {emp.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{emp.firstName} {emp.lastName}</p>
                            <span className="text-xs text-slate-500">{emp.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-300">{emp.designation}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700/60 text-indigo-300 rounded-lg font-medium">
                          {emp.department?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{emp.email || 'N/A'}</td>
                      <td className="p-4 text-slate-400">{emp.salary ? `${emp.currency || 'USD'} ${emp.salary.toLocaleString()}` : 'N/A'}</td>
                      <td className="p-4 pr-6 text-slate-400">{emp.phone || 'N/A'}</td>
                      {canViewDetails && (
                        <td className="p-4 pr-6">
                          <button
                            onClick={() => openEmployeeDrawer(emp)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold transition-all"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={canViewDetails ? 7 : 6} className="text-center p-8 text-slate-500 font-medium">
                        No employees found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Org Chart View */}
      {activeTab === 'org' && (
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="font-semibold text-lg">Company Structure</h3>
          <div className="space-y-4">
            {orgChart.map((node) => (
              <div key={node.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">{node.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{node.title}</p>
                </div>
                {node.parentId ? (
                  <div className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-indigo-300">
                    Reports to: {orgChart.find(n => n.id === node.parentId)?.name || 'Manager'}
                  </div>
                ) : (
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-300 font-semibold">
                    Top Level (Leadership)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Employee Profile Drawer ─────────────────────────────────────── */}
      {selectedEmp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedEmp(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Drawer Header */}
            <div className="relative bg-gradient-to-br from-indigo-950/60 to-slate-900 p-6 border-b border-slate-800/60">
              {isHR && (
                <button
                  onClick={() => {
                    setEditEmp({
                      _id: selectedEmp._id,
                      firstName: selectedEmp.firstName || '',
                      lastName: selectedEmp.lastName || '',
                      email: selectedEmp.email || '',
                      designation: selectedEmp.designation || '',
                      role: selectedEmp.role || 'Employee',
                      password: '',
                      phone: selectedEmp.phone || '',
                      salary: selectedEmp.salary || '',
                      currency: selectedEmp.currency || 'USD',
                      department: selectedEmp.department?._id || selectedEmp.department || '',
                    });
                    setShowEditModal(true);
                  }}
                  className="absolute top-4 right-14 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
                >
                  Edit Details
                </button>
              )}
              <button
                onClick={() => setSelectedEmp(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-indigo-600/30">
                  {selectedEmp.firstName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </h2>
                  <p className="text-indigo-300 text-sm font-medium">{selectedEmp.designation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{selectedEmp.employeeId}</span>
                    <span className="text-slate-700">·</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                      {selectedEmp.department?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drawer Tabs */}
              <div className="flex gap-1 mt-5 bg-slate-950/40 p-1 rounded-xl">
                {DRAWER_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDrawerTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        drawerTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {drawerLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* ── Overview Tab ── */}
                  {drawerTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <DetailField icon={Mail}      label="Email"        value={selectedEmp.email} />
                        <DetailField icon={Phone}     label="Phone"        value={selectedEmp.phone} />
                        <DetailField icon={Briefcase} label="Designation"  value={selectedEmp.designation} />
                        <DetailField icon={Building2} label="Department"   value={selectedEmp.department?.name} />
                        <DetailField icon={DollarSign} label="Salary"      value={selectedEmp.salary ? `${selectedEmp.currency || 'USD'} ${selectedEmp.salary.toLocaleString()}` : null} />
                        <DetailField icon={Calendar}  label="Joined"       value={selectedEmp.dateOfJoining ? new Date(selectedEmp.dateOfJoining).toLocaleDateString() : null} />
                      </div>

                      {/* Leave Balance Summary */}
                      {drawerData.leaveBalance && (
                        <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Leave Balance</h4>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: 'Annual', key: 'annual', color: 'indigo' },
                              { label: 'Sick',   key: 'sick',   color: 'emerald' },
                              { label: 'Unpaid', key: 'unpaid', color: 'amber' },
                            ].map(({ label, key, color }) => (
                              <div key={key} className={`p-3 rounded-xl border bg-${color}-500/5 border-${color}-500/20 text-center`}>
                                <p className={`text-2xl font-bold text-${color}-400`}>{drawerData.leaveBalance[key] ?? 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Attendance Summary */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-center">
                            <p className="text-2xl font-bold text-emerald-400">
                              {drawerData.attendance.filter(a => a.status === 'Present').length}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Present</p>
                          </div>
                          <div className="p-3 rounded-xl border bg-amber-500/5 border-amber-500/20 text-center">
                            <p className="text-2xl font-bold text-amber-400">
                              {drawerData.attendance.filter(a => a.status === 'Late').length}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Late</p>
                          </div>
                          <div className="p-3 rounded-xl border bg-rose-500/5 border-rose-500/20 text-center">
                            <p className="text-2xl font-bold text-rose-400">
                              {drawerData.attendance.filter(a => a.status === 'Absent').length}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Absent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Leaves Tab ── */}
                  {drawerTab === 'leaves' && (
                    <div className="space-y-5">
                      {/* Balance Cards */}
                      {drawerData.leaveBalance && (
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Annual', key: 'annual', color: 'indigo' },
                            { label: 'Sick',   key: 'sick',   color: 'emerald' },
                            { label: 'Unpaid', key: 'unpaid', color: 'amber' },
                          ].map(({ label, key, color }) => (
                            <div key={key} className={`p-4 rounded-xl border bg-${color}-500/5 border-${color}-500/20 text-center`}>
                              <p className={`text-3xl font-bold text-${color}-400`}>{drawerData.leaveBalance[key] ?? 0}</p>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{label} Days Left</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Leave History */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Leave History</h4>
                        {drawerData.leaves.length === 0 ? (
                          <p className="text-center py-8 text-slate-500 text-sm">No leave requests found.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {drawerData.leaves.map(leave => (
                              <div key={leave._id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-sm text-slate-200 capitalize">{leave.leaveType} Leave</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                                      <span className="ml-2 text-slate-600">({leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''})</span>
                                    </p>
                                    {leave.reason && <p className="text-xs text-slate-500 mt-1 italic">"{leave.reason}"</p>}
                                  </div>
                                  <StatusBadge status={leave.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Attendance Tab ── */}
                  {drawerTab === 'attendance' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Attendance (Last 30 Records)</h4>
                      {drawerData.attendance.length === 0 ? (
                        <p className="text-center py-8 text-slate-500 text-sm">No attendance records found.</p>
                      ) : (
                        drawerData.attendance.map(record => (
                          <div key={record._id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-200">{record.date}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {record.punchIn ? `In: ${new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not punched in'}
                                  {record.punchOut ? ` · Out: ${new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                  {record.workHours ? ` · ${record.workHours}h` : ''}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={record.status} />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Documents Tab ── */}
                  {drawerTab === 'documents' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Uploaded Documents ({drawerData.documents.length})
                      </h4>
                      {drawerData.documents.length === 0 ? (
                        <p className="text-center py-8 text-slate-500 text-sm">No documents uploaded.</p>
                      ) : (
                        drawerData.documents.map(doc => (
                          <div key={doc._id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-200">{doc.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {doc.type?.toUpperCase()} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Open document"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── Add Employee Modal ──────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-semibold">Onboard Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-450 hover:text-slate-200 text-sm">
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">First Name</label>
                  <input type="text" required value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })} placeholder="John" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Last Name</label>
                  <input type="text" required value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })} placeholder="Doe" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5">Email Address</label>
                <input type="email" required value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="john.doe@company.com" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 lowercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Designation</label>
                  <input type="text" required value={newEmp.designation} onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })} placeholder="Software Engineer" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Role System</label>
                  <select value={newEmp.role} onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200">
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Initial Password</label>
                  <input type="password" required value={newEmp.password} onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })} placeholder="Welcome@123" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Department</label>
                  <select value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200">
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Phone Number</label>
                  <input type="text" value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} placeholder="+1 555-123-4567" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Salary</label>
                  <div className="flex gap-2">
                    <select value={newEmp.currency} onChange={(e) => setNewEmp({ ...newEmp, currency: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-205 w-24">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                    <input type="number" value={newEmp.salary} onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })} placeholder="e.g. 75000" className="flex-1 min-w-0 bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Employee Modal ──────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-semibold text-slate-100">Edit Employee Details</h3>
              <button onClick={() => { setShowEditModal(false); setError(null); }} className="text-slate-450 hover:text-slate-200 text-sm">
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEditEmployee} className="space-y-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">First Name</label>
                  <input type="text" required value={editEmp.firstName} onChange={(e) => setEditEmp({ ...editEmp, firstName: e.target.value })} placeholder="John" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Last Name</label>
                  <input type="text" required value={editEmp.lastName} onChange={(e) => setEditEmp({ ...editEmp, lastName: e.target.value })} placeholder="Doe" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5">Email Address</label>
                <input type="email" required value={editEmp.email} onChange={(e) => setEditEmp({ ...editEmp, email: e.target.value })} placeholder="john.doe@company.com" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 lowercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Designation</label>
                  <input type="text" required value={editEmp.designation} onChange={(e) => setEditEmp({ ...editEmp, designation: e.target.value })} placeholder="Software Engineer" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Role System</label>
                  <select value={editEmp.role} onChange={(e) => setEditEmp({ ...editEmp, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200">
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">New Password (Optional)</label>
                  <input type="password" value={editEmp.password} onChange={(e) => setEditEmp({ ...editEmp, password: e.target.value })} placeholder="Leave blank to keep same" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Department</label>
                  <select value={editEmp.department} onChange={(e) => setEditEmp({ ...editEmp, department: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200">
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Phone Number</label>
                  <input type="text" value={editEmp.phone} onChange={(e) => setEditEmp({ ...editEmp, phone: e.target.value })} placeholder="+1 555-123-4567" className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                </div>
                <div>
                  <label className="block mb-1.5">Salary</label>
                  <div className="flex gap-2">
                    <select value={editEmp.currency} onChange={(e) => setEditEmp({ ...editEmp, currency: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 w-24">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                    <input type="number" value={editEmp.salary} onChange={(e) => setEditEmp({ ...editEmp, salary: e.target.value })} placeholder="e.g. 75000" className="flex-1 min-w-0 bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button type="submit" className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
