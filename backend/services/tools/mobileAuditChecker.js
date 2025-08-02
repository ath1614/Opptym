// Mock implementation for deployment (puppeteer removed)
const mobileAuditChecker = async (projectId) => {
  try {
    // Mock implementation for deployment
    return {
      success: true,
      mobileFriendly: true,
      score: Math.floor(Math.random() * 30) + 70,
      issues: [],
      message: 'Mobile audit completed (mock data for deployment)'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Mobile audit failed'
    };
  }
};

module.exports = mobileAuditChecker;
