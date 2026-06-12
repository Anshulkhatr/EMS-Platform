import React, { useEffect, useState } from 'react';
import { Mail, Send, Users, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const ROLES = ['Employee', 'Manager', 'HR', 'Leadership', 'Admin'];

const DirectEmail = () => {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    recipientType: 'all',
    role: 'Employee',
    emails: '',
  });
  const [history, setHistory] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');

  const fetchData = async () => {
    try {
      const [historyRes, recipientsRes, statusRes] = await Promise.all([
        axiosInstance.get('/emails/history'),
        axiosInstance.get('/emails/recipients'),
        axiosInstance.get('/emails/status'),
      ]);
      setHistory(historyRes.data?.data || []);
      setRecipients(recipientsRes.data?.data || []);
      setSmtpStatus(statusRes.data?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        subject: form.subject,
        body: form.body,
        recipientType: form.recipientType,
      };

      if (form.recipientType === 'role') {
        payload.role = form.role;
      }

      if (form.recipientType === 'individual') {
        payload.emails = form.emails
          .split(/[,;\n]/)
          .map((e) => e.trim())
          .filter(Boolean);
      }

      const res = await axiosInstance.post('/emails/send', payload);
      setSuccess(res.data?.message || 'Email sent successfully');
      setForm({ subject: '', body: '', recipientType: 'all', role: 'Employee', emails: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      sent: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      partial: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      failed: 'bg-red-500/10 border-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-lg border font-medium ${styles[status] || styles.failed}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Direct Email</h1>
        <p className="text-slate-400 mt-1">
          Send messages to all registered users, a role group, or specific email addresses via Brevo SMTP.
        </p>
      </div>

      {smtpStatus && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            smtpStatus.configured
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
          }`}
        >
          {smtpStatus.configured ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div className="text-sm">
            {smtpStatus.configured ? (
              <span>
                SMTP connected via <strong>{smtpStatus.host}</strong> — sending from{' '}
                <strong>{smtpStatus.from}</strong>
              </span>
            ) : (
              <span>
                SMTP not configured. Set Brevo env vars on Render: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all inline-flex items-center gap-2 ${
            activeTab === 'compose'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Compose
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all inline-flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <form onSubmit={handleSend} className="lg:col-span-2 glass rounded-2xl border border-slate-800 p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Recipients
              </label>
              <select
                value={form.recipientType}
                onChange={(e) => setForm({ ...form, recipientType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              >
                <option value="all">All registered users ({recipients.length})</option>
                <option value="role">By role</option>
                <option value="individual">Specific emails</option>
              </select>
            </div>

            {form.recipientType === 'role' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.recipientType === 'individual' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email addresses (comma or newline separated)
                </label>
                <textarea
                  rows={3}
                  value={form.emails}
                  onChange={(e) => setForm({ ...form, emails: e.target.value })}
                  placeholder="user1@gmail.com, user2@gmail.com"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={8}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !smtpStatus?.configured}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </form>

          <div className="glass rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Users className="w-5 h-5 text-indigo-400" />
              Registered Users
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recipients.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-sm"
                >
                  <span className="text-slate-300 truncate">{r.email}</span>
                  <span className="text-xs text-slate-500 ml-2 shrink-0">{r.role}</span>
                </div>
              ))}
              {recipients.length === 0 && (
                <p className="text-sm text-slate-500">No registered users found.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Subject</th>
                  <th className="p-4">Recipients</th>
                  <th className="p-4">Sent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {history.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4 pl-6 font-medium text-slate-200">{log.subject}</td>
                    <td className="p-4 text-slate-400">
                      {log.recipientType === 'all'
                        ? 'All users'
                        : log.recipientType === 'role'
                          ? `Role: ${log.role}`
                          : `${log.recipients?.length || 0} selected`}
                    </td>
                    <td className="p-4 text-slate-400">
                      {log.sentCount}/{log.recipients?.length || 0}
                    </td>
                    <td className="p-4">{statusBadge(log.status)}</td>
                    <td className="p-4 pr-6 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-slate-500">
                      No emails sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectEmail;
