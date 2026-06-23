import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText,
  Bookmark,
  Calendar,
  CreditCard,
  Hash
} from 'lucide-react';
import { applicationService } from '../../services/api';

const StatusDetail = ({ user }) => {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchApp = async () => {
      try {
        const data = await applicationService.getById(applicationId);
        setApp(data);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [applicationId, user, navigate]);

  const copyHashToClipboard = () => {
    if (app && app.hash) {
      navigator.clipboard.writeText(app.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-iqra-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Loading application file...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="text-rose-500 text-4xl">⚠️</div>
        <h3 className="font-bold text-slate-800 text-lg">Error Loading File</h3>
        <p className="text-slate-500 text-sm">{error || 'Record was not found.'}</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = app.status === 'Approved';
  const isRejected = app.status === 'Rejected';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="no-print">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-550 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>

      {/* 1. Track Status Timeline (No-Print) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-6 no-print">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Tracking</span>
            <h3 className="text-sm font-bold text-slate-800">
              ID: <code className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{app._id || app.id}</code>
            </h3>
          </div>
          <div>
            {isApproved && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> Approved
              </span>
            )}
            {isRejected && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
                <XCircle className="w-3.5 h-3.5" /> Rejected
              </span>
            )}
            {!isApproved && !isRejected && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
                <Clock className="w-3.5 h-3.5 animate-spin" /> In Verification
              </span>
            )}
          </div>
        </div>

        {/* Timeline representation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 pt-6 text-center">
          {[
            { label: 'Submitted', desc: 'Form successfully registered', completed: true },
            { label: 'AI Check', desc: 'Rules & OCR validated', completed: app.aiVerification?.finalDecision !== 'Pending' },
            { label: 'Staff Review', desc: 'Admin audit queue', completed: isApproved || isRejected },
            { label: 'Final Attestation', desc: 'Approved & Signed', completed: isApproved, err: isRejected }
          ].map((node, idx) => (
            <div key={idx} className="space-y-2 relative flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                node.err
                  ? 'bg-rose-100 border-rose-500 text-rose-600'
                  : node.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {node.err ? '✕' : node.completed ? '✓' : idx + 1}
              </div>
              <div>
                <p className={`text-xs font-bold ${node.completed ? 'text-slate-800' : 'text-slate-400'}`}>{node.label}</p>
                <span className="text-[10px] text-slate-400 block">{node.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Rejection Panel (No-Print) */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-premium space-y-4 no-print">
          <div className="flex items-center gap-2.5 text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <h4 className="font-extrabold text-base tracking-tight">Application Attestation Rejected</h4>
          </div>
          <div className="space-y-2 text-xs text-rose-700 leading-relaxed font-medium">
            <p><strong>Admin Rejection Reason:</strong> {app.rejectionReason || 'No comment provided by administrator.'}</p>
            {app.aiVerification && app.aiVerification.reason && (
              <p className="bg-rose-100/50 p-3 rounded-lg border border-rose-200/50">
                <strong>AI Failed Rules:</strong> {app.aiVerification.reason}
              </p>
            )}
          </div>
          <div className="pt-2">
            <Link
              to="/application"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Re-submit Application
            </Link>
          </div>
        </div>
      )}

      {/* 3. Attestation Form Certificate (Print-Only or Styled View) */}
      {isApproved && (
        <div className="space-y-6 print-card">
          {/* Action header (No-print) */}
          <div className="flex justify-between items-center no-print bg-white p-4 border border-slate-200 rounded-xl shadow-premium">
            <p className="text-xs font-medium text-slate-500">Your attestation document is compiled and securely generated.</p>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-iqra-600 hover:bg-iqra-700 text-white font-bold rounded-xl text-xs shadow-md shadow-iqra-900/10 transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" /> Print Attestation Form
            </button>
          </div>

          {/* ATTETATION SHEET CONTAINER */}
          <div className="bg-white border-8 border-double border-iqra-800 rounded-2xl p-10 shadow-2xl relative space-y-8 print:border-4 print:shadow-none print:p-6 print:rounded-none">
            
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              🎓
            </div>

            {/* University Header */}
            <div className="text-center space-y-2 border-b-2 border-iqra-800 pb-6">
              <h1 className="text-2xl font-extrabold text-iqra-950 tracking-wide uppercase">Iqra University</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Office of the Registrar & Attestation Panel</p>
              <p className="text-xs font-bold text-iqra-750">Karachi, Pakistan</p>
            </div>

            {/* Document Title */}
            <div className="text-center py-4 bg-iqra-50/50 border border-iqra-100 rounded-xl print:bg-slate-100">
              <h2 className="text-lg font-bold text-iqra-900 tracking-tight uppercase">Certificate of Attestation & Verification</h2>
              <span className="text-[10px] text-slate-400 block mt-1">Application Reference: {app._id || app.id}</span>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-medium text-slate-700">
              
              {/* Left Column: Student Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-iqra-800 uppercase tracking-wider border-b border-slate-100 pb-2">Candidate Details</h3>
                <div className="space-y-2.5">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Full Name:</span>
                    <strong className="text-slate-800">{app.personalInfo.firstName} {app.personalInfo.lastName}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <strong className="text-slate-800">{new Date(app.personalInfo.dob).toLocaleDateString()}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">CNIC Number:</span>
                    <strong className="text-slate-800">{app.personalInfo.cnic}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Student Email:</span>
                    <strong className="text-slate-800 font-semibold">{app.studentEmail}</strong>
                  </p>
                </div>
              </div>

              {/* Right Column: Degree Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-iqra-800 uppercase tracking-wider border-b border-slate-100 pb-2">Academic Validation</h3>
                <div className="space-y-2.5">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Attested Program:</span>
                    <strong className="text-slate-800">{app.program}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Graduation CGPA:</span>
                    <strong className="text-slate-800">{app.cgpa} / 4.00</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Intermediate Marks:</span>
                    <strong className="text-slate-800">{app.interMarks}%</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Attestation Date:</span>
                    <strong className="text-slate-800">{new Date(app.updatedAt).toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Stamp & QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-center justify-between">
              
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center border border-slate-200 p-3 bg-white rounded-lg w-fit mx-auto md:mx-0">
                <img 
                  src={app.qrCodeData || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
                  alt="Attestation Verification QR" 
                  className="w-24 h-24"
                />
                <span className="text-[9px] text-slate-400 mt-1 font-bold">Scan to Verify</span>
              </div>

              {/* Secure signatures/stamps */}
              <div className="text-center md:text-left space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold text-iqra-600 flex items-center justify-center md:justify-start gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Attested & Verified
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  This attestation certificate confirms that the academic documents submitted have been cross-checked against database rosters and identity parameters under the Iqra University registrar rules.
                </p>
              </div>
            </div>

            {/* Secure Blockchain Hash Display */}
            <div className="bg-slate-900 text-slate-400 p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-iqra-500" /> Secure SHA-256 Verification Hash
                </span>
                <button
                  type="button"
                  onClick={copyHashToClipboard}
                  className="no-print text-slate-400 hover:text-white transition-colors"
                  title="Copy verification hash"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] font-mono break-all text-slate-350">{app.hash || 'MOCK_SHA_256_HASH_VAL_NOT_GENERATED'}</p>
              {copied && <span className="no-print text-[9px] text-emerald-400 font-bold block">Hash copied to clipboard!</span>}
            </div>

            {/* Official Stamps */}
            <div className="flex justify-between text-center pt-8 text-[10px] text-slate-400 font-bold">
              <div className="w-36 border-t border-slate-300 pt-2">
                Verification Officer
              </div>
              <div className="w-36 border-t border-slate-300 pt-2">
                Registrar Office
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Non-attested details overview (No-Print) */}
      {!isApproved && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-4 no-print text-xs font-medium text-slate-650">
          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">Submitted Parameters</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <p>Full Name: <strong className="text-slate-800">{app.personalInfo.firstName} {app.personalInfo.lastName}</strong></p>
            <p>CNIC Number: <strong className="text-slate-800">{app.personalInfo.cnic}</strong></p>
            <p>Program: <strong className="text-slate-800">{app.program}</strong></p>
            <p>Fee Settle Ref: <strong className="text-slate-800">{app.payment.transactionRef}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDetail;
