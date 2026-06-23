import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FilePlus, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { applicationService } from '../../services/api';

const Dashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const apps = await applicationService.getByStudent(user.email);
        setApplications(apps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your attestation logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'Pending Review':
      case 'Submitted':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Under AI Verification':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> AI Analyzing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" /> Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-iqra-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Fetching portal applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-iqra-800 to-iqra-650 rounded-2xl p-8 text-white shadow-xl shadow-iqra-950/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Assalam-o-Alaikum, {user?.firstName || 'Student'}!
          </h2>
          <p className="text-slate-200 text-sm max-w-xl">
            Welcome to the Iqra University Online Attestation Portal. File your documents, track your validation status in real-time, and download your attested degree verification form.
          </p>
        </div>
        <Link
          to="/application"
          className="flex items-center gap-2 px-5 py-3 bg-white text-iqra-800 font-bold rounded-xl shadow-lg hover:bg-slate-50 active:scale-[0.98] transition-all text-sm shrink-0"
        >
          <FilePlus className="w-4 h-4 text-iqra-700" />
          Request Attestation
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Your Requests</h3>
            <span className="text-xs font-semibold text-slate-400">Total: {applications.length}</span>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-premium">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="font-bold text-slate-700 text-base mb-1">No Applications Found</h4>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                You have not registered any degree attestation requests yet. Ready to start?
              </p>
              <Link
                to="/application"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-iqra-50 hover:bg-iqra-100 text-iqra-700 font-bold rounded-xl text-sm transition-colors border border-iqra-200/50"
              >
                Start Attestation Wizard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app._id || app.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium hover:border-iqra-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800 text-sm tracking-tight">{app.program}</h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                      <span>ID: <code className="text-slate-800 font-semibold">{app._id || app.id}</code></span>
                      <span>Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Link
                      to={`/status/${app._id || app.id}`}
                      className="w-full sm:w-auto text-center px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      Track Request
                    </Link>
                    {app.status === 'Approved' && (
                      <Link
                        to={`/approved/${app._id || app.id}`}
                        className="w-full sm:w-auto text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-900/10 transition-colors"
                      >
                        Attestation Form
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informational / Profile Summary Panel */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Quick Info</h3>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicant Profile</span>
              <p className="font-bold text-slate-850 mt-1 text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.email}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attestation Criteria</h4>
              <ul className="space-y-3 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-iqra-50 text-iqra-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span>Minimum CGPA required: <strong>2.5</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-iqra-50 text-iqra-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span>Min Intermediate Score: <strong>50%</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-iqra-50 text-iqra-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span>CNIC Expiration Date valid (future)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-iqra-50 text-iqra-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span>CNIC OCR Match passes</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Attestation Fees
              </span>
              <p className="text-sm font-bold text-slate-800">PKR 5,000 / Request</p>
              <p className="text-[10px] text-slate-400 leading-tight">Payable using Visa, Mastercard, JazzCash, EasyPaisa, or Web3 Crypto Wallets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
