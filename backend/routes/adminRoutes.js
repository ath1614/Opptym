const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');
const Plan = require('../models/planModel');
const PricingPlan = require('../models/pricingPlanModel');
const Stripe = require('stripe');
const stripeConfig = require('../config/stripeConfig');

const stripe = Stripe(stripeConfig.STRIPE_SECRET_KEY);

// Get all users (admin only)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system stats (admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    // Calculate new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Calculate growth rate (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const usersLastMonth = await User.countDocuments({
      createdAt: { $lt: startOfMonth, $gte: lastMonth }
    });
    const growthRate = usersLastMonth > 0 ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100) : 0;

    // Calculate success rate
    const successfulSubmissions = await Submission.countDocuments({ status: 'success' });
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;

    // Mock revenue (in real app, this would come from payment system)
    const revenue = totalUsers * 10; // Mock calculation

    res.json({
      totalUsers,
      activeUsers,
      totalProjects,
      totalSubmissions,
      revenue,
      successRate,
      newUsersThisMonth,
      growthRate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Create new user (admin only)
router.post('/users', protect, adminOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, password, isAdmin, subscription, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      firstName,
      lastName,
      password,
      isAdmin: isAdmin || false,
      subscription: subscription || 'free',
      status: status || 'active'
    });

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/users/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, firstName, lastName, isAdmin, subscription, status, phone, company, website, timezone, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (subscription) user.subscription = subscription;
    if (status) user.status = status;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (website) user.website = website;
    if (timezone) user.timezone = timezone;
    if (bio) user.bio = bio;

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user verification status (admin only)
router.put('/users/:userId/verify', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isEmailVerified, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update verification status
    if (isEmailVerified !== undefined) {
      user.isEmailVerified = isEmailVerified;
      if (isEmailVerified && !user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }
    }

    // Update account status
    if (status) {
      user.status = status;
    }

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user verification:', error);
    res.status(500).json({ error: 'Failed to update user verification status' });
  }
});

