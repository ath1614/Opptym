const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { protect, adminOnly };