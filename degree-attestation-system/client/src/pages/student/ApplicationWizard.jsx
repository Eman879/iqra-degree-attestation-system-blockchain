import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  CreditCard, 
  CheckSquare, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  ShieldCheck, 
  ShieldX, 
  Loader2, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { ocrService, applicationService } from '../../services/api';

const STEPS = [
  { id: 1, name: 'Personal & Identity', icon: User },
  { id: 2, name: 'Academic & Documents', icon: FileText },
  { id: 3, name: 'Attestation Fee Payment', icon: CreditCard },
  { id: 4, name: 'Review & Submit', icon: CheckSquare }
];

const ApplicationWizard = ({ user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    cnic: user?.cnic || '',
    cnicExpiryDate: '',
    address: user?.address || ''
  });

  // OCR Verification State
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('Idle'); // 'Idle' | 'Processing' | 'Verified' | 'Mismatch' | 'Error'
  const [ocrExtractedCnic, setOcrExtractedCnic] = useState('');
  const [ocrText, setOcrText] = useState('');

  // 2. Academic Info & Files State
  const [program, setProgram] = useState('BS Computer Science');
  const [cgpa, setCgpa] = useState('');
  const [interMarks, setInterMarks] = useState('');
  
  const [files, setFiles] = useState({
    cnicFront: null,
    cnicBack: null,
    matricMarksheet: null,
    interMarksheet: null,
    transcript: null
  });

  // 3. Payment State
  const [paymentMethod, setPaymentMethod] = useState('Visa/Mastercard');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  const programsList = [
    'BS Computer Science',
    'BS Artificial Intelligence',
    'BS Software Engineering',
    'BE Electrical Engineering',
    'BS Business Administration',
    'BS Media Studies'
  ];

  // Helper to update personal info
  const handleInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleAutofill = () => {
    setPersonalInfo({
      firstName: 'Ahmad',
      lastName: 'Ali',
      dob: '2001-08-15',
      cnic: '42101-1234567-1',
      cnicExpiryDate: '2032-12-31',
      address: 'Gulshan-e-Iqbal, Karachi, Pakistan'
    });

    const dummyFile1 = new File(['cnic front'], 'cnic_front.jpg', { type: 'image/jpeg' });
    const dummyFile2 = new File(['cnic back'], 'cnic_back.jpg', { type: 'image/jpeg' });
    const dummyFile3 = new File(['matric'], 'matric.jpg', { type: 'image/jpeg' });
    const dummyFile4 = new File(['inter'], 'inter.jpg', { type: 'image/jpeg' });
    const dummyFile5 = new File(['transcript'], 'transcript.jpg', { type: 'image/jpeg' });

    setOcrFile(dummyFile1);
    setOcrStatus('Verified');
    setOcrExtractedCnic('42101-1234567-1');

    setFiles({
      cnicFront: dummyFile1,
      cnicBack: dummyFile2,
      matricMarksheet: dummyFile3,
      interMarksheet: dummyFile4,
      transcript: dummyFile5
    });

    setCgpa('3.2');
    setInterMarks('76');
    setProgram('BS Computer Science');
    setIsPaid(true);
    setTxnRef('IU_TXN_MOCK_AUTOFILL_99');
  };

  // Helper to handle OCR upload & trigger Tesseract OCR API
  const handleOcrFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!personalInfo.cnic) {
      setError('Please type your CNIC number first so we can run OCR verification.');
      e.target.value = null; // reset
      return;
    }

    setOcrFile(file);
    // Also automatically set cnicFront file in Step 2 to save student re-uploading
    setFiles(prev => ({ ...prev, cnicFront: file }));
    
    setOcrStatus('Processing');
    setError('');

    try {
      const result = await ocrService.verifyCnic(file, personalInfo.cnic);
      setOcrExtractedCnic(result.extractedCnic);
      setOcrText(result.extractedText);
      
      if (result.matched) {
        setOcrStatus('Verified');
      } else {
        setOcrStatus('Mismatch');
      }
    } catch (err) {
      console.error(err);
      setOcrStatus('Error');
      setError('OCR Analysis failed. You may proceed and upload documents manually.');
    }
  };

  // Helper to handle manual document uploads
  const handleFileChange = (e, field) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFiles({ ...files, [field]: selectedFile });
    }
  };

  // Simulate payment processing
  const handleSimulatePayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setIsPaid(true);
      setTxnRef(`IU_TXN_${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1500);
  };

  // Main navigation helpers
  const nextStep = () => {
    setError('');
    
    // Step validation rules
    if (currentStep === 1) {
      const { firstName, lastName, dob, cnic, cnicExpiryDate, address } = personalInfo;
      if (!firstName || !lastName || !dob || !cnic || !cnicExpiryDate || !address) {
        setError('Please fill out all personal details and identity parameters.');
        return;
      }
      if (ocrStatus === 'Processing') {
        setError('Please wait for OCR CNIC scanning to complete.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!cgpa || !interMarks) {
        setError('Please specify your final graduation CGPA and Intermediate score.');
        return;
      }
      if (!files.cnicFront || !files.cnicBack || !files.matricMarksheet || !files.interMarksheet || !files.transcript) {
        setError('All 5 academic verification attachments are mandatory.');
        return;
      }
    }

    if (currentStep === 3 && !isPaid) {
      setError('Please process the simulated attestation fee payment.');
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  // Submission handler (submits multi-part form-data)
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('studentEmail', user.email);
    formData.append('firstName', personalInfo.firstName);
    formData.append('lastName', personalInfo.lastName);
    formData.append('dob', personalInfo.dob);
    formData.append('cnic', personalInfo.cnic);
    formData.append('cnicExpiryDate', personalInfo.cnicExpiryDate);
    formData.append('address', personalInfo.address);
    formData.append('cgpa', cgpa);
    formData.append('interMarks', interMarks);
    formData.append('program', program);
    formData.append('paymentMethod', paymentMethod);
    formData.append('transactionRef', txnRef);

    // Append attachments
    formData.append('cnicFront', files.cnicFront);
    formData.append('cnicBack', files.cnicBack);
    formData.append('matricMarksheet', files.matricMarksheet);
    formData.append('interMarksheet', files.interMarksheet);
    formData.append('transcript', files.transcript);

    try {
      const response = await applicationService.submit(formData);
      const appId = response.application?._id || response.application?.id;
      navigate(`/status/${appId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while submitting your attestation request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-premium gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">New Attestation Request</h2>
          <p className="text-xs text-slate-500">Provide official identity, attach academic transcripts, and clear processing fee.</p>
        </div>
        <button
          type="button"
          onClick={handleAutofill}
          id="autofill-btn"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors shrink-0"
        >
          ⚡ Demo Autofill Request
        </button>
      </div>

      {/* Stepper progress indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium">
        <div className="flex justify-between items-center relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <div className="flex flex-col items-center z-10 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : isActive 
                        ? 'bg-iqra-600 border-iqra-600 text-white shadow-lg shadow-iqra-900/20' 
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 hidden md:block ${isActive ? 'text-iqra-700' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>

                {/* Progress bar line */}
                {idx < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 bg-slate-100 mx-2">
                    <div 
                      className="h-full bg-iqra-600 transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex gap-2 items-center">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main wizard step content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-premium min-h-[400px] flex flex-col justify-between">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: PERSONAL & OCR */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Form */}
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Personal Parameters</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={personalInfo.firstName}
                          onChange={handleInfoChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-iqra-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={personalInfo.lastName}
                          onChange={handleInfoChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-iqra-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={personalInfo.dob}
                          onChange={handleInfoChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CNIC Number</label>
                        <input
                          type="text"
                          name="cnic"
                          placeholder="42101-1234567-1"
                          value={personalInfo.cnic}
                          onChange={handleInfoChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CNIC Expiry Date</label>
                      <input
                        type="date"
                        name="cnicExpiryDate"
                        value={personalInfo.cnicExpiryDate}
                        onChange={handleInfoChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Residential Address</label>
                      <textarea
                        name="address"
                        rows="3"
                        value={personalInfo.address}
                        onChange={handleInfoChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Right OCR Panel */}
                  <div className="space-y-6 bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-5 h-5 text-iqra-600" />
                        CNIC OCR Scanning
                      </h3>
                      <p className="text-xs text-slate-400">Validate your typed CNIC by running a mock OCR text scanner on your CNIC front image.</p>
                    </div>

                    {/* Upload button for OCR */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-iqra-400 bg-white transition-all">
                      <input
                        id="ocr-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleOcrFileChange}
                        className="hidden"
                      />
                      <label htmlFor="ocr-upload" className="cursor-pointer space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 bg-iqra-50 rounded-full flex items-center justify-center text-iqra-600">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">Upload CNIC Front</p>
                          <span className="text-[10px] text-slate-400">Supports PNG, JPG (Max 5MB)</span>
                        </div>
                      </label>
                    </div>

                    {/* OCR Results Panel */}
                    <div className="border border-slate-200 bg-white rounded-xl p-4 min-h-[140px] flex flex-col justify-center">
                      {ocrStatus === 'Idle' && (
                        <p className="text-center text-xs text-slate-400 font-medium">Please upload CNIC Front image to run OCR validation.</p>
                      )}
                      
                      {ocrStatus === 'Processing' && (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-iqra-600 animate-spin" />
                          <p className="text-xs text-slate-500 font-medium animate-pulse">Running AI OCR Text Extraction...</p>
                        </div>
                      )}

                      {ocrStatus === 'Verified' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>CNIC OCR Match Successful!</span>
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <p>Typed CNIC: <strong className="text-slate-750">{personalInfo.cnic}</strong></p>
                            <p>Extracted: <strong className="text-emerald-700">{ocrExtractedCnic}</strong></p>
                          </div>
                        </div>
                      )}

                      {ocrStatus === 'Mismatch' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs font-semibold">
                            <ShieldX className="w-4 h-4" />
                            <span>CNIC OCR Verification Mismatch!</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            The CNIC number scanned from the card does not match the digits typed in the form. Please review input.
                          </p>
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <p>Typed CNIC: <strong className="text-slate-750">{personalInfo.cnic}</strong></p>
                            <p>Extracted: <strong className="text-rose-700">{ocrExtractedCnic || 'Unknown text'}</strong></p>
                          </div>
                        </div>
                      )}

                      {ocrStatus === 'Error' && (
                        <p className="text-center text-xs text-rose-600 font-medium">Error analyzing CNIC. Upload valid image file or proceed manually.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMICS & DOCUMENTS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Academic Logs & Uploads</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Program Selection</label>
                      <select
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                      >
                        {programsList.map(prog => (
                          <option key={prog} value={prog}>{prog}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Graduation CGPA (out of 4.00)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        placeholder="3.24"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Intermediate Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="74"
                        value={interMarks}
                        onChange={(e) => setInterMarks(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Required Document Attachments</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { field: 'cnicFront', label: 'CNIC Front Image' },
                        { field: 'cnicBack', label: 'CNIC Back Image' },
                        { field: 'matricMarksheet', label: 'Matric Marksheet' },
                        { field: 'interMarksheet', label: 'Intermediate Marksheet' },
                        { field: 'transcript', label: 'Official Transcript' }
                      ].map((item) => {
                        const fileSelected = files[item.field];
                        return (
                          <div 
                            key={item.field}
                            className={`border rounded-xl p-4 bg-slate-50 flex flex-col justify-between min-h-[110px] border-slate-200 hover:border-slate-350 transition-colors`}
                          >
                            <span className="text-xs font-bold text-slate-700 leading-tight">{item.label}</span>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              {fileSelected ? (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <FileCheck className="w-3.5 h-3.5" /> Selected
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">No file selected</span>
                              )}
                              <input
                                id={`file-${item.field}`}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, item.field)}
                                className="hidden"
                              />
                              <label
                                htmlFor={`file-${item.field}`}
                                className="cursor-pointer px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors shrink-0"
                              >
                                {fileSelected ? 'Replace' : 'Upload'}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: MOCK PAYMENT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Processing Fee Settlement</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment details */}
                    <div className="lg:col-span-2 space-y-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment Option</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'Visa/Mastercard', name: 'Credit/Debit Card', logo: '💳' },
                          { id: 'JazzCash/EasyPaisa', name: 'Mobile Wallet', logo: '📱' },
                          { id: 'Crypto/MetaMask', name: 'Web3 Wallet', logo: '🪙' }
                        ].map(method => (
                          <div
                            key={method.id}
                            onClick={() => {
                              if (!isPaid) setPaymentMethod(method.id);
                            }}
                            className={`border-2 rounded-xl p-4 cursor-pointer text-center space-y-2 transition-all ${
                              paymentMethod === method.id 
                                ? 'border-iqra-600 bg-iqra-50/50 shadow-md' 
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            } ${isPaid ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <span className="text-2xl block">{method.logo}</span>
                            <span className="text-xs font-bold text-slate-700 block">{method.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Card layout mock */}
                      <div className="border border-slate-200 bg-slate-50/50 p-6 rounded-2xl mt-4">
                        {paymentMethod === 'Visa/Mastercard' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                              <input type="text" placeholder="Ahmad Ali" disabled={isPaid} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                              <input type="text" placeholder="4231 9988 7766 5544" disabled={isPaid} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry</label>
                                <input type="text" placeholder="12/28" disabled={isPaid} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CVV</label>
                                <input type="password" placeholder="***" disabled={isPaid} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none" />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'JazzCash/EasyPaisa' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Account Phone Number</label>
                            <input type="text" placeholder="0300 1234567" disabled={isPaid} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none" />
                            <span className="text-[10px] text-slate-400 block mt-2">You will receive a USSD push request on your mobile device to complete payment.</span>
                          </div>
                        )}

                        {paymentMethod === 'Crypto/MetaMask' && (
                          <div className="text-center py-4 space-y-2">
                            <span className="text-xs font-bold text-slate-600 block">Connected Web3 Wallet:</span>
                            <code className="text-xs text-iqra-700 bg-iqra-50 border border-iqra-200 px-3 py-1.5 rounded-lg inline-block">0x71C...39B2</code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Receipt breakdown */}
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 h-fit">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Receipt</h4>
                      <div className="space-y-2 border-b border-slate-200 pb-4 text-xs font-medium text-slate-600">
                        <div className="flex justify-between">
                          <span>Attestation Application fee</span>
                          <span>PKR 5,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OCR scanning service</span>
                          <span className="text-emerald-600">FREE</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 text-sm">
                        <span>Total Payable</span>
                        <span>PKR 5,000</span>
                      </div>

                      {/* Payment Trigger Button */}
                      {!isPaid ? (
                        <button
                          type="button"
                          onClick={handleSimulatePayment}
                          disabled={paymentLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-iqra-600 hover:bg-iqra-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-iqra-900/10"
                        >
                          {paymentLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Processing Transaction...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" /> Simulate Payment
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 justify-center">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                            <span>Payment Settled!</span>
                          </div>
                          <div className="text-[10px] text-slate-400 text-center font-medium">
                            Ref: <code>{txnRef}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Final Request Summary</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-medium text-slate-600">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Credentials</span>
                        <p className="text-sm font-bold text-slate-800">{personalInfo.firstName} {personalInfo.lastName}</p>
                        <p>DOB: <strong className="text-slate-700">{personalInfo.dob}</strong></p>
                        <p>CNIC: <strong className="text-slate-700">{personalInfo.cnic}</strong> (Expires: {personalInfo.cnicExpiryDate})</p>
                        <p>Address: <strong className="text-slate-700">{personalInfo.address}</strong></p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Logs</span>
                        <p className="text-sm font-bold text-slate-800">{program}</p>
                        <p>Graduation CGPA: <strong className="text-slate-700">{cgpa}</strong> / 4.00</p>
                        <p>Intermediate Score: <strong className="text-slate-700">{interMarks}%</strong></p>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification Files</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-500">
                          <li className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> CNIC Front image: <code className="text-slate-800 font-semibold">{files.cnicFront?.name || 'Selected'}</code>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> CNIC Back image: <code className="text-slate-800 font-semibold">{files.cnicBack?.name || 'Selected'}</code>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> Matric Marksheet: <code className="text-slate-800 font-semibold">{files.matricMarksheet?.name || 'Selected'}</code>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> Intermediate Marksheet: <code className="text-slate-800 font-semibold">{files.interMarksheet?.name || 'Selected'}</code>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> Academic Transcript: <code className="text-slate-800 font-semibold">{files.transcript?.name || 'Selected'}</code>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Audit</span>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">Settled Successfully</p>
                          <span className="font-bold text-slate-700">Ref: {txnRef}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-iqra-600 hover:bg-iqra-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-iqra-900/10"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-450 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <FileCheck className="w-4.5 h-4.5" /> Submit Request
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationWizard;
