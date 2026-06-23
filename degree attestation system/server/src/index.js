const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const { connectDB } = require('./config/db');
const { seedDB } = require('./seed/seeder');
const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Iqra Degree Attestation System API',
    time: new Date()
  });
});

const startServer = async () => {
  await connectDB();
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
