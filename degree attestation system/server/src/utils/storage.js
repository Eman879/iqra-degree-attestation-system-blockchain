const User = require('../models/User');
const Application = require('../models/Application');
const { getIsConnected } = require('../config/db');

// Local variables to house mock data if MongoDB connection fails
let mockUsers = [];
let mockApplications = [];

/**
 * Feeds seeded structures into the in-memory array.
 */
const seedMockData = (users, apps) => {
  mockUsers = [...users];
  mockApplications = [...apps];
  console.log(`In-memory database seeded: ${mockUsers.length} users, ${mockApplications.length} applications.`);
};

const storage = {
  // USER OPERATIONS
  findUserByEmail: async (email) => {
    if (getIsConnected()) {
      try {
        return await User.findOne({ email });
      } catch (err) {
        console.error('Mongoose query failed, using in-memory backup:', err.message);
      }
    }
    return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: async (userData) => {
    if (getIsConnected()) {
      try {
        const newUser = new User(userData);
        return await newUser.save();
      } catch (err) {
        console.error('Mongoose write failed, using in-memory backup:', err.message);
      }
    }
    const newUser = {
      _id: 'mock_usr_' + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  // APPLICATION OPERATIONS
  findApplicationById: async (id) => {
    if (getIsConnected()) {
      try {
        return await Application.findById(id);
      } catch (err) {
        console.error('Mongoose query failed, using in-memory backup:', err.message);
      }
    }
    return mockApplications.find(a => a._id === id || a.id === id);
  },

  findApplicationsByStudent: async (email) => {
    if (getIsConnected()) {
      try {
        return await Application.find({ studentEmail: email }).sort({ createdAt: -1 });
      } catch (err) {
        console.error('Mongoose query failed, using in-memory backup:', err.message);
      }
    }
    return mockApplications
      .filter(a => a.studentEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findAllApplications: async () => {
    if (getIsConnected()) {
      try {
        return await Application.find().sort({ createdAt: -1 });
      } catch (err) {
        console.error('Mongoose query failed, using in-memory backup:', err.message);
      }
    }
    return [...mockApplications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createApplication: async (appData) => {
    if (getIsConnected()) {
      try {
        const newApp = new Application(appData);
        return await newApp.save();
      } catch (err) {
        console.error('Mongoose write failed, using in-memory backup:', err.message);
      }
    }
    const id = 'mock_app_' + Math.random().toString(36).substr(2, 9);
    const newApp = {
      _id: id,
      id: id,
      ...appData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockApplications.push(newApp);
    return newApp;
  },

  updateApplicationStatus: async (id, status, updates = {}) => {
    if (getIsConnected()) {
      try {
        return await Application.findByIdAndUpdate(
          id,
          { $set: { status, ...updates } },
          { new: true }
        );
      } catch (err) {
        console.error('Mongoose update failed, using in-memory backup:', err.message);
      }
    }
    const appIndex = mockApplications.findIndex(a => a._id === id || a.id === id);
    if (appIndex !== -1) {
      mockApplications[appIndex] = {
        ...mockApplications[appIndex],
        status,
        ...updates,
        updatedAt: new Date()
      };
      return mockApplications[appIndex];
    }
    return null;
  },

  getStats: async () => {
    let apps = [];
    if (getIsConnected()) {
      try {
        apps = await Application.find();
      } catch (err) {
        apps = mockApplications;
      }
    } else {
      apps = mockApplications;
    }

    return {
      total: apps.length,
      pending: apps.filter(a => a.status === 'Pending Review' || a.status === 'Submitted').length,
      approved: apps.filter(a => a.status === 'Approved').length,
      rejected: apps.filter(a => a.status === 'Rejected').length,
      underAiReview: apps.filter(a => a.status === 'Under AI Verification').length,
      paymentVerified: apps.filter(a => a.payment && a.payment.status === 'Paid').length,
    };
  }
};

module.exports = { storage, seedMockData };
