// controllers/projectController.js

const Project = require('../models/projectModel');
const User = require('../models/userModel');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    // Check subscription limits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🔍 User subscription:', user.subscription);
    console.log('🔍 Current usage:', user.currentUsage);
    console.log('🔍 Subscription limits:', user.subscriptionLimits);

    // Check if user can create projects
    if (!user.hasPermission('canCreateProjects')) {
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

    const project = await Project.create({
      userId: req.userId,
      title, url, category, email,
      metaTitle, metaDescription,
      keywords, targetKeywords,
      name, companyName, businessPhone, whatsapp, description,
      buildingName, address1, address2, address3,
      district, city, state, country, pincode,
      articleTitle, articleContent, authorName, authorBio, tags,
      productName, price, condition, productImageUrl,
      facebook, twitter, instagram, linkedin, youtube,
      businessHours, establishedYear, logoUrl,
      sitemapUrl, robotsTxtUrl
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
