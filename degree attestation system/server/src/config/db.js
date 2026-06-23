const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iqra-attestation';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    
    // Set a timeout of 5 seconds so it doesn't hang forever if MongoDB is down
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('==================================================');
    console.error('WARNING: Could not connect to MongoDB.');
    console.error('The backend will fall back to using In-Memory Storage!');
    console.error('Ensure MongoDB is installed and running if you want data persistence.');
    console.error('Error Details:', error.message);
    console.error('==================================================');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
