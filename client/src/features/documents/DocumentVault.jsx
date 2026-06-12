import React, { useEffect, useState } from 'react';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchDocuments = async () => {
    try {
      const res = await axiosInstance.get('/documents');
      setDocuments(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName || file.name);

    try {
      await axiosInstance.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      setDocName('');
      fetchDocuments();
      setMsg({ type: 'success', text: 'Document uploaded successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/documents/${id}`);
      fetchDocuments();
      setMsg({ type: 'success', text: 'Document deleted successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to delete document' });
    }
  };

  const getFullFileUrl = (url) => {
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
        <p className="text-slate-400 mt-1">Upload and access company policies, identity forms, and contracts securely.</p>
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
        {/* Upload form */}
        <div className="glass p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Upload Document</h3>
          <form onSubmit={handleUpload} className="space-y-4 text-xs font-semibold text-slate-450 uppercase tracking-wider">
            <div>
              <label className="block mb-1.5">Document Label Name</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Passport copy"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 normal-case"
              />
            </div>

            <div>
              <label className="block mb-1.5">File Attachment</label>
              <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-all cursor-pointer relative bg-slate-950/20">
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-slate-300 font-semibold text-xs tracking-normal mt-1">
                  {file ? file.name : 'Select or drop a file'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium tracking-normal mt-1">
                  Max size: 5MB (PDF, DOCX, Images)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>

        {/* Listing */}
        <div className="glass p-6 rounded-2xl space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-lg border-b border-slate-800/60 pb-3">Available Documents</h3>
          {documents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No documents uploaded yet in this workspace.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div key={doc._id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{doc.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Uploaded by: {doc.uploadedBy?.email || 'N/A'} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={getFullFileUrl(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-350 hover:text-slate-100 rounded-xl transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
