import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { adminService } from '../../services/api';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underAiReview: 0,
    paymentVerified: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const data = await adminService.getRequests();
        setStats(data.stats);
        
        // Take the 5 most recent requests
        const recent = data.applications.slice(0, 5);
        setRecentApps(recent);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        setError('Failed to retrieve statistics and requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Pending Review':
      case 'Submitted':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Gathering admin stats logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Staff Overview Panel</h2>
        <p className="text-xs text-slate-500">Monitor database workloads and run attestation audits.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Audit', val: stats.pending, icon: Clock, style: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Attested / Approved', val: stats.approved, icon: CheckCircle, style: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Rejections Logged', val: stats.rejected, icon: XCircle, style: 'text-rose-600 bg-rose-50 border-rose-200' },
          { label: 'Total Inquiries', val: stats.total, icon: FileText, style: 'text-iqra-600 bg-iqra-50 border-iqra-200' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-premium space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-lg border ${card.style}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-850 tracking-tight">{card.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent requests table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Inbox className="w-5 h-5 text-slate-500" />
            Recent Unaudited Filings
          </h3>
          <Link
            to="/admin/requests"
            className="text-xs font-bold text-iqra-600 hover:text-iqra-700 flex items-center gap-1 transition-colors"
          >
            All Requests Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">
            No attestation requests registered in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 uppercase tracking-wider text-[10px] font-bold">
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">AI Recommendation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{app._id || app.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{app.personalInfo.firstName} {app.personalInfo.lastName}</td>
                    <td className="px-6 py-4">{app.program}</td>
                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {app.aiVerification?.finalDecision === 'Passed' ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">PASS</span>
                      ) : (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">FAIL</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/requests/${app._id || app.id}`}
                        className="inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
