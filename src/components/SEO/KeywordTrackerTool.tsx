import React, { useEffect, useState } from 'react';
import { getProjects, runKeywordTracker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Search, TrendingUp, TrendingDown, Target, BarChart3, Lightbulb, Award } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const KeywordTrackerTool = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleRunAnalyzer = async () => {
    if (!selectedProjectId) {
      alert('Please select a project');
      return;
    }

    setLoading(true);
    try {
      const res = await runKeywordTracker(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.results) return [];
    
    const foundKeywords = report.results.filter((r: any) => r.found).length;
    const totalKeywords = report.results.length;
    
    return [
      {
        label: 'Keywords Tracked',
        value: totalKeywords,
        status: 'good' as const,
        icon: <Search className="w-4 h-4" />
      },
      {
        label: 'Keywords Found',
        value: foundKeywords,
        status: foundKeywords > 0 ? 'good' as const : 'warning' as const,
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        label: 'Success Rate',
        value: totalKeywords > 0 ? `${((foundKeywords / totalKeywords) * 100).toFixed(1)}%` : '0%',
        status: (foundKeywords / totalKeywords) > 0.5 ? 'good' as const : 'warning' as const,
        icon: <TrendingDown className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.results) return [];
    
    return report.results.map((result: any, index: number) => ({
      label: `"${result.keyword}"`,
      value: result.found ? `Position: ${result.position}` : 'Not in top 10',
      status: result.found ? 'good' as const : 'warning' as const
    }));
  };

  const getImprovementGuide = () => {
    if (!report?.results) return [];

    const guides = [];
    const foundKeywords = report.results.filter((r: any) => r.found).length;
    const totalKeywords = report.results.length;
    const successRate = totalKeywords > 0 ? (foundKeywords / totalKeywords) : 0;
    const top3Keywords = report.results.filter((r: any) => r.found && r.position <= 3).length;

    // Low success rate guide
    if (successRate < 0.3) {
      guides.push({
        title: 'Improve Keyword Targeting',
        description: 'Your keywords are not ranking well. Focus on better keyword selection and optimization.',
        icon: <Target className="w-4 h-4" />,
        steps: [
          'Research long-tail keywords with lower competition',
          'Optimize your content for specific keyword intent',
          'Improve on-page SEO elements (title, meta description, headings)',
          'Create more comprehensive content around your target keywords',
          'Build internal links to pages targeting these keywords'
        ]
      });
    }

    // No top 3 rankings guide
    if (top3Keywords === 0) {
      guides.push({
        title: 'Target Top 3 Positions',
        description: 'Getting into the top 3 positions will significantly increase your click-through rates.',
        icon: <Award className="w-4 h-4" />,
        steps: [
          'Focus on user experience and page load speed',
          'Create content that answers user queries better than competitors',
          'Build high-quality backlinks from authoritative sources',
          'Optimize for featured snippets and rich results',
          'Improve your site\'s overall domain authority'
        ]
      });
    }

    // Content optimization guide
    guides.push({
      title: 'Optimize Content for Target Keywords',
      description: 'Improve your content to better match search intent and user expectations.',
      icon: <Lightbulb className="w-4 h-4" />,
      steps: [
        'Include target keywords naturally in your content',
        'Use related keywords and synonyms throughout your content',
        'Create comprehensive, in-depth content that covers the topic thoroughly',
        'Optimize your content structure with proper headings (H1, H2, H3)',
        'Include relevant images with optimized alt text'
      ]
    });

    // Technical SEO guide
    guides.push({
      title: 'Improve Technical SEO Factors',
      description: 'Technical SEO improvements can help your pages rank better.',
      icon: <BarChart3 className="w-4 h-4" />,
      steps: [
        'Improve page load speed and Core Web Vitals',
        'Ensure your site is mobile-friendly',
        'Fix any crawl errors and broken links',
        'Optimize your site structure and internal linking',
        'Submit your sitemap to Google Search Console'
      ]
    });

    // Advanced ranking guide for good performance
    if (successRate >= 0.7 && top3Keywords > 0) {
      guides.push({
        title: 'Maintain and Improve Rankings',
        description: 'Your keyword performance is good. Focus on maintaining and improving your positions.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Monitor your rankings regularly for any drops',
          'Update your content to keep it fresh and relevant',
          'Continue building quality backlinks',
          'Expand your keyword portfolio with related terms',
          'Track and optimize for featured snippets'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Keyword Tracker</h3>
        <p className="text-gray-600 mb-6">Check where your domain ranks for target keywords in Google search results.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Choose a project to analyze</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAnalyzer}
            disabled={loading || !selectedProjectId}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !selectedProjectId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Tracking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Track Keywords</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Keyword Tracking Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Search className="w-6 h-6 text-teal-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default KeywordTrackerTool;
