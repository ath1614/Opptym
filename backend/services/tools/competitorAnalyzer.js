// Enhanced mock implementation with realistic competitor data
const competitorAnalyzer = async (projectId, competitorUrl) => {
  try {
    // Get project data to use real keywords
    const Project = require('../../models/projectModel');
    const project = await Project.findById(projectId);
    
    // Use project keywords or fallback to common SEO keywords
    const keywords = project?.targetKeywords || ['seo tools', 'keyword research', 'website optimization'];
    
    // Generate realistic competitor data based on keywords
    const generateCompetitors = (keyword) => {
      const competitorTemplates = [
        {
          domain: 'semrush.com',
          title: `Best ${keyword} Tools and Strategies`,
          url: `https://semrush.com/blog/${keyword.replace(/\s+/g, '-')}`,
          score: Math.floor(Math.random() * 20) + 80,
          description: `Comprehensive guide to ${keyword} with expert insights and tools`,
          traffic: Math.floor(Math.random() * 50000) + 100000,
          backlinks: Math.floor(Math.random() * 10000) + 5000
        },
        {
          domain: 'ahrefs.com',
          title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Guide for Beginners`,
          url: `https://ahrefs.com/blog/${keyword.replace(/\s+/g, '-')}`,
          score: Math.floor(Math.random() * 20) + 75,
          description: `Learn ${keyword} from industry experts with practical examples`,
          traffic: Math.floor(Math.random() * 40000) + 80000,
          backlinks: Math.floor(Math.random() * 8000) + 4000
        },
        {
          domain: 'moz.com',
          title: `Complete ${keyword} Tutorial`,
          url: `https://moz.com/learn/${keyword.replace(/\s+/g, '-')}`,
          score: Math.floor(Math.random() * 20) + 70,
          description: `Step-by-step ${keyword} tutorial with actionable tips`,
          traffic: Math.floor(Math.random() * 30000) + 60000,
          backlinks: Math.floor(Math.random() * 6000) + 3000
        },
        {
          domain: 'searchengineland.com',
          title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Latest Trends and Updates`,
          url: `https://searchengineland.com/${keyword.replace(/\s+/g, '-')}`,
          score: Math.floor(Math.random() * 20) + 65,
          description: `Stay updated with the latest ${keyword} trends and news`,
          traffic: Math.floor(Math.random() * 25000) + 50000,
          backlinks: Math.floor(Math.random() * 5000) + 2500
        },
        {
          domain: 'backlinko.com',
          title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Case Study`,
          url: `https://backlinko.com/${keyword.replace(/\s+/g, '-')}-case-study`,
          score: Math.floor(Math.random() * 20) + 60,
          description: `Real-world ${keyword} case study with proven results`,
          traffic: Math.floor(Math.random() * 20000) + 40000,
          backlinks: Math.floor(Math.random() * 4000) + 2000
        }
      ];
      
      // Return 3-5 random competitors
      const numCompetitors = Math.floor(Math.random() * 3) + 3;
      return competitorTemplates.slice(0, numCompetitors);
    };

    const mockResults = keywords.map(keyword => ({
      keyword,
      competitors: generateCompetitors(keyword),
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      competition: Math.random() > 0.5 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
      cpc: (Math.random() * 5 + 0.5).toFixed(2)
    }));

    const totalCompetitors = mockResults.reduce((acc, result) => acc + result.competitors.length, 0);
    const allScores = mockResults.flatMap(result => result.competitors.map(comp => comp.score));
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    return {
      success: true,
      results: mockResults,
      audit: {
        totalKeywords: mockResults.length,
        totalCompetitors,
        averageScore: Math.round(averageScore),
        highCompetitionKeywords: mockResults.filter(r => r.competition === 'High').length,
        mediumCompetitionKeywords: mockResults.filter(r => r.competition === 'Medium').length,
        lowCompetitionKeywords: mockResults.filter(r => r.competition === 'Low').length
      },
      suggestions: [
        'Focus on low-competition keywords to gain quick wins',
        'Analyze high-performing competitor content for inspiration',
        'Create more comprehensive content than your competitors',
        'Build quality backlinks to compete with established players',
        'Monitor competitor keyword rankings and content updates'
      ],
      message: 'Competitor analysis completed successfully'
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
