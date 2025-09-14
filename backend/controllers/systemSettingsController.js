const SystemSettings = require('../models/systemSettingsModel');

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }
    
    // Don't send sensitive information like API keys
    const safeSettings = {
      ...settings.toObject(),
      stripeSecretKey: settings.stripeSecretKey ? '***' + settings.stripeSecretKey.slice(-4) : '',
      aiApiKey: settings.aiApiKey ? '***' + settings.aiApiKey.slice(-4) : '',
      webhookSecret: settings.webhookSecret ? '***' + settings.webhookSecret.slice(-4) : ''
    };
    
    res.json(safeSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated if they're masked
    const sensitiveFields = ['stripeSecretKey', 'aiApiKey', 'webhookSecret'];
    sensitiveFields.forEach(field => {
      if (updates[field] && updates[field].startsWith('***')) {
        delete updates[field];
      }
    });
    
    // Add metadata
    updates.lastUpdated = new Date();
    updates.updatedBy = userId;
    
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings(updates);
    } else {
      Object.assign(settings, updates);
    }
    
    await settings.save();
    
    // Return safe settings
    const safeSettings = {
      ...settings.toObject(),
      stripeSecretKey: settings.stripeSecretKey ? '***' + settings.stripeSecretKey.slice(-4) : '',
      aiApiKey: settings.aiApiKey ? '***' + settings.aiApiKey.slice(-4) : '',
      webhookSecret: settings.webhookSecret ? '***' + settings.webhookSecret.slice(-4) : ''
    };
    
    res.json({
      message: 'System settings updated successfully',
      settings: safeSettings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
};

// Reset system settings to defaults
const resetSystemSettings = async (req, res) => {
  try {
    const userId = req.userId;
    
    await SystemSettings.deleteMany({});
    
    const defaultSettings = new SystemSettings({
      lastUpdated: new Date(),
      updatedBy: userId
    });
    
    await defaultSettings.save();
    
    res.json({
      message: 'System settings reset to defaults',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting system settings:', error);
    res.status(500).json({ error: 'Failed to reset system settings' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings
};
