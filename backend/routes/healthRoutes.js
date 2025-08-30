const express = require('express');
const router = express.Router();

// Version endpoint for deployment verification
router.get('/version', (req, res) => {
  const version = {
    commit: process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    buildTime: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: Date.now()
  };
  
  res.json(version);
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
