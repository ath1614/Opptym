const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { checkTrialStatus, checkUsageLimit } = require('../middleware/trialMiddleware');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByUser
} = require('../controllers/projectController');

// Get all projects for the authenticated user
router.get('/', protect, getProjects);

// Get a specific project by ID
router.get('/:id', protect, getProjectById);

// Create a new project - requires trial check and usage limit check
router.post('/', protect, checkTrialStatus, checkUsageLimit('projects'), createProject);

// Update a project - requires trial check
router.put('/:id', protect, checkTrialStatus, updateProject);

// Delete a project - requires trial check
router.delete('/:id', protect, checkTrialStatus, deleteProject);

module.exports = router;