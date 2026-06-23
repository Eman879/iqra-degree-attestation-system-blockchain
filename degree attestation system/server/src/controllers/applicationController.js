const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { storage } = require('../utils/storage');
const { performOcr } = require('../utils/ocrService');
const { runVerification } = require('../utils/verificationEngine');

/**
 * Endpoint to test OCR on CNIC image.
 * POST /api/ocr/cnic
 */
const runOcrOnCnic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CNIC image file uploaded' });
    }

    const expectedCnic = req.body.expectedCnic || '';
    const ocrResult = await performOcr(req.file.path, expectedCnic);

    return res.status(200).json({
      message: 'OCR processed successfully',
      extractedText: ocrResult.text,
      extractedCnic: ocrResult.cnic,
      matched: expectedCnic ? (ocrResult.cnic.replace(/[-\s]/g, '') === expectedCnic.replace(/[-\s]/g, '')) : false
    });
  } catch (error) {
    console.error('OCR Controller Error:', error);
    return res.status(500).json({ message: 'Error processing OCR', error: error.message });
  }
};

/**
 * Creates and submits a new attestation application.
 * POST /api/applications
 */
const createApplication = async (req, res) => {
  try {
    const {
      studentEmail,
      firstName,
      lastName,
      dob,
      cnic,
      address,
      cnicExpiryDate,
      cgpa,
      interMarks,
      program,
      paymentMethod,
      transactionRef
    } = req.body;

    if (!studentEmail || !firstName || !lastName || !dob || !cnic || !program) {
      return res.status(400).json({ message: 'All personal information and program details are required' });
    }

    // Map uploaded files (Multer fields)
    const files = req.files || {};
    const docPaths = {
      cnicFront: files.cnicFront ? `/uploads/${files.cnicFront[0].filename}` : '',
      cnicBack: files.cnicBack ? `/uploads/${files.cnicBack[0].filename}` : '',
      matricMarksheet: files.matricMarksheet ? `/uploads/${files.matricMarksheet[0].filename}` : '',
      interMarksheet: files.interMarksheet ? `/uploads/${files.interMarksheet[0].filename}` : '',
      transcript: files.transcript ? `/uploads/${files.transcript[0].filename}` : ''
    };

    // If documents are not uploaded (e.g. mock test using JSON strings), fallback to body strings
    if (!docPaths.cnicFront && req.body.cnicFront) docPaths.cnicFront = req.body.cnicFront;
    if (!docPaths.cnicBack && req.body.cnicBack) docPaths.cnicBack = req.body.cnicBack;
    if (!docPaths.matricMarksheet && req.body.matricMarksheet) docPaths.matricMarksheet = req.body.matricMarksheet;
    if (!docPaths.interMarksheet && req.body.interMarksheet) docPaths.interMarksheet = req.body.interMarksheet;
    if (!docPaths.transcript && req.body.transcript) docPaths.transcript = req.body.transcript;

    // Build application object
    const newApplicationData = {
      studentEmail,
      personalInfo: {
        firstName,
        lastName,
        dob: new Date(dob),
        cnic,
        address,
        cnicExpiryDate: cnicExpiryDate ? new Date(cnicExpiryDate) : null
      },
      cgpa: parseFloat(cgpa || 0),
      interMarks: parseFloat(interMarks || 0),
      program,
      documents: docPaths,
      payment: {
        method: paymentMethod || 'Visa/Mastercard',
        status: transactionRef ? 'Paid' : 'Pending',
        feeAmount: 5000,
        transactionRef: transactionRef || `MOCK_TXN_${Date.now()}`
      },
      status: 'Submitted',
      aiVerification: {
        cnicExpiryValid: false,
        cnicOcrMatched: false,
        cgpaValid: false,
        interMarksValid: false,
        documentsComplete: false,
        finalDecision: 'Pending',
        reason: 'Verification in progress'
      }
    };

    // Create record in database/store
    const application = await storage.createApplication(newApplicationData);
    const appId = application._id || application.id;

    // Trigger AI / rule verification asynchronously or synchronously.
    // For reliable demo execution, we run it immediately and update the record.
    console.log(`Running automated verification for application ID: ${appId}`);
    
    // Perform OCR on cnicFront if it exists
    let ocrCnic = '';
    if (files.cnicFront && files.cnicFront[0]) {
      const ocrRes = await performOcr(files.cnicFront[0].path, cnic);
      ocrCnic = ocrRes.cnic;
    } else {
      // If mock paths were provided, simulate OCR
      ocrCnic = cnic;
    }

    const aiResult = runVerification(application, ocrCnic);
    
    // Update application with verification status
    const finalApp = await storage.updateApplicationStatus(appId, 'Pending Review', {
      aiVerification: aiResult
    });

    return res.status(201).json({
      message: 'Application submitted and verified successfully',
      application: finalApp
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
};

/**
 * Gets a single application by ID.
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const app = await storage.findApplicationById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    return res.status(200).json(app);
  } catch (error) {
    console.error('Error fetching application:', error);
    return res.status(500).json({ message: 'Error fetching application' });
  }
};

/**
 * Gets all applications submitted by a student.
 * GET /api/applications/student/:studentEmail
 */
const getStudentApplications = async (req, res) => {
  try {
    const apps = await storage.findApplicationsByStudent(req.params.studentEmail);
    return res.status(200).json(apps);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    return res.status(500).json({ message: 'Error fetching student applications' });
  }
};

/**
 * Gets all applications for admin view.
 * GET /api/admin/requests
 */
const adminGetApplications = async (req, res) => {
  try {
    const apps = await storage.findAllApplications();
    const stats = await storage.getStats();
    return res.status(200).json({
      applications: apps,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return res.status(500).json({ message: 'Error fetching admin requests' });
  }
};

/**
 * Approves an application, generating Secure Hash and QR Code.
 * POST /api/admin/requests/:id/approve
 */
const adminApproveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await storage.findApplicationById(id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const timestamp = Date.now();
    const cnic = app.personalInfo.cnic;
    
    // Generate SHA-256 secure hash
    const hashInput = `${id}-${cnic}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Generate QR Code base64 Data URL
    const qrData = JSON.stringify({
      applicationId: id,
      studentName: `${app.personalInfo.firstName} ${app.personalInfo.lastName}`,
      program: app.program,
      hash: hash,
      status: 'Attested'
    });
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    const updatedApp = await storage.updateApplicationStatus(id, 'Approved', {
      hash: hash,
      qrCodeData: qrCodeDataUrl,
      rejectionReason: ''
    });

    return res.status(200).json({
      message: 'Application approved and attested successfully',
      application: updatedApp
    });
  } catch (error) {
    console.error('Approval Error:', error);
    return res.status(500).json({ message: 'Error approving application', error: error.message });
  }
};

/**
 * Rejects an application with reason.
 * POST /api/admin/requests/:id/reject
 */
const adminRejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const app = await storage.findApplicationById(id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedApp = await storage.updateApplicationStatus(id, 'Rejected', {
      rejectionReason: reason
    });

    return res.status(200).json({
      message: 'Application rejected successfully',
      application: updatedApp
    });
  } catch (error) {
    console.error('Rejection Error:', error);
    return res.status(500).json({ message: 'Error rejecting application' });
  }
};

module.exports = {
  runOcrOnCnic,
  createApplication,
  getApplicationById,
  getStudentApplications,
  adminGetApplications,
  adminApproveApplication,
  adminRejectApplication
};
