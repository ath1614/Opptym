// Mock implementation for deployment (puppeteer removed)
const keywordRankChecker = async (projectId, keyword) => {
  try {
    // Mock implementation for deployment
    return {
      success: true,
      keyword: keyword,
      rank: Math.floor(Math.random() * 100) + 1,
      url: 'https://example.com',
      message: 'Keyword rank check completed (mock data for deployment)'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Keyword rank check failed'
    };
  }
};

module.exports = keywordRankChecker;
