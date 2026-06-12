import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-450 border border-rose-500/20 shadow-lg shadow-rose-600/10">
        <span className="font-extrabold text-2xl">!</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Access Restricted</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          You do not have the required access permissions to view this system console page. Please contact your administrator.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
