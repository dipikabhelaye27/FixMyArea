require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const issueRoutes = require('./routes/issueRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Connect to MongoDB Atlas (reuses existing connection in serverless / Vercel)
connectDB();

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static Asset Serving
const { uploadDir } = require('./config/cloudinary');
if (uploadDir) {
  app.use('/uploads', express.static(uploadDir));
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/issues', express.static(path.join(__dirname, '../../client/public/issues')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FixMyArea API & Real-Time Engine',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handler (Must be registered after routes)
app.use(errorHandler);

module.exports = app;