// Send verification email to user (admin only)
router.post('/users/:userId/send-verification', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { transporter, emailTemplates } = require('../config/emailConfig');
    const crypto = require('crypto');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'User email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const mailOptions = emailTemplates.verificationEmail(verificationToken, user.email);
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Plan management routes
// Get all plans (admin only)
router.get('/plans', protect, adminOnly, async (req, res) => {
  try {
    // Define plans structure
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        features: ['Basic SEO tools', 'Limited submissions', '3-day trial'],
        limits: { projects: 10, submissions: 50, teamMembers: 0 }
      },
      starter: {
        name: 'Starter',
        price: 999,
        features: ['All SEO tools', '150 submissions/month', 'Email support'],
        limits: { projects: 1, submissions: 150, teamMembers: 0 }
      },
      pro: {
        name: 'Pro',
        price: 3999,
        features: ['All SEO tools', '750 submissions/month', 'Team management', 'Priority support'],
        limits: { projects: 5, submissions: 750, teamMembers: 3 }
      },
      business: {
        name: 'Business',
        price: 8999,
        features: ['All SEO tools', '1500 submissions/month', 'Advanced analytics', 'Dedicated support'],
        limits: { projects: 10, submissions: 1500, teamMembers: 10 }
      },
      enterprise: {
        name: 'Enterprise',
        price: 19999,
        features: ['Unlimited everything', 'Custom integrations', 'Dedicated account manager'],
        limits: { projects: -1, submissions: -1, teamMembers: -1 }
      }
    };

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create new plan (admin only)
router.post('/plans', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, features, limits, isActive } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // In a real application, you would save this to a database
    // For now, we'll just return success
    const newPlan = {
      id: Date.now().toString(),
      name,
      price,
      features: features || [],
      limits: limits || {},
      isActive: isActive !== false
    };

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Update plan (admin only)
router.put('/plans/:planId', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, price, features, limits, isActive } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // In a real application, you would update this in a database
    const updatedPlan = {
      id: planId,
      name,
      price,
      features: features || [],
      limits: limits || {},
      isActive: isActive !== false
    };

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete plan (admin only)
router.delete('/plans/:planId', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;

    // In a real application, you would delete this from a database
    // For now, we'll just return success

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Update user (admin only)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, password, isAdmin, subscription, status } = req.body;
    
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      isAdmin: isAdmin || false,
      subscription: subscription || 'free',
      status: status || 'active'
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all directories (admin only) with filtering
router.get('/directories', protect, adminOnly, async (req, res) => {
  try {
    const { classification, category, status, search } = req.query;
    
    let filter = {};
    
    // Add filters if provided
    if (classification && classification !== 'all') {
      filter.classification = classification;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const directories = await Directory.find(filter).sort({ 
      isCustom: -1, // Custom directories first
      priority: -1, // Then by priority
      pageRank: -1, // Then by page rank
      createdAt: -1 // Then by creation date
    });
    
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

// Get directory classifications (admin only)
router.get('/directories/classifications', protect, adminOnly, async (req, res) => {
  try {
    const classifications = await Directory.distinct('classification');
    const countByClassification = await Directory.aggregate([
      { $group: { _id: '$classification', count: { $sum: 1 } } }
    ]);
    
    const classificationStats = classifications.map(classification => {
      const stat = countByClassification.find(c => c._id === classification);
      return {
        name: classification,
        count: stat ? stat.count : 0
      };
    });
    
    res.json(classificationStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

// Create new directory (admin only)
router.post('/directories', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔍 Directory creation request received:', {
      body: req.body,
      userId: req.userId,
      userRole: req.user?.role
    });

    const {
      name,
      domain,
      description,
      category,
      country,
      classification,
      pageRank,
      daScore,
      spamScore,
      isPremium,
      requiresApproval,
      submissionUrl,
      contactEmail,
      submissionGuidelines,
      requiredFields,
      freeUserLimit,
      starterUserLimit,
      proUserLimit,
      businessUserLimit,
      enterpriseUserLimit,
      priority
    } = req.body;

    // Validate required fields
    if (!name || !domain || !submissionUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Name, domain, and submission URL are required' 
      });
    }

    // Check if directory with same name already exists
    const existingDirectory = await Directory.findOne({ name });
    if (existingDirectory) {
      return res.status(400).json({ error: 'Directory with this name already exists' });
    }

    // Create new directory with proper schema
    const directory = new Directory({
      name,
      domain,
      description: description || '',
      category: category || 'business',
      country: country || 'Global',
      classification: classification || 'Directory Submission',
      pageRank: pageRank || 0,
      daScore: daScore || 0,
      spamScore: spamScore || 0,
      isPremium: isPremium || false,
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
      submissionUrl,
      contactEmail: contactEmail || '',
      submissionGuidelines: submissionGuidelines || '',
      requiredFields: requiredFields || [],
      freeUserLimit: freeUserLimit || 0,
      starterUserLimit: starterUserLimit || 5,
      proUserLimit: proUserLimit || 20,
      businessUserLimit: businessUserLimit || 50,
      enterpriseUserLimit: enterpriseUserLimit || -1,
      priority: priority || 0,
      isCustom: true, // Mark as custom directory
      createdBy: req.userId // Required field
    });

    await directory.save();
    
    res.status(201).json(directory);
  } catch (error) {
    console.error('Error creating directory:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      errors: error.errors
    });
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors,
        fieldErrors: error.errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Directory with this name or domain already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create directory', details: error.message });
  }
});

// Create custom package for user (admin only)
router.post('/users/:userId/custom-package', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      description,
      price,
      billingCycle,
      limits,
      features
    } = req.body;

    // Validate required fields
    if (!name || !limits) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Name and limits are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set custom plan details
    user.subscription = 'custom';
    user.customPlan = {
      name: name,
      description: description || '',
      price: price || 0,
      billingCycle: billingCycle || 'monthly',
      limits: {
        submissions: limits.submissions || 5,
        projects: limits.projects || 1,
        tools: limits.tools || 10,
        apiCalls: limits.apiCalls || 20
      },
      features: {
        canCreateProjects: features?.canCreateProjects !== undefined ? features.canCreateProjects : true,
        canSubmitDirectories: features?.canSubmitDirectories !== undefined ? features.canSubmitDirectories : true,
        canUseSeoTools: features?.canUseSeoTools !== undefined ? features.canUseSeoTools : true,
        canAccessAnalytics: features?.canAccessAnalytics !== undefined ? features.canAccessAnalytics : false,
        canAccessAdmin: features?.canAccessAdmin !== undefined ? features.canAccessAdmin : false
      }
    };

    // Update plan limits and features
    await user.setPlanLimits();

    res.json({
      message: 'Custom package created successfully',
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
        customPlan: user.customPlan,
        planLimits: user.planLimits,
        features: user.features
      }
    });
  } catch (error) {
    console.error('Error creating custom package:', error);
    res.status(500).json({ error: 'Failed to create custom package', details: error.message });
  }
});

