#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createValidToken() {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found');
      return;
    }

    const jwtSecret = 'opptym-development-jwt-secret-key-2024';
    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: '1h' }
    );

    console.log('Valid token for user:', user.email);
    console.log('Token:', token);
    
    // Test the token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded token:', decoded);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createValidToken();
