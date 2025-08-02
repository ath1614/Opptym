const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
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

// Create a new project
router.post('/', protect, createProject);

// Update a project
router.put('/:id', protect, updateProject);

// Delete a project
router.delete('/:id', protect, deleteProject);

module.exports = router;