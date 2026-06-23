const { storage } = require('../utils/storage');

/**
 * Validates and logs in student credentials.
 */
const studentLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Enforce Iqra email domain check
  const iqraDomain = '@iqra.edu.pk';
  if (!email.toLowerCase().endsWith(iqraDomain)) {
    return res.status(400).json({
      message: `Access denied. Only Iqra University emails (${iqraDomain}) are authorized to access this portal.`
    });
  }

  try {
    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Account not found. Please contact administration.' });
    }

    // Verify role matches
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Account is registered as an administrator.' });
    }

    // Simple plain text password check for MVP
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Return mock user session token / structure
    return res.status(200).json({
      message: 'Login successful',
      token: `mock_jwt_token_for_${user.email}`,
      user: {
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        cnic: user.cnic,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Student Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

/**
 * Logs in administrator credentials.
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Admin account not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. This account is not an administrator.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({
      message: 'Admin login successful',
      token: `mock_jwt_token_for_${user.email}`,
      user: {
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

module.exports = { studentLogin, adminLogin };
