const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const crypto = require('crypto'); // Top par import karein
const QRCode = require('qrcode'); // Top par import karein
const { studentLogin, adminLogin } = require('../controllers/authController');
const {
  runOcrOnCnic,
  createApplication,
  getApplicationById,
  getStudentApplications,
  adminGetApplications,
  adminApproveApplication,
  adminRejectApplication
} = require('../controllers/applicationController');

// Multer Storage Configuration
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to server/uploads/ directory
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// MULTI-FILE UPLOAD FIELDS DEFINITION
const applicationUploadFields = upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'matricMarksheet', maxCount: 1 },
  { name: 'interMarksheet', maxCount: 1 },
  { name: 'transcript', maxCount: 1 }
]);





// Degree Attestation API Route
router.post('/attest-degree', async (req, res) => {
  try {
    const { studentId, degreeSerial } = req.body;

    // 1. Database se student ka record dhoondein
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. CRYPTOGRAPHIC HASHING (Blockchain Stamp)
    // Student ki details ko mila kar ek unique SHA-256 string (Hash) generate karein
    const secureData = `${studentId}-${degreeSerial}-${student.fullName}`;
    const generatedHash = crypto.createHash('sha256').update(secureData).digest('hex');

    // 3. DYNAMIC QR CODE GENERATION
    // Ek aisa link banayein jis par click ya scan karne se verification ho
    const verificationLink = `http://localhost:5000/api/verify?hash=${generatedHash}`;
    
    // QR Code ko text se image (Base64) mein convert karein
    const qrCodeImage = await QRCode.toDataURL(verificationLink);

    // 4. Database mein save karein
    student.blockchainHash = generatedHash;
    student.qrCodeData = qrCodeImage;
    student.isAttested = true;
    await student.save();

    // 5. Frontend ko response bhejein
    res.status(200).json({
      success: true,
      message: "Degree Attested with Blockchain Hash and QR Code!",
      hash: generatedHash,
      qrImage: qrCodeImage
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. THIRD-PARTY VERIFICATION ROUTE (QR Code scan hone par yeh chalega)
router.get('/verify', async (req, res) => {
  const { hash } = req.query;
  const verifiedStudent = await Student.findOne({ blockchainHash: hash });

  if (verifiedStudent) {
    res.send(`
      <div style="text-align:center; margin-top:50px; font-family:Arial;">
        <h1 style="color:green;">✔ GENUINE DOCUMENT VERIFIED</h1>
        <p><strong>Student Name:</strong> ${verifiedStudent.fullName}</p>
        <p><strong>Status:</strong> Officially Attested</p>
        <p style="font-size:11px; color:gray;">Blockchain Seal: ${hash}</p>
      </div>
    `);
  } else {
    res.send(`<h1 style="color:red; text-align:center; margin-top:50px;">❌ FAKE OR TAMPERED DOCUMENT DETECTED</h1>`);
  }
});

module.exports = router;
// 1. Auth Routes
router.post('/auth/login', studentLogin);
router.post('/auth/admin-login', adminLogin);

// 2. OCR Endpoint
router.post('/ocr/cnic', upload.single('cnicOcrImage'), runOcrOnCnic);

// 3. Application Routes
router.post('/applications', applicationUploadFields, createApplication);
router.get('/applications/:id', getApplicationById);
router.get('/applications/student/:studentEmail', getStudentApplications);

// 4. Admin Queue Routes
router.get('/admin/requests', adminGetApplications);
router.post('/admin/requests/:id/approve', adminApproveApplication);
router.post('/admin/requests/:id/reject', adminRejectApplication);

module.exports = router;
