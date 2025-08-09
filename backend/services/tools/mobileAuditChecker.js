// Mock implementation for deployment (puppeteer removed)
const mobileAuditChecker = async (projectId) => {
  try {
    // Mock implementation for deployment
    const isMobileFriendly = Math.random() > 0.3;
    const hasViewportMeta = Math.random() > 0.2;
    const smallTapTargets = Math.floor(Math.random() * 5);
    const fontSizeOk = Math.random() > 0.4;

    return {
      success: true,
      audit: {
        isMobileFriendly,
        hasViewportMeta,
        smallTapTargets,
        fontSizeOk,
        score: Math.floor(Math.random() * 30) + 70,
        issues: smallTapTargets > 0 ? [`Found ${smallTapTargets} small tap targets`] : [],
        viewportWidth: 'device-width',
        initialScale: '1.0'
      },
      suggestions: [
        isMobileFriendly ? 'Your site is mobile-friendly!' : 'Optimize your site for mobile devices',
        hasViewportMeta ? 'Viewport meta tag is properly configured' : 'Add viewport meta tag for mobile optimization',
        smallTapTargets === 0 ? 'All tap targets meet size requirements' : `Fix ${smallTapTargets} small tap targets`,
        fontSizeOk ? 'Font sizes are appropriate for mobile' : 'Increase font sizes for better mobile readability'
      ],
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
