// Mock implementation for deployment (puppeteer removed)
const competitorAnalyzer = async (projectId, competitorUrl) => {
  try {
    // Mock implementation for deployment
    return {
      success: true,
      competitor: competitorUrl,
      analysis: {
        title: 'Sample Competitor Title',
        description: 'Sample competitor description',
        keywords: ['sample', 'competitor', 'keywords'],
        score: Math.floor(Math.random() * 30) + 70
      },
      message: 'Competitor analysis completed (mock data for deployment)'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Competitor analysis failed'
    };
  }
};

module.exports = competitorAnalyzer;
