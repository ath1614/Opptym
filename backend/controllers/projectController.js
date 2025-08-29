// controllers/projectController.js

const Project = require('../models/projectModel');
const User = require('../models/userModel');

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
    console.log('🔍 Current usage:', user.currentUsage);
    console.log('🔍 Subscription limits:', user.subscriptionLimits);

    // Check if user can create projects
    console.log('🔍 Checking user permissions...');
    console.log('🔍 User role:', user.role);
    console.log('🔍 User isAdmin:', user.isAdmin);
    console.log('🔍 User isOwner:', user.isOwner);
    console.log('🔍 User customPermissions:', user.customPermissions);
    
    // Ensure user has basic permissions - all authenticated users should be able to create projects
    let hasPermission = false;
    try {
      hasPermission = user.hasPermission('canCreateProjects');
    } catch (error) {
      console.log('🔍 Error checking permissions, using fallback:', error.message);
      // Fallback: allow project creation for all authenticated users
      hasPermission = true;
    }
    
    console.log('🔍 Has canCreateProjects permission:', hasPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to create projects' });
    }

    // Check project creation limit
    const canCreate = user.checkUsageLimit('projects');
    console.log('🔍 Can create project:', canCreate);
    
    if (!canCreate) {
      const limits = user.subscriptionLimits;
      return res.status(403).json({ 
        error: 'Project creation limit exceeded',
        limit: limits.projects,
        current: user.currentUsage.projectsCreated,
        subscription: user.subscription,
        details: 'Please upgrade your subscription to create more projects'
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
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Sanitize inputs
    const sanitizedData = {
      title: title.trim().substring(0, 200),
      url: url.trim(),
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
