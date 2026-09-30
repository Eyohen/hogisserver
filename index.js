//index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const paystackRoutes = require('./routes/paystack');

const app = express();
const port = process.env.API_PORT || 8000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5183')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hogis server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/paystack', paystackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Hogis server listening on port ${port}`);
  console.log(`🌍 Health check: http://localhost:${port}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
