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

    // Enhanced input validation with specific error messages
    const validationErrors = [];
    
    // Title validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      validationErrors.push({ field: 'title', message: 'Project title is required' });
    } else if (title.trim().length < 3) {
      validationErrors.push({ field: 'title', message: 'Project title must be at least 3 characters long' });
    } else if (title.trim().length > 100) {
      validationErrors.push({ field: 'title', message: 'Project title must be less than 100 characters' });
    }

    // URL validation
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      validationErrors.push({ field: 'url', message: 'Website URL is required' });
    } else {
      const urlPattern = /^https?:\/\/.+|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!urlPattern.test(url.trim())) {
        validationErrors.push({ field: 'url', message: 'Please enter a valid website URL (e.g., https://example.com or example.com)' });
      }
    }

    // Email validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      validationErrors.push({ field: 'email', message: 'Business email is required' });
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        validationErrors.push({ field: 'email', message: 'Please enter a valid email address (e.g., contact@example.com)' });
      }
    }

    // Company name validation
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      validationErrors.push({ field: 'companyName', message: 'Company name is required' });
    } else if (companyName.trim().length < 2) {
      validationErrors.push({ field: 'companyName', message: 'Company name must be at least 2 characters long' });
    } else if (companyName.trim().length > 100) {
      validationErrors.push({ field: 'companyName', message: 'Company name must be less than 100 characters' });
    }

    // Business phone validation
    if (!businessPhone || typeof businessPhone !== 'string' || businessPhone.trim().length === 0) {
      validationErrors.push({ field: 'businessPhone', message: 'Business phone number is required' });
    } else {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = businessPhone.replace(/[\s\-\(\)]/g, '');
      if (!phonePattern.test(cleanPhone)) {
        validationErrors.push({ field: 'businessPhone', message: 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)' });
      }
    }

    // Description validation
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      validationErrors.push({ field: 'description', message: 'Business description is required' });
    } else if (description.trim().length < 20) {
      validationErrors.push({ field: 'description', message: 'Business description must be at least 20 characters long' });
    } else if (description.trim().length > 1000) {
      validationErrors.push({ field: 'description', message: 'Business description must be less than 1000 characters' });
    }

    // Address validation
    if (!address1 || typeof address1 !== 'string' || address1.trim().length === 0) {
      validationErrors.push({ field: 'address1', message: 'Street address is required' });
    } else if (address1.trim().length < 5) {
      validationErrors.push({ field: 'address1', message: 'Please enter a complete street address' });
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      validationErrors.push({ field: 'city', message: 'City is required' });
    } else if (city.trim().length < 2) {
      validationErrors.push({ field: 'city', message: 'Please enter a valid city name' });
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      validationErrors.push({ field: 'state', message: 'State/Province is required' });
    } else if (state.trim().length < 2) {
      validationErrors.push({ field: 'state', message: 'Please enter a valid state or province' });
    }

    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      validationErrors.push({ field: 'country', message: 'Country is required' });
    } else if (country.trim().length < 2) {
      validationErrors.push({ field: 'country', message: 'Please enter a valid country name' });
    }

    if (!pincode || typeof pincode !== 'string' || pincode.trim().length === 0) {
      validationErrors.push({ field: 'pincode', message: 'Postal/ZIP code is required' });
    } else {
      const pincodePattern = /^[a-zA-Z0-9\s\-]{3,10}$/;
      if (!pincodePattern.test(pincode.trim())) {
        validationErrors.push({ field: 'pincode', message: 'Please enter a valid postal/ZIP code (e.g., 12345 or SW1A 1AA)' });
      }
    }

    // Optional field validations
    if (whatsapp && whatsapp.trim()) {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanWhatsapp = whatsapp.replace(/[\s\-\(\)]/g, '');
      if (!phonePattern.test(cleanWhatsapp)) {
        validationErrors.push({ field: 'whatsapp', message: 'Please enter a valid WhatsApp number (e.g., +1234567890)' });
      }
    }

    if (metaTitle && metaTitle.trim().length > 60) {
      validationErrors.push({ field: 'metaTitle', message: 'Meta title should be less than 60 characters for better SEO' });
    }

    if (metaDescription && metaDescription.trim().length > 160) {
      validationErrors.push({ field: 'metaDescription', message: 'Meta description should be less than 160 characters for better SEO' });
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please fix the following errors:',
        validationErrors: validationErrors
      });
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
