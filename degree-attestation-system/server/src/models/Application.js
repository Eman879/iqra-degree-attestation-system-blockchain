const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dob: { type: Date, required: true },
      cnic: { type: String, required: true },
      address: { type: String, required: true },
      cnicExpiryDate: { type: Date },
    },
    cgpa: {
      type: Number,
      required: true,
    },
    interMarks: {
      type: Number,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    documents: {
      cnicFront: { type: String },
      cnicBack: { type: String },
      matricMarksheet: { type: String },
      interMarksheet: { type: String },
      transcript: { type: String },
    },
    payment: {
      method: { type: String, default: 'Unpaid' },
      status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
      feeAmount: { type: Number, default: 5000 },
      transactionRef: { type: String },
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Pending Review', 'Under AI Verification', 'Approved', 'Rejected'],
      default: 'Pending Review',
    },
    aiVerification: {
      cnicExpiryValid: { type: Boolean, default: false },
      cnicOcrMatched: { type: Boolean, default: false },
      cgpaValid: { type: Boolean, default: false },
      interMarksValid: { type: Boolean, default: false },
      documentsComplete: { type: Boolean, default: false },
      finalDecision: { type: String, default: 'Pending' }, // 'Passed', 'Failed'
      reason: { type: String, default: '' },
    },
    hash: {
      type: String,
    },
    qrCodeData: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    // Aapke existing Schema ke andar yeh do fields add karein:
blockchainHash: {
  type: String,
  default: ""
},
qrCodeData: {
  type: String, // Isme QR code ki Base64 Image string save hogi
  default: ""
},
isAttested: {
  type: Boolean,
  default: false
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
