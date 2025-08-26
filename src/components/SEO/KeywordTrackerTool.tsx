import React, { useEffect, useState } from 'react';
import { getProjects, runKeywordTracker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Search, TrendingUp, TrendingDown, Target, BarChart3, Lightbulb, Award } from 'lucide-react';
import { showPopup } from '../../utils/popup';

type Project = {
  _id: string;
  title: string;
};

type KeywordResult = {
  keyword: string;
  found: boolean;
  rank?: number;
  position?: number;
  url?: string;
  page?: number;
};

type KeywordReport = {
  success: boolean;
  results: KeywordResult[];
  audit?: {
    totalKeywords: number;
    foundKeywords: number;
    averageRank: number;
  };
  suggestions?: string[];
  message?: string;
  error?: string;
};

const KeywordTrackerTool = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [report, setReport] = useState<KeywordReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        showPopup('Failed to load projects', 'error');
      }
    };
    fetchProjects();
  }, []);

  const handleRunAnalyzer = async () => {
    if (!selectedProjectId) {
      showPopup('Please select a project', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await runKeywordTracker(selectedProjectId);
      console.log('🔍 Keyword Tracker Response:', res);
      
      // Validate response structure
      if (!res || typeof res !== 'object') {
        throw new Error('Invalid response format');
      }

      // Ensure results is an array
      const validatedResults = Array.isArray(res.results) ? res.results : [];
      
      // Normalize the data structure
      const normalizedResults = validatedResults.map((result: any): KeywordResult => ({
        keyword: result.keyword || 'Unknown',
        found: Boolean(result.found),
        rank: typeof result.rank === 'number' ? result.rank : undefined,
        position: typeof result.position === 'number' ? result.position : undefined,
        url: result.url || undefined,
        page: typeof result.page === 'number' ? result.page : undefined
      }));

      const normalizedReport: KeywordReport = {
        success: Boolean(res.success),
        results: normalizedResults,
        audit: res.audit || {
          totalKeywords: normalizedResults.length,
          foundKeywords: normalizedResults.filter((r: KeywordResult) => r.found).length,
          averageRank: 0
        },
        suggestions: Array.isArray(res.suggestions) ? res.suggestions : [],
        message: res.message || 'Keyword tracking completed',
        error: res.error
      };

      setReport(normalizedReport);
      
      if (normalizedReport.success) {
        showPopup('Keyword tracking completed successfully', 'success');
      } else {
        showPopup(normalizedReport.error || 'Keyword tracking failed', 'error');
      }
    } catch (err) {
      console.error('Analyzer failed:', err);
      showPopup('Failed to run keyword tracker', 'error');
      setReport({
        success: false,
        results: [],
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.results) return [];
    
    const results = report.results;
    const foundKeywords = results.filter((r: KeywordResult) => r.found).length;
    const totalKeywords = results.length;
    const successRate = totalKeywords > 0 ? (foundKeywords / totalKeywords) * 100 : 0;
    
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
        value: `${successRate.toFixed(1)}%`,
        status: successRate > 50 ? 'good' as const : 'warning' as const,
        icon: <TrendingDown className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.results) return [];
    
    const results = report.results;
    
    const details: Array<{
      label: string;
      value: string | number;
      status: 'good' | 'warning' | 'error';
    }> = [
      {
        label: 'Total Keywords Analyzed',
        value: results.length,
        status: 'good'
      },
      {
        label: 'Keywords in Top 10',
        value: results.filter((r: KeywordResult) => r.found && r.position && r.position <= 10).length,
        status: 'good'
      },
      {
        label: 'Keywords in Top 3',
        value: results.filter((r: KeywordResult) => r.found && r.position && r.position <= 3).length,
        status: 'good'
      }
    ];

    // Add individual keyword results
    results.forEach((result, index) => {
      let value = 'Not found';
      let status: 'good' | 'warning' = 'warning';
      
      if (result.found) {
        if (result.position) {
          value = `Position: ${result.position}`;
          status = result.position <= 3 ? 'good' : 'warning';
        } else if (result.rank) {
          value = `Rank: ${result.rank}`;
          status = result.rank <= 3 ? 'good' : 'warning';
        } else {
          value = 'Found (position unknown)';
          status = 'good';
        }
      }
      
      details.push({
        label: `"${result.keyword}"`,
        value,
        status: status as 'good' | 'warning' | 'error'
      });
    });
    
    return details;
  };

  const getImprovementGuide = () => {
    if (!report?.results) return [];

    const guides = [];
    const results = report.results;
    const foundKeywords = results.filter((r: KeywordResult) => r.found).length;
    const totalKeywords = results.length;
    const successRate = totalKeywords > 0 ? (foundKeywords / totalKeywords) : 0;
    const top3Keywords = results.filter((r: KeywordResult) => r.found && r.position && r.position <= 3).length;

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
      <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Keyword Tracker</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Check where your domain ranks for target keywords in Google search results.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Project</label>
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
