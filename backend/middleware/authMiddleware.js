const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Use fallback JWT secret if environment variable is not set
    const jwtSecret = process.env.JWT_SECRET || 'opptym-secret-key-2024-fallback';
    const decoded = jwt.verify(token, jwtSecret);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

const adminOnly = async (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { protect, adminOnly };