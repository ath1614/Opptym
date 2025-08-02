// Mock implementation for deployment (puppeteer removed)
const pageSpeedAnalyzer = async (projectId) => {
  try {
    // Mock implementation for deployment
    return {
      success: true,
      score: Math.floor(Math.random() * 30) + 70,
      metrics: {
        firstContentfulPaint: Math.floor(Math.random() * 2000) + 1000,
        largestContentfulPaint: Math.floor(Math.random() * 3000) + 2000,
        cumulativeLayoutShift: Math.random() * 0.1
      },
      message: 'Page speed analysis completed (mock data for deployment)'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Page speed analysis failed'
    };
  }
};

module.exports = pageSpeedAnalyzer;
