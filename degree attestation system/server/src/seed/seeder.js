const User = require('../models/User');
const Application = require('../models/Application');
const { getIsConnected } = require('../config/db');
const { seedMockData } = require('../utils/storage');

// Seed Users List
const seedUsers = [
  {
    firstName: 'Iqra',
    lastName: 'Admin',
    email: 'admin@iqra.edu.pk',
    password: 'admin123',
    role: 'admin',
  },
  {
    firstName: 'Ahmad',
    lastName: 'Ali',
    email: 'student@iqra.edu.pk',
    password: 'student123',
    dob: new Date('2001-08-15'),
    cnic: '42101-1234567-1',
    address: 'Gulshan-e-Iqbal, Karachi, Pakistan',
    role: 'student',
  },
  {
    firstName: 'Sara',
    lastName: 'Khan',
    email: 'sara@iqra.edu.pk',
    password: 'student123',
    dob: new Date('2002-03-22'),
    cnic: '42201-9876543-2',
    address: 'DHA Phase 6, Karachi, Pakistan',
    role: 'student',
  },
    {
    firstName: 'Eman',
    lastName: 'Amjad',
    email: 'Eman@iqra.edu.pk',
    password: 'student123',
    dob: new Date('2003-12-19'),
    cnic: '42201-5513646-1',
    address: 'DHA Phase 6, Karachi, Pakistan',
    role: 'student',
  }
];

// Seed Applications List
const seedApplications = [
  {
    _id: 'seed_app_001',
    id: 'seed_app_001',
    studentEmail: 'student@iqra.edu.pk',
    personalInfo: {
      firstName: 'Ahmad',
      lastName: 'Ali',
      dob: new Date('2001-08-15'),
      cnic: '42101-1234567-1',
      address: 'Gulshan-e-Iqbal, Karachi, Pakistan',
      cnicExpiryDate: new Date('2031-12-31')
    },
    cgpa: 3.2,
    interMarks: 76,
    program: 'BS Computer Science',
    documents: {
      cnicFront: '/uploads/cnic_front_placeholder.png',
      cnicBack: '/uploads/cnic_back_placeholder.png',
      matricMarksheet: '/uploads/matric_placeholder.png',
      interMarksheet: '/uploads/inter_placeholder.png',
      transcript: '/uploads/transcript_placeholder.png'
    },
    payment: {
      method: 'Visa/Mastercard',
      status: 'Paid',
      feeAmount: 5000,
      transactionRef: 'TXN_SEEDED_001'
    },
    status: 'Pending Review',
    aiVerification: {
      cnicExpiryValid: true,
      cnicOcrMatched: true,
      cgpaValid: true,
      interMarksValid: true,
      documentsComplete: true,
      finalDecision: 'Passed',
      reason: 'All automated verification checks passed successfully.'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'seed_app_002',
    id: 'seed_app_002',
    studentEmail: 'sara@iqra.edu.pk',
    personalInfo: {
      firstName: 'Sara',
      lastName: 'Khan',
      dob: new Date('2002-03-22'),
      cnic: '42201-9876543-2',
      address: 'DHA Phase 6, Karachi, Pakistan',
      cnicExpiryDate: new Date('2032-05-15')
    },
    cgpa: 3.7,
    interMarks: 85,
    program: 'BS Software Engineering',
    documents: {
      cnicFront: '/uploads/cnic_front_placeholder.png',
      cnicBack: '/uploads/cnic_back_placeholder.png',
      matricMarksheet: '/uploads/matric_placeholder.png',
      interMarksheet: '/uploads/inter_placeholder.png',
      transcript: '/uploads/transcript_placeholder.png'
    },
    payment: {
      method: 'JazzCash',
      status: 'Paid',
      feeAmount: 5000,
      transactionRef: 'TXN_SEEDED_002'
    },
    status: 'Approved',
    aiVerification: {
      cnicExpiryValid: true,
      cnicOcrMatched: true,
      cgpaValid: true,
      interMarksValid: true,
      documentsComplete: true,
      finalDecision: 'Passed',
      reason: 'All automated verification checks passed successfully.'
    },
    hash: 'a29b3f46c64188bfe46b3e1022bc69b8214db0b80ea290234a946b8cbdf2499d',
    qrCodeData: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Simple blank gif fallback
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'seed_app_003',
    id: 'seed_app_003',
    studentEmail: 'student@iqra.edu.pk',
    personalInfo: {
      firstName: 'Ahmad',
      lastName: 'Ali',
      dob: new Date('2001-08-15'),
      cnic: '42101-1234567-1',
      address: 'Gulshan-e-Iqbal, Karachi, Pakistan',
      cnicExpiryDate: new Date('2020-01-01') // Expired CNIC
    },
    cgpa: 2.1,
    interMarks: 45,
    program: 'BS Artificial Intelligence',
    documents: {
      cnicFront: '/uploads/cnic_front_placeholder.png',
      cnicBack: '/uploads/cnic_back_placeholder.png',
      matricMarksheet: '',
      interMarksheet: '',
      transcript: ''
    },
    payment: {
      method: 'EasyPaisa',
      status: 'Paid',
      feeAmount: 5000,
      transactionRef: 'TXN_SEEDED_003'
    },
    status: 'Rejected',
    aiVerification: {
      cnicExpiryValid: false,
      cnicOcrMatched: true,
      cgpaValid: false,
      interMarksValid: false,
      documentsComplete: false,
      finalDecision: 'Failed',
      reason: 'CNIC is expired; CGPA is 2.1, below the 2.5 threshold; Intermediate marks are 45%, below the 50% threshold; Missing documents: Matric Marksheet, Intermediate Marksheet, Transcript'
    },
    rejectionReason: 'Failed basic criteria check: Expired identity document, low GPA, and missing academic logs.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  }
];

/**
 * Seeds MongoDB or fallback in-memory store.
 */
const seedDB = async () => {
  // Always seed the in-memory array as a global runtime fallback
  seedMockData(seedUsers, seedApplications);

  if (getIsConnected()) {
    try {
      console.log('Seeding MongoDB database...');
      await User.deleteMany({});
      await User.insertMany(seedUsers);
      console.log('Users collections seeded successfully.');

      await Application.deleteMany({});
      await Application.insertMany(seedApplications);
      console.log('Applications collections seeded successfully.');

      // Generate real base64 QR code data URL for the approved seed application
      const approvedApp = await Application.findOne({ status: 'Approved' });
      if (approvedApp) {
        const QRCode = require('qrcode');
        const qrData = JSON.stringify({
          applicationId: approvedApp._id.toString(),
          studentName: `${approvedApp.personalInfo.firstName} ${approvedApp.personalInfo.lastName}`,
          program: approvedApp.program,
          hash: approvedApp.hash,
          status: 'Attested'
        });
        const qrDataUrl = await QRCode.toDataURL(qrData);
        approvedApp.qrCodeData = qrDataUrl;
        await approvedApp.save();
        console.log('Seeded Approved QR code generated.');
      }
    } catch (err) {
      console.error('Error executing database seed operations:', err.message);
    }
  }
};

// Auto seed if executing script directly
if (require.main === module) {
  const dotenv = require('dotenv');
  const { connectDB } = require('../config/db');
  dotenv.config();
  
  (async () => {
    await connectDB();
    await seedDB();
    process.exit(0);
  })();
}

module.exports = { seedDB, seedUsers, seedApplications };
