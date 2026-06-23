import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, FileText } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminRequests = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [sortByDate, setSortByDate] = useState('desc'); // 'desc' | 'asc'

  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRequests();
      setApplications(data.applications);
      setFilteredApps(data.applications);
    } catch (err) {
      console.error(err);
      setError('Could not fetch student application queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  // Apply filters and searches
  useEffect(() => {
    let result = [...applications];

    // 1. Search Query (matches ID or Student name)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        app => 
          (app._id || app.id || '').toLowerCase().includes(q) ||
          `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(app => app.status === statusFilter);
    }

    // 3. Program Filter
    if (programFilter !== 'All') {
      result = result.filter(app => app.program === programFilter);
    }

    // 4. Sort Date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortByDate === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredApps(result);
  }, [search, statusFilter, programFilter, sortByDate, applications]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-255';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Pending Review':
      case 'Submitted':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Attestation Applications Queue</h2>
          <p className="text-xs text-slate-500">Search and audit degree attestation requests from all programs.</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filters row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-premium flex flex-col md:flex-row gap-4 items-center">
        
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID or Student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-1 focus:ring-iqra-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 text-xs font-semibold text-slate-600">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none"
            >
              <option value="All">All Programs</option>
              <option value="BS Computer Science">BS Computer Science</option>
              <option value="BS Software Engineering">BS Software Engineering</option>
              <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
              <option value="BE Electrical Engineering">BE Electrical Engineering</option>
            </select>
          </div>

          <div>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-xs">Loading queue databases...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium text-xs">
            No records matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 uppercase tracking-wider text-[10px] font-bold">
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">AI Rec</th>
                  <th className="px-6 py-4">Final Status</th>
                  <th className="px-6 py-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{app._id || app.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {app.personalInfo?.firstName} {app.personalInfo?.lastName}
                    </td>
                    <td className="px-6 py-4">{app.program}</td>
                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {app.payment?.status === 'Paid' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">Paid</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {app.aiVerification?.finalDecision === 'Passed' ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">PASS</span>
                      ) : (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">FAIL</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(app.status)}`}>
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

export default AdminRequests;
