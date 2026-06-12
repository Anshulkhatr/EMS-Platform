import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, Plus, MapPin, Clock, Pencil, Trash2, X } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const emptyJob = {
  title: '',
  description: '',
  department: '',
  location: 'Remote',
  employmentType: 'Full-time',
  status: 'Open',
  salary: '',
  requirements: '',
};

const statusColors = {
  Open: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  Closed: 'bg-red-500/10 border-red-500/20 text-red-400',
  Draft: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
};

const JobBoard = () => {
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const canManage = ['Admin', 'HR'].includes(user?.role);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get('/jobs');
      setJobs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreate = () => {
    setEditingJob(null);
    setForm(emptyJob);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      department: job.department || '',
      location: job.location || 'Remote',
      employmentType: job.employmentType || 'Full-time',
      status: job.status || 'Open',
      salary: job.salary || '',
      requirements: job.requirements || '',
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (editingJob) {
        await axiosInstance.put(`/jobs/${editingJob._id}`, form);
        setSuccess('Job updated. All registered users will be notified by email.');
      } else {
        await axiosInstance.post('/jobs', form);
        setSuccess('Job posted. All registered users will be notified by email.');
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await axiosInstance.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
          <p className="text-slate-400 mt-1">
            Post and manage openings. New posts and updates email every registered user.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="glass rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.department || 'General'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-lg border font-medium ${statusColors[job.status]}`}>
                {job.status}
              </span>
            </div>

            <p className="text-sm text-slate-400 line-clamp-3">{job.description}</p>

            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.employmentType}
              </span>
            </div>

            {job.salary && (
              <p className="text-sm text-indigo-300 font-medium">{job.salary}</p>
            )}

            {canManage && (
              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => openEdit(job)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500">
            No job postings yet.
            {canManage && ' Click "Post Job" to create one.'}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-semibold">{editingJob ? 'Edit Job' : 'Post New Job'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft (no email)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. $80k–100k"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Requirements
                </label>
                <textarea
                  rows={3}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 resize-none"
                />
              </div>

              <p className="text-xs text-slate-500">
                Open and Closed jobs trigger email + in-app notifications to all registered users. Drafts are saved silently.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
              >
                {loading ? 'Saving...' : editingJob ? 'Update Job' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-6 right-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm shadow-lg max-w-sm">
          {success}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
