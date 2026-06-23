import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side domain validation
    const iqraDomain = '@iqra.edu.pk';
    if (!email.toLowerCase().endsWith(iqraDomain)) {
      setError(`Attestation requires an official Iqra University email address ending with "${iqraDomain}".`);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-iqra-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* University Logo Mock */}
        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-iqra-500 to-iqra-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-iqra-900/40 border border-iqra-400/20">
          <GraduationCap className="h-9 w-9" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
          Iqra University
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Secure Online Degree Attestation System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50 sm:px-10">
          <div className="border-b border-slate-700 pb-4 mb-6">
            <span className="text-sm font-semibold tracking-wider text-iqra-400 uppercase">
              Student Registration & Login
            </span>
          </div>

          {error && (
            <div className="mb-6 bg-rose-950/30 border border-rose-800/50 text-rose-300 p-4 rounded-xl text-sm flex gap-3 items-start">
              <span className="font-bold shrink-0 mt-0.5">⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                University Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iqra-500 focus:border-iqra-500 transition-all text-sm"
                  placeholder="student@iqra.edu.pk"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-iqra-500 focus:border-iqra-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-iqra-600 to-iqra-500 hover:from-iqra-500 hover:to-iqra-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iqra-500 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Seed credentials assistance */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/40 inline-flex flex-col gap-1 text-[11px] text-slate-400 max-w-xs">
              <span className="font-semibold text-iqra-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Demo Access Account
              </span>
              <p>Email: <code className="text-white">student@iqra.edu.pk</code></p>
              <p>Password: <code className="text-white">student123</code></p>
            </div>
            
            <div className="mt-4">
              <Link
                to="/admin/login"
                className="text-xs font-semibold text-iqra-400 hover:text-iqra-300 transition-colors"
              >
                Access Administrator Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
