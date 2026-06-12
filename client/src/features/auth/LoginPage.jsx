import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantName: '',
    firstName: '',
    lastName: '',
    tenantId: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'auth/loginRequest' });

    try {
      if (isRegistering) {
        const response = await axiosInstance.post('/auth/register-tenant', {
          tenantName: formData.tenantName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        dispatch({ type: 'auth/registerSuccess', payload: response.data });
      } else {
        const response = await axiosInstance.post('/auth/login', {
          email: formData.email,
          password: formData.password,
          tenantId: formData.tenantId || undefined,
        });
        dispatch({ type: 'auth/loginSuccess', payload: response.data });
      }
      navigate('/dashboard');
    } catch (err) {
      dispatch({
        type: isRegistering ? 'auth/registerFailure' : 'auth/loginFailure',
        payload: err.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isRegistering ? 'Onboard your Company' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {isRegistering
              ? 'Get started by creating your enterprise tenant and admin account'
              : 'Enter your credentials to access the EMS dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  name="tenantName"
                  required
                  value={formData.tenantName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {!isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Tenant ID (Optional)</label>
              <input
                type="text"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                placeholder="e.g. 60d21b4667d0d8992b610c85"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-all"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : isRegistering ? 'Create Workspace' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              dispatch({ type: 'auth/loginFailure', payload: null });
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-all"
          >
            {isRegistering ? 'Already have a workspace? Login' : 'Need a new corporate workspace? Onboard Company'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
