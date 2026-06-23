/**
 * Evaluates the business rules for degree attestation.
 * @param {Object} application The application details object.
 * @param {string} ocrCnic The CNIC extracted via OCR.
 * @returns {Object} Updated aiVerification schema status.
 */
const runVerification = (application, ocrCnic = '') => {
  const aiVerification = {
    cnicExpiryValid: false,
    cnicOcrMatched: false,
    cgpaValid: false,
    interMarksValid: false,
    documentsComplete: false,
    finalDecision: 'Failed',
    reason: '',
  };

  const reasons = [];

  // 1. CNIC Expiry Check
  if (application.personalInfo && application.personalInfo.cnicExpiryDate) {
    const expiry = new Date(application.personalInfo.cnicExpiryDate);
    const now = new Date();
    if (expiry > now) {
      aiVerification.cnicExpiryValid = true;
    } else {
      reasons.push('CNIC is expired');
    }
  } else {
    reasons.push('CNIC Expiry Date is missing');
  }

  // 2. OCR CNIC Match
  const typedCnic = (application.personalInfo?.cnic || '').replace(/[-\s]/g, '');
  const cleanedOcrCnic = ocrCnic.replace(/[-\s]/g, '');

  if (cleanedOcrCnic && typedCnic === cleanedOcrCnic) {
    aiVerification.cnicOcrMatched = true;
  } else {
    reasons.push(`CNIC OCR mismatch: typed="${typedCnic || 'none'}", extracted="${cleanedOcrCnic || 'none'}"`);
  }

  // 3. CGPA Check (min 2.5)
  if (application.cgpa !== undefined && application.cgpa >= 2.5) {
    aiVerification.cgpaValid = true;
  } else {
    reasons.push(`CGPA is ${application.cgpa || 0}, below the 2.5 threshold`);
  }

  // 4. Intermediate Marks Check (min 50%)
  if (application.interMarks !== undefined && application.interMarks >= 50) {
    aiVerification.interMarksValid = true;
  } else {
    reasons.push(`Intermediate marks are ${application.interMarks || 0}%, below the 50% threshold`);
  }

  // 5. Document Completeness Check
  const docs = application.documents || {};
  if (docs.cnicFront && docs.cnicBack && docs.matricMarksheet && docs.interMarksheet && docs.transcript) {
    aiVerification.documentsComplete = true;
  } else {
    const missing = [];
    if (!docs.cnicFront) missing.push('CNIC Front');
    if (!docs.cnicBack) missing.push('CNIC Back');
    if (!docs.matricMarksheet) missing.push('Matric Marksheet');
    if (!docs.interMarksheet) missing.push('Intermediate Marksheet');
    if (!docs.transcript) missing.push('Transcript');
    reasons.push(`Missing documents: ${missing.join(', ')}`);
  }

  // Decision compilation
  const allPassed = aiVerification.cnicExpiryValid &&
                    aiVerification.cnicOcrMatched &&
                    aiVerification.cgpaValid &&
                    aiVerification.interMarksValid &&
                    aiVerification.documentsComplete;

  if (allPassed) {
    aiVerification.finalDecision = 'Passed';
    aiVerification.reason = 'All automated verification checks passed successfully.';
  } else {
    aiVerification.finalDecision = 'Failed';
    aiVerification.reason = reasons.join('; ');
  }

  return aiVerification;
};

module.exports = { runVerification };
