import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Receipt, Plus, X, CheckCircle2, XCircle, Clock, AlertCircle,
  Upload, DollarSign, Filter, Eye, MessageSquare, Paperclip,
  TrendingUp, Inbox, ChevronDown, RefreshCw
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const CATEGORIES = ['Travel', 'Meals', 'Software', 'Equipment', 'Other'];

const STATUS_STYLES = {
  Pending:  { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  Approved: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  Rejected: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle },
};

const CAT_COLORS = {
  Travel:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Meals:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Software:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Equipment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Other:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${s.badge}`}>
      <Icon className="w-3 h-3" />
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

// ─── Review Modal (HR/Admin) ──────────────────────────────────────────────
const ReviewModal = ({ expense, onClose, onUpdate }) => {
  const [comment, setComment] = useState(expense.comment || '');
  const [loading, setLoading] = useState(false);

  const handleDecision = async (status) => {
    setLoading(true);
    try {
      const res = await axiosInstance.put(`/expenses/${expense._id}/status`, { status, comment });
      onUpdate(res.data.data);
      onClose();
    } catch (err) {
      console.error('Failed to update expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--theme-text)]">Review Claim</h2>
              <p className="text-xs text-[var(--theme-text-muted)]">{expense.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--theme-border)] rounded-xl transition-all text-[var(--theme-text-muted)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Expense Info */}
          <div className="glass p-4 rounded-2xl border border-[var(--theme-border)] space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[var(--theme-text)]">{expense.title}</p>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  By: {expense.employee?.firstName} {expense.employee?.lastName}
                  {expense.employee?.designation && ` · ${expense.employee.designation}`}
                </p>
              </div>
              <span className="text-xl font-bold text-[var(--theme-accent)]">${Number(expense.amount).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${CAT_COLORS[expense.category] || CAT_COLORS.Other}`}>
                {expense.category}
              </span>
              <StatusBadge status={expense.status} />
              <span className="text-xs text-[var(--theme-text-muted)]">
                {new Date(expense.createdAt).toLocaleDateString()}
              </span>
            </div>

            {expense.receiptUrl && (
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--theme-accent)] hover:underline font-semibold"
              >
                <Paperclip className="w-3.5 h-3.5" />
                View Receipt
              </a>
            )}
          </div>

          {/* Comment Box */}
          <div>
            <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-2">
              Review Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a note for the employee..."
              rows={3}
              className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-3 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-accent)] resize-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          {expense.status === 'Pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleDecision('Approved')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => handleDecision('Rejected')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-600/20"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {expense.status !== 'Pending' && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_STYLES[expense.status]?.badge || ''}`}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Claim already {expense.status.toLowerCase()}</p>
                {expense.comment && <p className="text-xs mt-0.5 opacity-75">"{expense.comment}"</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const ExpenseDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const isAdminOrHR = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [reviewExpense, setReviewExpense] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Other',
    comment: '',
    file: null,
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const url = isAdminOrHR ? '/expenses/admin-list' : '/expenses/my-history';
      const res = await axiosInstance.get(url);
      setExpenses(res.data?.data || []);
    } catch (err) {
      setError('Failed to load expense records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('amount', form.amount);
      fd.append('category', form.category);
      fd.append('comment', form.comment);
      if (form.file) fd.append('receipt', form.file);

      await axiosInstance.post('/expenses/claim', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Expense claim submitted successfully!');
      setShowForm(false);
      setForm({ title: '', amount: '', category: 'Other', comment: '', file: null });
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewUpdate = (updated) => {
    setExpenses(prev => prev.map(e => e._id === updated._id ? { ...e, ...updated } : e));
  };

  const filtered = expenses.filter(e => {
    if (filterStatus && e.status !== filterStatus) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    return true;
  });

  const totalAmount = filtered.reduce((s, e) => s + Number(e.amount || 0), 0);
  const pendingCount = expenses.filter(e => e.status === 'Pending').length;
  const approvedTotal = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-text)]">Expense Management</h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            {isAdminOrHR ? 'Review and process employee expense reimbursement claims.' : 'Submit and track your expense reimbursement claims.'}
          </p>
        </div>
        {!isAdminOrHR && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[var(--theme-accent-glow)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Submit Claim
          </button>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Receipt} label="Total Claims" value={expenses.length} color="indigo" />
        <StatCard icon={Clock} label="Pending Review" value={pendingCount} color="amber" />
        <StatCard icon={CheckCircle2} label="Approved Total" value={`$${approvedTotal.toLocaleString()}`} color="emerald" />
        <StatCard icon={DollarSign} label="Filtered Amount" value={`$${totalAmount.toLocaleString()}`} color="purple" />
      </div>

      {/* Submit Form */}
      {showForm && !isAdminOrHR && (
        <div className="glass border border-[var(--theme-border)] rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[var(--theme-text)]">New Expense Claim</h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--theme-border)] rounded-xl transition-all text-[var(--theme-text-muted)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flight to NYC for client meeting"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-accent)] transition-all"
              />
            </div>
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Amount (USD) *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-accent)] transition-all"
                />
              </div>
            </div>
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-accent)] transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Note */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Note / Description</label>
              <textarea
                placeholder="Provide a brief description or justification..."
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                rows={2}
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-4 py-3 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-accent)] resize-none transition-all"
              />
            </div>
            {/* Receipt Upload */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Attach Receipt (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-3 p-4 bg-[var(--theme-input-bg)] border-2 border-dashed border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-xl cursor-pointer transition-all group"
              >
                <Upload className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-accent)] transition-colors" />
                <div>
                  <p className="text-sm font-medium text-[var(--theme-text)]">
                    {form.file ? form.file.name : 'Click to upload receipt'}
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)]">PDF, PNG, JPG up to 10MB</p>
                </div>
                {form.file && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })); }}
                    className="ml-auto p-1 hover:bg-[var(--theme-border)] rounded-lg transition-all text-[var(--theme-text-muted)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={e => setForm(f => ({ ...f, file: e.target.files[0] || null }))}
              />
            </div>
            {/* Submit */}
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--theme-accent-glow)] disabled:opacity-60"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter:</span>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[var(--theme-accent)] transition-all"
        >
          <option value="">All Status</option>
          {['Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[var(--theme-accent)] transition-all"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-[var(--theme-text-muted)] ml-auto">{filtered.length} claim{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="glass border border-[var(--theme-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--theme-text-muted)]">
            <Inbox className="w-12 h-12 mb-3 stroke-[1.5] opacity-40" />
            <p className="font-semibold">No expense claims found</p>
            <p className="text-sm mt-1 opacity-60">
              {!isAdminOrHR ? 'Submit your first claim using the button above.' : 'No claims match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-card)] text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
                  {isAdminOrHR && <th className="p-4 pl-6">Employee</th>}
                  <th className="p-4">Expense</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm">
                {filtered.map(e => (
                  <tr key={e._id} className="hover:bg-[var(--theme-border-muted)] transition-all group">
                    {isAdminOrHR && (
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                            {(e.employee?.firstName?.[0] || '?')}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--theme-text)]">{e.employee?.firstName} {e.employee?.lastName}</p>
                            <p className="text-xs text-[var(--theme-text-muted)]">{e.employee?.designation || ''}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-[var(--theme-text)] max-w-xs truncate">{e.title}</p>
                        {e.comment && (
                          <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 max-w-xs truncate italic">"{e.comment}"</p>
                        )}
                        {e.receiptUrl && (
                          <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[var(--theme-accent)] font-semibold mt-1 hover:underline">
                            <Paperclip className="w-3 h-3" /> Receipt
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${CAT_COLORS[e.category] || CAT_COLORS.Other}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[var(--theme-text)]">${Number(e.amount).toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-[var(--theme-text-muted)] text-xs font-medium">
                      {new Date(e.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4"><StatusBadge status={e.status} /></td>
                    <td className="p-4 pr-6">
                      {isAdminOrHR ? (
                        <button
                          onClick={() => setReviewExpense(e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            e.status === 'Pending'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-[var(--theme-border)] hover:bg-[var(--theme-border-muted)] text-[var(--theme-text-muted)]'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {e.status === 'Pending' ? 'Review' : 'View'}
                        </button>
                      ) : (
                        e.comment && (
                          <div className="flex items-center gap-1 text-xs text-[var(--theme-text-muted)]" title={e.comment}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="max-w-[120px] truncate">{e.comment}</span>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewExpense && (
        <ReviewModal
          expense={reviewExpense}
          onClose={() => setReviewExpense(null)}
          onUpdate={handleReviewUpdate}
        />
      )}
    </div>
  );
};

export default ExpenseDashboard;
