// controllers/projectController.js

const Project = require('../models/projectModel');
const User = require('../models/userModel');
const { validateAllSocialMediaLinks } = require('../utils/socialMediaValidator');

// Import supported platforms for better error messages
const supportedPlatforms = {
  facebook: { name: 'Facebook' },
  twitter: { name: 'Twitter/X' },
  instagram: { name: 'Instagram' },
  linkedin: { name: 'LinkedIn' },
  youtube: { name: 'YouTube' },
  tiktok: { name: 'TikTok' },
  pinterest: { name: 'Pinterest' },
  reddit: { name: 'Reddit' },
  snapchat: { name: 'Snapchat' },
  whatsapp: { name: 'WhatsApp' }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    console.log('🔍 createProject called with userId:', req.userId);
    console.log('🔍 Request body:', req.body);
    
    // Check subscription limits
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found for userId:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🔍 User subscription:', user.subscription);
    console.log('🔍 Current usage:', user.usage);
    console.log('🔍 Subscription limits:', user.planLimits);

    // Check trial status for free users
    if (user.subscription === 'free' && !user.isInTrialPeriod()) {
      return res.status(403).json({
        error: 'Trial expired',
        message: 'Your free trial has expired. Please upgrade to continue creating projects.',
        trialExpired: true,
        subscription: user.subscription,
        trialEndDate: user.trialEndDate
      });
    }

    // Check if user can create projects
    console.log('🔍 Checking user permissions...');
    console.log('🔍 User role:', user.role);
    console.log('🔍 User subscription:', user.subscription);
    console.log('🔍 User is in trial:', user.isInTrialPeriod());
    
    // Check feature access
    if (!user.hasFeatureAccess('projects')) {
      return res.status(403).json({ 
        error: 'Feature access denied',
        message: 'You do not have permission to create projects with your current subscription.',
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    // Check project creation limit
    if (!user.checkUsageLimit('projects')) {
      const limits = user.planLimits;
      console.log('❌ Project limit exceeded for user:', user.email);
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        message: `You have reached your projects limit (${user.usage.projectsUsed}/${limits.projects}). Please upgrade your plan for more usage.`,
        feature: 'projects',
        currentUsage: user.usage.projectsUsed,
        limit: limits.projects,
        remaining: 0,
        subscription: user.subscription,
        requiresUpgrade: true
      });
    }

    const {
      title, url, category, email,
      metaTitle, metaDescription, keywords, targetKeywords,
      name, companyName, businessPhone, whatsapp, description,
      buildingName, address1, address2, address3,
      district, city, state, country, pincode,
      articleTitle, articleContent, authorName, authorBio, tags,
      productName, price, condition, productImageUrl,
      facebook, twitter, instagram, linkedin, youtube,
      businessHours, establishedYear, logoUrl,
      sitemapUrl, robotsTxtUrl
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized: userId is missing' });
    }

    // Input validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Project URL is required' });
    }

    // Validate URL format
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    try {
      new URL(processedUrl);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        details: 'Please enter a valid website URL (e.g., example.com or https://example.com)'
      });
    }

    // Prepare data for validation
    const rawData = {
      title: title.trim().substring(0, 200),
      url: processedUrl, // Use the processed URL with protocol
      category: category ? category.trim().substring(0, 100) : undefined,
      email: email ? email.trim().substring(0, 100) : undefined,
      metaTitle: metaTitle ? metaTitle.trim().substring(0, 200) : undefined,
      metaDescription: metaDescription ? metaDescription.trim().substring(0, 500) : undefined,
      keywords: Array.isArray(keywords) ? keywords.slice(0, 50).map(k => k.trim().substring(0, 100)) : undefined,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords.slice(0, 50).map(k => k.trim().substring(0, 100)) : undefined,
      name: name ? name.trim().substring(0, 100) : undefined,
      companyName: companyName ? companyName.trim().substring(0, 100) : undefined,
      businessPhone: businessPhone ? businessPhone.trim().substring(0, 20) : undefined,
      whatsapp: whatsapp ? whatsapp.trim().substring(0, 20) : undefined,
      description: description ? description.trim().substring(0, 1000) : undefined,
      buildingName: buildingName ? buildingName.trim().substring(0, 100) : undefined,
      address1: address1 ? address1.trim().substring(0, 200) : undefined,
      address2: address2 ? address2.trim().substring(0, 200) : undefined,
      address3: address3 ? address3.trim().substring(0, 200) : undefined,
      district: district ? district.trim().substring(0, 100) : undefined,
      city: city ? city.trim().substring(0, 100) : undefined,
      state: state ? state.trim().substring(0, 100) : undefined,
      country: country ? country.trim().substring(0, 100) : undefined,
      pincode: pincode ? pincode.trim().substring(0, 20) : undefined,
      articleTitle: articleTitle ? articleTitle.trim().substring(0, 200) : undefined,
      articleContent: articleContent ? articleContent.trim().substring(0, 10000) : undefined,
      authorName: authorName ? authorName.trim().substring(0, 100) : undefined,
      authorBio: authorBio ? authorBio.trim().substring(0, 500) : undefined,
      tags: Array.isArray(tags) ? tags.slice(0, 20).map(t => t.trim().substring(0, 50)) : undefined,
      productName: productName ? productName.trim().substring(0, 100) : undefined,
      price: price ? price.trim().substring(0, 50) : undefined,
      condition: condition ? condition.trim().substring(0, 50) : undefined,
      productImageUrl: productImageUrl ? productImageUrl.trim().substring(0, 500) : undefined,
      facebook: facebook ? facebook.trim().substring(0, 200) : undefined,
      twitter: twitter ? twitter.trim().substring(0, 200) : undefined,
      instagram: instagram ? instagram.trim().substring(0, 200) : undefined,
      linkedin: linkedin ? linkedin.trim().substring(0, 200) : undefined,
      youtube: youtube ? youtube.trim().substring(0, 200) : undefined,
      businessHours: businessHours ? businessHours.trim().substring(0, 200) : undefined,
      establishedYear: establishedYear ? establishedYear.trim().substring(0, 10) : undefined,
      logoUrl: logoUrl ? logoUrl.trim().substring(0, 500) : undefined,
      sitemapUrl: sitemapUrl ? sitemapUrl.trim().substring(0, 500) : undefined,
      robotsTxtUrl: robotsTxtUrl ? robotsTxtUrl.trim().substring(0, 500) : undefined
    };

    // Validate social media links
    const socialMediaValidation = validateAllSocialMediaLinks(rawData);
    if (!socialMediaValidation.isValid) {
      console.log(`❌ DEBUG: Social media validation failed:`, socialMediaValidation.errors);
      const errorDetails = socialMediaValidation.errors.map(err => {
        const platformName = supportedPlatforms[err.platform]?.name || err.platform;
        return `${platformName}: Please enter a valid ${platformName} URL (e.g., https://www.${err.platform}.com/yourpage)`;
      }).join('; ');
      
      return res.status(400).json({
        error: 'Invalid social media links',
        message: `Please fix the following social media links: ${errorDetails}`,
        details: errorDetails,
        socialMediaErrors: socialMediaValidation.errors
      });
    }

    // Use validated data
    const sanitizedData = socialMediaValidation.validatedData;

    const project = await Project.create({
      userId: req.userId,
      ...sanitizedData
    });

    // Increment usage
    await user.incrementUsage('projects');

    console.log('✅ Project created successfully:', project._id);

    res.status(201).json(project);
  } catch (err) {
    console.error('❌ createProject error:', err);
    res.status(400).json({ 
      error: 'Project creation failed',
      details: err.message 
    });
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId });
    res.status(200).json(projects);
  } catch (err) {
    console.error('❌ getProjects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error('❌ getProjectById error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const result = await Project.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found or already deleted' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('❌ deleteProject error:', err);
    res.status(400).json({ error: 'Delete failed' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    // Validate social media links if they are being updated
    const socialMediaFields = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'reddit', 'snapchat', 'whatsapp'];
    const hasSocialMediaUpdates = socialMediaFields.some(field => req.body[field] !== undefined);
    
    if (hasSocialMediaUpdates) {
      console.log(`🔍 DEBUG: Validating social media links in project update`);
      const socialMediaValidation = validateAllSocialMediaLinks(req.body);
      if (!socialMediaValidation.isValid) {
        console.log(`❌ DEBUG: Social media validation failed in update:`, socialMediaValidation.errors);
        return res.status(400).json({
          error: 'Invalid social media links',
          details: socialMediaValidation.errors.map(err => `${err.field}: ${err.error}`).join(', '),
          socialMediaErrors: socialMediaValidation.errors
        });
      }
      // Use validated data for update
      Object.assign(req.body, socialMediaValidation.validatedData);
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error('❌ updateProject error:', err);
    res.status(400).json({ error: 'Update failed' });
  }
};

// @desc    Get projects by user (alias for getProjects)
// @route   GET /api/projects/user
// @access  Private
const getProjectsByUser = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId });
    res.status(200).json(projects);
  } catch (err) {
    console.error('❌ getProjectsByUser error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByUser
};
