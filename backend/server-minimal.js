const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting Minimal OPPTYM Backend...');

const app = express();

// Basic CORS - allow everything
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Minimal OPPTYM Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test CORS
app.get('/api/test-cors', (req, res) => {
  res.status(200).json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test auth endpoints
app.post('/api/auth/signup', (req, res) => {
  console.log('📝 Signup request received:', req.body);
  res.status(200).json({
    message: 'Signup endpoint is working!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login request received:', req.body);
  res.status(200).json({
    message: 'Login endpoint is working!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Handle preflight
app.options('*', cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 CORS test: http://localhost:${PORT}/api/test-cors`);
});
