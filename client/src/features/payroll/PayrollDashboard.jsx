import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  DollarSign, Download, Printer, CheckCircle2, Clock, X,
  TrendingUp, Users, Calendar, ChevronRight, Sparkles,
  Receipt, Banknote, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Unpaid: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => (
  <div className="glass p-5 rounded-2xl border border-[var(--theme-border)] flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-[var(--theme-text)] mt-0.5">{value}</p>
    </div>
  </div>
);

const PayslipModal = ({ payslip, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=700');
    win.document.write(`
      <html>
        <head>
          <title>Payslip - ${payslip.employee?.firstName || 'Employee'} ${MONTHS[new Date().getMonth()]} ${payslip.year}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
            .company-name { font-size: 22px; font-weight: 800; color: #4f46e5; }
            .company-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
            .title { font-size: 14px; font-weight: 700; color: #64748b; text-align: right; text-transform: uppercase; letter-spacing: 2px; }
            .emp-section { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; }
            .field p { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
            .total-row td { font-weight: 800; font-size: 15px; color: #4f46e5; background: #eef2ff; padding: 14px 12px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
            .status.paid { background: #dcfce7; color: #16a34a; }
            .status.unpaid { background: #fee2e2; color: #dc2626; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const emp = payslip.employee || {};
  const grossPay = payslip.baseSalary || 0;
  const ratio = payslip.presentDays / (payslip.totalWorkingDays || 22);
  const earned = Math.round(grossPay * ratio);
  const bonus = payslip.bonus || 0;
  const deductions = payslip.deductions || 0;
  const net = payslip.netPay || earned + bonus - deductions;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--theme-text)]">Payslip</h2>
              <p className="text-xs text-[var(--theme-text-muted)]">{payslip.month} {payslip.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)] rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div ref={printRef}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
              <div>
                <div className="company-name" style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>EMS Platform</div>
                <div className="company-sub" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Enterprise Management System</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="title" style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Payslip</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{payslip.month} {payslip.year}</div>
                <div style={{ marginTop: '6px' }}>
                  <span className={`status ${payslip.status?.toLowerCase()}`} style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: payslip.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                    color: payslip.status === 'Paid' ? '#16a34a' : '#dc2626'
                  }}>
                    {payslip.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="emp-section" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Employee Name', value: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A' },
                { label: 'Employee ID', value: emp.employeeId || 'N/A' },
                { label: 'Designation', value: emp.designation || 'N/A' },
                { label: 'Department', value: emp.department?.name || 'N/A' },
              ].map(f => (
                <div key={f.label} className="field">
                  <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700 }}>{f.label}</label>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{f.value}</p>
                </div>
              ))}
            </div>

            {/* Earnings & Deductions Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 700 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Base Salary', val: grossPay },
                  { label: `Attendance (${payslip.presentDays}/${payslip.totalWorkingDays || 22} days)`, val: earned },
                  ...(bonus ? [{ label: 'Bonus', val: bonus }] : []),
                  ...(deductions ? [{ label: 'Deductions', val: -deductions }] : []),
                ].map(row => (
                  <tr key={row.label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#334155' }}>{row.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: row.val < 0 ? '#dc2626' : '#334155' }}>
                      ${Math.abs(row.val).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#eef2ff' }}>
                  <td style={{ padding: '12px', fontWeight: 800, fontSize: '15px', color: '#4f46e5' }}>Net Pay</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: '#4f46e5' }}>${net.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div className="footer" style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
              This is a system-generated payslip. EMS Platform © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PayrollDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role);

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [genMonth, setGenMonth] = useState(MONTHS[new Date().getMonth()]);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('');

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const url = isAdminOrHR ? '/payroll/admin-list' : '/payroll/my-history';
      const res = await axiosInstance.get(url);
      setPayrolls(res.data?.data || []);
    } catch (err) {
      setError('Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayrolls(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/payroll/generate', { month: genMonth, year: genYear });
      setSuccess(`Generated payroll for ${res.data.count} employee(s) for ${genMonth} ${genYear}.`);
      fetchPayrolls();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await axiosInstance.put(`/payroll/${id}/status`, { status: 'Paid' });
      setPayrolls(prev => prev.map(p => p._id === id ? { ...p, status: 'Paid' } : p));
    } catch (err) {
      setError('Failed to update payroll status.');
    }
  };

  const filtered = filterMonth
    ? payrolls.filter(p => p.month === filterMonth)
    : payrolls;

  const totalPaid = payrolls.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.netPay || 0), 0);
  const totalUnpaid = payrolls.filter(p => p.status === 'Unpaid').reduce((s, p) => s + (p.netPay || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-text)]">Payroll Management</h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            {isAdminOrHR ? 'Generate, review and process employee payroll.' : 'View your payslip history and payment status.'}
          </p>
        </div>
        {isAdminOrHR && (
          <div className="flex items-center gap-2 glass px-4 py-3 rounded-2xl border border-[var(--theme-border)]">
            <select
              value={genMonth}
              onChange={e => setGenMonth(e.target.value)}
              className="bg-transparent text-[var(--theme-text)] text-sm font-semibold outline-none cursor-pointer"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={genYear}
              onChange={e => setGenYear(Number(e.target.value))}
              className="bg-transparent text-[var(--theme-text)] text-sm font-semibold outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      {isAdminOrHR && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Records" value={payrolls.length} color="indigo" />
          <StatCard icon={CheckCircle2} label="Paid" value={payrolls.filter(p => p.status === 'Paid').length} color="emerald" />
          <StatCard icon={Clock} label="Unpaid" value={payrolls.filter(p => p.status === 'Unpaid').length} color="rose" />
          <StatCard icon={DollarSign} label="Total Paid Out" value={`$${totalPaid.toLocaleString()}`} color="amber" />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--theme-accent)] transition-all"
        >
          <option value="">All Months</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-sm text-[var(--theme-text-muted)]">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Payroll Table */}
      <div className="glass rounded-2xl border border-[var(--theme-border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--theme-text-muted)]">
            <Banknote className="w-12 h-12 mb-3 stroke-[1.5] opacity-40" />
            <p className="font-semibold">No payroll records found</p>
            <p className="text-sm mt-1 opacity-60">
              {isAdminOrHR ? 'Generate payroll using the button above.' : 'Your payslips will appear here once processed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-card)] text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
                  {isAdminOrHR && <th className="p-4 pl-6">Employee</th>}
                  <th className="p-4">Period</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Attendance</th>
                  <th className="p-4">Net Pay</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-[var(--theme-border-muted)] transition-all group">
                    {isAdminOrHR && (
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                            {(p.employee?.firstName?.[0] || '?')}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--theme-text)]">{p.employee?.firstName} {p.employee?.lastName}</p>
                            <p className="text-xs text-[var(--theme-text-muted)]">{p.employee?.designation || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--theme-text-muted)]" />
                        <span className="font-semibold text-[var(--theme-text)]">{p.month} {p.year}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--theme-text)]">${(p.baseSalary || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--theme-border)] rounded-full overflow-hidden max-w-[60px]">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.round(((p.presentDays || 0) / (p.totalWorkingDays || 22)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--theme-text-muted)] font-medium">
                          {p.presentDays}/{p.totalWorkingDays || 22}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[var(--theme-text)]">${(p.netPay || 0).toLocaleString()}</span>
                    </td>
                    <td className="p-4"><StatusBadge status={p.status} /></td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--theme-border)] hover:bg-[var(--theme-accent)]/10 hover:text-[var(--theme-accent)] text-[var(--theme-text-muted)] rounded-lg text-xs font-semibold transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </button>
                        {isAdminOrHR && p.status === 'Unpaid' && (
                          <button
                            onClick={() => handleMarkPaid(p._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
      )}
    </div>
  );
};

export default PayrollDashboard;
