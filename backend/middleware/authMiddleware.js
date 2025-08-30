const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('🔍 No token provided in Authorization header');
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Validate token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.log('🔍 Invalid token format');
      return res.status(401).json({ error: 'Not authorized, invalid token format' });
    }

    // JWT secret must be set in environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error('🔍 JWT verification failed:', jwtError.message);
      return res.status(401).json({ error: 'Not authorized, token verification failed' });
    }
    
    if (!decoded.userId) {
      console.log('🔍 Token payload missing userId');
      return res.status(401).json({ error: 'Not authorized, invalid token payload' });
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('🔍 User not found for token userId:', decoded.userId);
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    // Check if user subscription is active
    if (user.subscriptionStatus !== 'active') {
      console.log('🔍 User subscription not active:', user.subscriptionStatus);
      return res.status(401).json({ error: 'Not authorized, subscription not active' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('🔍 Auth middleware error:', error);
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