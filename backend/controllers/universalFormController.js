// Mock implementation for deployment (puppeteer removed)
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Mock universal form controller for deployment
const runUniversalFormAnalysis = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Mock implementation for deployment
    const mockResult = {
      success: true,
      projectId: projectId,
      formAnalysis: {
        formCount: Math.floor(Math.random() * 5) + 1,
        fieldsDetected: Math.floor(Math.random() * 20) + 10,
        mappingAccuracy: Math.floor(Math.random() * 30) + 70,
        recommendations: [
          'Form structure detected successfully',
          'Field mapping completed',
          'Ready for automation'
        ]
      },
      message: 'Universal form analysis completed (mock data for deployment)'
    };

    res.json(mockResult);
  } catch (error) {
    console.error('Universal form analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

module.exports = { runUniversalFormAnalysis }; 