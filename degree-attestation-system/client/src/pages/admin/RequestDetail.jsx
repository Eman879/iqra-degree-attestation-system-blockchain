import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  ShieldX,
  CreditCard,
  User,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/api';

const RequestDetail = ({ user }) => {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Rejection Form State
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchApplication = async () => {
    try {
      // Find the specific application by searching the list
      const data = await adminService.getRequests();
      const match = data.applications.find(a => a._id === applicationId || a.id === applicationId);
      if (!match) {
        setError('Application record not found.');
      } else {
        setApp(match);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchApplication();
  }, [applicationId, user, navigate]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await adminService.approveRequest(applicationId);
      setSuccessMsg('Attestation request approved and certificate hash generated successfully!');
      setTimeout(() => navigate('/admin/requests'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during approval.');
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejecting the attestation.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await adminService.rejectRequest(applicationId, rejectReason);
      setSuccessMsg('Attestation request rejected successfully.');
      setRejectMode(false);
      setTimeout(() => navigate('/admin/requests'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during rejection.');
      setActionLoading(false);
    }
  };

  const getDocUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:4000${filePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Fetching student application folder...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="text-rose-500 text-4xl">⚠️</div>
        <h3 className="font-bold text-slate-800 text-lg">Error Loading Record</h3>
        <p className="text-slate-550 text-sm">{error || 'Filing record not found in system directories.'}</p>
        <Link to="/admin/requests" className="inline-block px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <Link 
          to="/admin/requests" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-550 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Return to Queue
        </Link>
        <span className="text-xs font-bold text-slate-400">Ref: <code className="text-slate-700">{app._id || app.id}</code></span>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (Personal, Academic, Documents) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Student Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-slate-500" /> Student Identity Folder
            </h3>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-medium text-slate-600">
              <p>Name: <strong className="text-slate-800">{app.personalInfo?.firstName} {app.personalInfo?.lastName}</strong></p>
              <p>CNIC Number: <strong className="text-slate-800">{app.personalInfo?.cnic}</strong></p>
              <p>DOB: <strong className="text-slate-800">{app.personalInfo?.dob ? new Date(app.personalInfo.dob).toLocaleDateString() : 'N/A'}</strong></p>
              <p>Expiry: <strong className="text-slate-800">{app.personalInfo?.cnicExpiryDate ? new Date(app.personalInfo.cnicExpiryDate).toLocaleDateString() : 'N/A'}</strong></p>
              <p className="col-span-2">Address: <strong className="text-slate-800">{app.personalInfo?.address}</strong></p>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-slate-500" /> Academic Submissions
            </h3>
            
            <div className="grid grid-cols-3 gap-6 text-xs font-medium text-slate-650">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Program</span>
                <strong className="text-slate-800 text-sm">{app.program}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Graduation CGPA</span>
                <strong className="text-slate-800 text-sm">{app.cgpa} / 4.00</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Intermediate marks</span>
                <strong className="text-slate-800 text-sm">{app.interMarks}%</strong>
              </div>
            </div>
          </div>

          {/* Documents attachments previews */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Uploaded Verification Attachments</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'CNIC Front', path: app.documents?.cnicFront },
                { label: 'CNIC Back', path: app.documents?.cnicBack },
                { label: 'Matric Marksheet', path: app.documents?.matricMarksheet },
                { label: 'Intermediate Marksheet', path: app.documents?.interMarksheet },
                { label: 'Official Transcript', path: app.documents?.transcript }
              ].map((doc, idx) => (
                <div key={idx} className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex flex-col justify-between min-h-[110px]">
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">{doc.label}</span>
                  {doc.path ? (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 font-bold">Uploaded</span>
                      <a
                        href={getDocUrl(doc.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-iqra-600 hover:text-iqra-750 transition-colors"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-bold block mt-3">Missing Attachment</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (AI Panel, Payment, Decisions) */}
        <div className="space-y-8">
          
          {/* AI Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-premium text-slate-350 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-iqra-500" />
                AI Rule Check Outcome
              </h3>
              {app.aiVerification?.finalDecision === 'Passed' ? (
                <span className="text-[9px] font-extrabold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded uppercase">PASS</span>
              ) : (
                <span className="text-[9px] font-extrabold tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded uppercase">FAIL</span>
              )}
            </div>

            {/* Verification checklist items */}
            {app.aiVerification && (
              <ul className="space-y-3.5 text-xs font-semibold">
                <li className="flex items-center justify-between">
                  <span className="text-slate-450">CNIC Expiry (Future date)</span>
                  {app.aiVerification.cnicExpiryValid ? (
                    <span className="text-emerald-450">Passed</span>
                  ) : (
                    <span className="text-rose-450">Failed</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-455">CNIC OCR Text Match</span>
                  {app.aiVerification.cnicOcrMatched ? (
                    <span className="text-emerald-450">Passed</span>
                  ) : (
                    <span className="text-rose-455">Failed</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-455">CGPA Threshold (&gt;= 2.5)</span>
                  {app.aiVerification.cgpaValid ? (
                    <span className="text-emerald-450">Passed</span>
                  ) : (
                    <span className="text-rose-455">Failed</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-455">Inter Marks Threshold (&gt;= 50%)</span>
                  {app.aiVerification.interMarksValid ? (
                    <span className="text-emerald-450">Passed</span>
                  ) : (
                    <span className="text-rose-455">Failed</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-455">Mandatory Attachments</span>
                  {app.aiVerification.documentsComplete ? (
                    <span className="text-emerald-450">Passed</span>
                  ) : (
                    <span className="text-rose-455">Failed</span>
                  )}
                </li>
              </ul>
            )}

            {app.aiVerification?.reason && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] leading-relaxed font-medium">
                <p className="font-bold text-slate-500 mb-1 uppercase tracking-wider">AI Reasoning log</p>
                <p className="text-slate-350">{app.aiVerification.reason}</p>
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-premium space-y-4 text-xs font-semibold text-slate-600">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" /> Financial Settlement
            </h3>
            <p className="flex justify-between">
              <span className="text-slate-400">Payment Status:</span>
              {app.payment?.status === 'Paid' ? (
                <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">Paid</strong>
              ) : (
                <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded">Pending</strong>
              )}
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Method used:</span>
              <strong className="text-slate-800">{app.payment?.method}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Reference:</span>
              <code className="text-slate-750 font-bold">{app.payment?.transactionRef}</code>
            </p>
            <p className="flex justify-between pt-2 border-t border-slate-100 text-slate-805">
              <span>Amount Cleared:</span>
              <strong className="text-sm font-extrabold text-slate-900">PKR {app.payment?.feeAmount}</strong>
            </p>
          </div>

          {/* Decision Overrides (Buttons) */}
          {app.status === 'Pending Review' || app.status === 'Submitted' ? (
            <div className="space-y-4">
              {!rejectMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex justify-center items-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-900/10 disabled:opacity-50 animate-bounce"
                  >
                    Approve & Attest
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    disabled={actionLoading}
                    className="flex justify-center items-center gap-1.5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-900/10 disabled:opacity-50"
                  >
                    Reject Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReject} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-premium space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rejection Justification</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Specify reasons for rejecting the credentials attestation..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectMode(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center text-xs font-bold text-slate-500">
              Audit Resolved: <span className="text-slate-800">{app.status}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
