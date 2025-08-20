const Project = require('../models/projectModel');
const AutomationService = require('../services/puppeteer/automationService');

// Ultra smart automation execution using Puppeteer
const openAndUltraFill = async (req, res) => {
  try {
    const { url, projectId } = req.body;
    
    if (!url || !projectId) {
      return res.status(400).json({ error: 'URL and project ID are required' });
    }

    // Get project data
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('🚀 Starting ultra smart automation for:', url);
    console.log('📋 Project data:', {
      name: project.name,
      email: project.email,
      phone: project.phone,
      companyName: project.companyName,
      url: project.url,
      description: project.description
    });

    // Initialize Puppeteer automation service
    const automationService = new AutomationService();
    
    try {
      // Initialize browser
      const initialized = await automationService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Puppeteer browser');
      }

      console.log('✅ Puppeteer browser initialized successfully');

      // Navigate to the URL
      const navigated = await automationService.navigateToUrl(url);
      if (!navigated) {
        throw new Error('Failed to navigate to the specified URL');
      }

      console.log('✅ Successfully navigated to:', url);

      // Prepare project data for form filling
      const projectData = {
        name: project.name || '',
        email: project.email || '',
        phone: project.phone || '',
        companyName: project.companyName || '',
        url: project.url || '',
        address: project.address1 || '',
        city: project.city || '',
        state: project.state || '',
        country: project.country || '',
        description: project.description || ''
      };

      // Fill form fields
      console.log('🔄 Starting form field detection and filling...');
      const fillResult = await automationService.fillFormFields(projectData);
      
      console.log('✅ Form filling completed:', {
        totalFieldsFound: fillResult.totalFieldsFound,
        totalFieldsFilled: fillResult.totalFieldsFilled,
        filledFields: fillResult.filledFields
      });

      // Submit the form
      console.log('🔄 Attempting to submit form...');
      const submitted = await automationService.submitForm();
      
      console.log('✅ Form submission result:', submitted);

      // Get the current page URL after form filling
      const currentUrl = await automationService.getCurrentUrl();
      console.log('✅ Current URL after form filling:', currentUrl);

      // Close browser
      console.log('✅ Form filling completed, closing browser...');
      await automationService.close();
      console.log('✅ Browser closed successfully');

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Form automation completed successfully!',
        data: {
          url: url,
          projectName: project.name,
          fieldsFilled: fillResult.totalFieldsFilled,
          totalFields: fillResult.totalFieldsFound || 0,
          filledFields: fillResult.filledFields || [],
          formSubmitted: submitted,
          formUrl: currentUrl || url, // Use current URL if different
          automationCompleted: true,
          automationType: 'backend',
          instructions: {
            type: 'backend_automation',
            message: 'Form was filled automatically on the server. You can visit the website to review and submit the form manually.',
            steps: [
              'Visit the website to see the form',
              'Use Universal automation if you need to fill it again',
              'Or manually fill the form with your project data'
            ]
          },
          debug: {
            projectData: projectData,
            fillResult: fillResult,
            originalUrl: url,
            finalUrl: currentUrl
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (automationError) {
      console.error('❌ Automation error:', automationError);
      
      // Try to close browser if it's still open
      try {
        await automationService.close();
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError);
      }
      
      return res.status(500).json({
        success: false,
        error: 'AUTOMATION_FAILED',
        message: automationError.message || 'Automation failed. Please try again.'
      });
    }

  } catch (error) {
    console.error('❌ Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'CONTROLLER_ERROR',
      message: 'Internal server error. Please try again.'
    });
  }
};

module.exports = { openAndUltraFill }; 