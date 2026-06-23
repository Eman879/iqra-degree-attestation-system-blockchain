const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { seedDB } = require('./seed/seeder');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists in server directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded documents statically so the client can preview them
app.use('/uploads', express.static(uploadsDir));

// API Router Mount
app.use('/api', apiRoutes);

// Root / Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Iqra Degree Attestation System API',
    time: new Date()
  });
});

// Initialize database connection, seed data, and start listening
const startServer = async () => {
  // Connect to DB (will fallback gracefully if MongoDB is not running)
  await connectDB();
  
  // Seed database/memory store with default users and applications
  await seedDB();

  app.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`Server is running on: http://localhost:${PORT}`);
    console.log(`Backend API Health:   http://localhost:${PORT}/`);
    console.log(`Serving uploads from: ${uploadsDir}`);
    console.log(`--------------------------------------------------`);
  });
};

startServer();