// Update directory (admin only)
router.put('/directories/:directoryId', protect, adminOnly, async (req, res) => {
  try {
    const { directoryId } = req.params;
    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.createdBy;
    delete updateFields.createdAt;
    delete updateFields._id;

    const directory = await Directory.findById(directoryId);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Update all provided fields
    Object.assign(directory, updateFields);
    directory.updatedAt = new Date();

    await directory.save();
    
    res.json(directory);
  } catch (error) {
    console.error('Error updating directory:', error);
    res.status(500).json({ error: 'Failed to update directory', details: error.message });
  }
});

// Delete directory (admin only)
router.delete('/directories/:directoryId', protect, adminOnly, async (req, res) => {
  try {
    const { directoryId } = req.params;

    const directory = await Directory.findById(directoryId);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    await Directory.findByIdAndDelete(directoryId);
    
    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    console.error('Error deleting directory:', error);
    res.status(500).json({ error: 'Failed to delete directory' });
  }
});

// Get all projects (admin only)
router.get('/projects', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get all submissions (admin only)
router.get('/submissions', protect, adminOnly, async (req, res) => {
  try {
    const submissions = await Submission.find({});
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Invite team member (admin only)
router.post('/invite-team-member', protect, adminOnly, async (req, res) => {
  try {
    const { email, role, teamId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create invitation (mock implementation)
    const invitation = {
      email,
      role: role || 'user', // Changed from 'employee' to 'user'
      teamId: teamId || null,
      status: 'pending',
      invitedBy: req.userId,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    console.log('✅ Team member invitation created:', invitation);

    res.json({
      success: true,
      message: 'Team member invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('❌ Invite team member error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

// Save admin settings (admin only)
router.post('/save-settings', protect, adminOnly, async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Mock implementation for saving admin settings
    const adminSettings = {
      ...settings,
      updatedAt: new Date(),
      updatedBy: req.userId
    };

    console.log('✅ Admin settings saved:', adminSettings);

    res.json({
      success: true,
      message: 'Admin settings saved successfully',
      settings: adminSettings
    });
  } catch (error) {
    console.error('❌ Save admin settings error:', error);
    res.status(500).json({ error: 'Failed to save admin settings' });
  }
});

// Get admin settings (admin only)
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    // Mock admin settings
    const adminSettings = {
      systemName: 'OPPTYM',
      contactEmail: 'admin@opptym.com',
      maxUsers: 1000,
      maxProjects: 100,
      maintenanceMode: false,
      autoBackup: true,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    res.json(adminSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
});

// ==================== PRICING PLAN MANAGEMENT ====================

// Test endpoint for debugging
router.get('/test', protect, adminOnly, (req, res) => {
  res.json({ 
    message: 'Admin API is working', 
    timestamp: new Date().toISOString(),
    user: req.user.email 
  });
});

// Get all pricing plans (admin only)
router.get('/pricing-plans', protect, adminOnly, async (req, res) => {
  try {
    const plans = await Plan.find({}).sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

// Create new pricing plan (admin only)
router.post('/pricing-plans', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      features,
      price,
      limits,
      stripePriceIds,
      trialDays,
      isActive,
      isPopular,
      sortOrder,
      metadata
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !limits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe product and prices if not provided (only if valid keys exist)
    let stripeProductId = null;
    let monthlyPriceId = null;
    let yearlyPriceId = null;

    // Only create Stripe products if we have valid Stripe keys
    if (stripeConfig.STRIPE_SECRET_KEY && !stripeConfig.STRIPE_SECRET_KEY.includes('XXXX')) {
      try {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: name,
        description: description,
        metadata: {
          planName: name,
          createdBy: 'admin'
        }
      });
      stripeProductId = stripeProduct.id;

      // Create monthly price if provided
      if (price.monthly > 0) {
        const monthlyPrice = await stripe.prices.create({
          unit_amount: price.monthly * 100, // Convert to cents/paise
          currency: stripeConfig.DEFAULT_CURRENCY,
          recurring: { interval: 'month' },
          product: stripeProductId,
          metadata: {
            planName: name,
            billingCycle: 'monthly'
          }
        });
        monthlyPriceId = monthlyPrice.id;
      }

      // Create yearly price if provided
      if (price.yearly > 0) {
        const yearlyPrice = await stripe.prices.create({
          unit_amount: price.yearly * 100, // Convert to cents/paise
          currency: stripeConfig.DEFAULT_CURRENCY,
          recurring: { interval: 'year' },
          product: stripeProductId,
          metadata: {
            planName: name,
            billingCycle: 'yearly'
          }
        });
        yearlyPriceId = yearlyPrice.id;
      }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue without Stripe integration if it fails
        console.log('Continuing without Stripe integration...');
      }
    } else {
      console.log('Skipping Stripe integration - no valid keys provided');
    }

    // Create plan in database
    const planData = {
      name,
      description,
      features: features || [],
      price: {
        monthly: price.monthly || 0,
        yearly: price.yearly || 0
      },
      limits: {
        projects: limits.projects || 1,
        submissions: limits.submissions || 10,
        tools: limits.tools || 10,
        apiCalls: limits.apiCalls || 20
      },
      stripePriceIds: {
        monthly: monthlyPriceId,
        yearly: yearlyPriceId
      },
      trialDays: trialDays || 0,
      isActive: isActive !== undefined ? isActive : true,
      isPopular: isPopular || false,
      sortOrder: sortOrder || 0,
      metadata: metadata || {
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600',
        icon: 'star'
      }
    };

    console.log('Creating plan with data:', JSON.stringify(planData, null, 2));
    
    const plan = new Plan(planData);

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Plan name already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create pricing plan',
      details: error.message 
    });
  }
});

// Update pricing plan (admin only)
router.put('/pricing-plans/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing plan
    const existingPlan = await Plan.findById(id);
    if (!existingPlan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    // Update Stripe product if name or description changed
    if (updateData.name || updateData.description) {
      try {
        await stripe.products.update(existingPlan.stripeProductId, {
          name: updateData.name || existingPlan.name,
          description: updateData.description || existingPlan.description
        });
      } catch (stripeError) {
        console.error('Stripe update error:', stripeError);
      }
    }

    // Update plan in database
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pricing plan updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
});

// Delete pricing plan (admin only)
router.delete('/pricing-plans/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    // Archive Stripe product instead of deleting
    if (plan.stripeProductId) {
      try {
        await stripe.products.update(plan.stripeProductId, {
          active: false
        });
      } catch (stripeError) {
        console.error('Stripe archive error:', stripeError);
      }
    }

    // Soft delete - mark as inactive
    await Plan.findByIdAndUpdate(id, { 
      isActive: false,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Pricing plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
});

// Toggle plan active status (admin only)
router.patch('/pricing-plans/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { isActive: !plan.isActive },
      { new: true }
    );

    res.json({
      success: true,
      message: `Pricing plan ${updatedPlan.isActive ? 'activated' : 'deactivated'} successfully`,
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error toggling pricing plan:', error);
    res.status(500).json({ error: 'Failed to toggle pricing plan status' });
  }
});

// Reorder pricing plans (admin only)
router.patch('/pricing-plans/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { planOrders } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(planOrders)) {
      return res.status(400).json({ error: 'Invalid plan orders format' });
    }

    // Update sort orders
    const updatePromises = planOrders.map(({ id, sortOrder }) =>
      Plan.findByIdAndUpdate(id, { sortOrder })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Pricing plans reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering pricing plans:', error);
    res.status(500).json({ error: 'Failed to reorder pricing plans' });
  }
});

module.exports = router; 