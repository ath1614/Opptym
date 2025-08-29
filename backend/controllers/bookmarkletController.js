const BookmarkletToken = require('../models/bookmarkletTokenModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Generate a new bookmarklet token
const generateBookmarkletToken = async (req, res) => {
  try {
    console.log('🔍 generateBookmarkletToken called with:', { 
      projectId: req.body.projectId, 
      userId: req.userId,
      body: req.body 
    });
    
    const { projectId } = req.body;
    const userId = req.userId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Verify project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Check user subscription status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has permission to create bookmarklets
    if (!user.hasPermission('canCreateProjects')) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to create bookmarklets'
      });
    }

    // Prepare project data for bookmarklet
    const projectData = {
      name: project.name || project.title || '',
      email: project.email || '',
      phone: project.businessPhone || '',
      companyName: project.companyName || '',
      url: project.url || '',
      description: project.description || '',
      address: project.address1 || '',
      city: project.city || '',
      state: project.state || '',
      country: project.country || '',
      pincode: project.pincode || ''
    };

    // Create token with subscription-based limits
    const tokenOptions = {
      expiresInHours: 24, // 24 hours default
      maxUsage: 10, // 10 uses default
      rateLimitSeconds: 5 // 5 seconds between uses
    };

    // Adjust limits based on subscription tier
    if (user.subscription === 'pro' || user.subscription === 'business') {
      tokenOptions.maxUsage = 50;
      tokenOptions.expiresInHours = 72; // 3 days
      tokenOptions.rateLimitSeconds = 2;
    } else if (user.subscription === 'enterprise') {
      tokenOptions.maxUsage = 100;
      tokenOptions.expiresInHours = 168; // 7 days
      tokenOptions.rateLimitSeconds = 1;
    }

    const bookmarkletToken = await BookmarkletToken.createToken(
      userId,
      projectId,
      projectData,
      tokenOptions
    );

    await bookmarkletToken.save();

    console.log('✅ Bookmarklet token generated:', {
      token: bookmarkletToken.token.substring(0, 8) + '...',
      userId,
      projectId,
      maxUsage: tokenOptions.maxUsage,
      expiresIn: tokenOptions.expiresInHours + ' hours'
    });

    res.status(201).json({
      success: true,
      message: 'Bookmarklet token generated successfully',
      data: {
        token: bookmarkletToken.token,
        expiresAt: bookmarkletToken.expiresAt,
        maxUsage: bookmarkletToken.maxUsage,
        usageCount: bookmarkletToken.usageCount,
        rateLimitSeconds: bookmarkletToken.rateLimitSeconds
      }
    });

  } catch (error) {
    console.error('❌ Error generating bookmarklet token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bookmarklet token',
      error: error.message
    });
  }
};

// Validate bookmarklet token and increment usage
const validateBookmarkletToken = async (req, res) => {
  try {
    const { token } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Find token in database
    const bookmarkletToken = await BookmarkletToken.findOne({ token });
    if (!bookmarkletToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid bookmarklet token'
      });
    }

    // Check if token is active
    if (!bookmarkletToken.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Bookmarklet token has been deactivated'
      });
    }

    // Check if token has expired
    if (bookmarkletToken.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Bookmarklet token has expired'
      });
    }

    // Check usage limits
    if (bookmarkletToken.usageCount >= bookmarkletToken.maxUsage) {
      return res.status(403).json({
        success: false,
        message: 'Bookmarklet usage limit exceeded'
      });
    }

    // Check rate limiting
    if (bookmarkletToken.isRateLimited()) {
      const timeRemaining = Math.ceil(bookmarkletToken.rateLimitSeconds - 
        (new Date() - bookmarkletToken.lastUsedAt) / 1000);
      
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please wait ${timeRemaining} seconds before trying again.`
      });
    }

    // Increment usage and get updated token
    await bookmarkletToken.incrementUsage(clientIP, userAgent);

    console.log('✅ Bookmarklet token validated:', {
      token: token.substring(0, 8) + '...',
      usageCount: bookmarkletToken.usageCount + 1,
      maxUsage: bookmarkletToken.maxUsage,
      clientIP: clientIP.substring(0, 15) + '...'
    });

    res.status(200).json({
      success: true,
      message: 'Token validated successfully',
      data: {
        projectData: bookmarkletToken.projectData,
        usageCount: bookmarkletToken.usageCount,
        maxUsage: bookmarkletToken.maxUsage,
        remainingUses: bookmarkletToken.maxUsage - bookmarkletToken.usageCount,
        expiresAt: bookmarkletToken.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Error validating bookmarklet token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate bookmarklet token',
      error: error.message
    });
  }
};

// Get user's bookmarklet tokens
const getUserBookmarkletTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tokens = await BookmarkletToken.find({ userId })
      .populate('projectId', 'name companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BookmarkletToken.countDocuments({ userId });

    const tokensWithStatus = tokens.map(token => ({
      id: token._id,
      token: token.token.substring(0, 8) + '...',
      projectName: token.projectId?.name || 'Unknown Project',
      usageCount: token.usageCount,
      maxUsage: token.maxUsage,
      isActive: token.isValid(),
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      lastUsedAt: token.lastUsedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        tokens: tokensWithStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user bookmarklet tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarklet tokens',
      error: error.message
    });
  }
};

// Deactivate bookmarklet token
const deactivateBookmarkletToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = req.user.id;

    const token = await BookmarkletToken.findOne({ _id: tokenId, userId });
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Bookmarklet token not found'
      });
    }

    token.isActive = false;
    await token.save();

    console.log('✅ Bookmarklet token deactivated:', {
      tokenId,
      userId,
      token: token.token.substring(0, 8) + '...'
    });

    res.status(200).json({
      success: true,
      message: 'Bookmarklet token deactivated successfully'
    });

  } catch (error) {
    console.error('❌ Error deactivating bookmarklet token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate bookmarklet token',
      error: error.message
    });
  }
};

// Get bookmarklet usage analytics
const getBookmarkletAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    }

    const tokens = await BookmarkletToken.find({ userId, ...dateFilter });
    
    const analytics = {
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => t.isValid()).length,
      totalUsage: tokens.reduce((sum, t) => sum + t.usageCount, 0),
      averageUsagePerToken: tokens.length > 0 ? 
        (tokens.reduce((sum, t) => sum + t.usageCount, 0) / tokens.length).toFixed(2) : 0,
      expiredTokens: tokens.filter(t => t.expiresAt < now).length,
      usageLimitExceeded: tokens.filter(t => t.usageCount >= t.maxUsage).length
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('❌ Error fetching bookmarklet analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarklet analytics',
      error: error.message
    });
  }
};

module.exports = {
  generateBookmarkletToken,
  validateBookmarkletToken,
  getUserBookmarkletTokens,
  deactivateBookmarkletToken,
  getBookmarkletAnalytics
};
