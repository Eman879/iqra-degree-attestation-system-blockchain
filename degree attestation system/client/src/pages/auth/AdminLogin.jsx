import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { authService } from '../../services/api';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.adminLogin(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center text-white shadow-xl border border-slate-600/30">
          <GraduationCap className="h-9 w-9 text-slate-300" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
          Iqra University
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Academic Attestation Verification Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800/80 shadow-2xl rounded-2xl py-8 px-6 sm:px-10">
          <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wider text-amber-500 uppercase">
              Staff Portal Access
            </span>
            <div className="bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold tracking-wider uppercase">
              SECURE
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-rose-950/40 border border-rose-900/50 text-rose-400 p-4 rounded-xl text-sm leading-relaxed">
              <strong>⚠️ Auth Error:</strong> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Staff Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  placeholder="admin@iqra.edu.pk"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Verification Key / Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In as Staff'}
                {!loading && <ArrowRight className="w-4 h-4 text-slate-950" />}
              </button>
            </div>
          </form>

          {/* Seed credentials assistance */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 inline-flex flex-col gap-1 text-[11px] text-slate-500 max-w-xs">
              <span className="font-semibold text-amber-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Staff Demo Credentials
              </span>
              <p>Email: <code className="text-slate-300">admin@iqra.edu.pk</code></p>
              <p>Password: <code className="text-slate-300">admin123</code></p>
            </div>

            <div className="mt-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Student Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
