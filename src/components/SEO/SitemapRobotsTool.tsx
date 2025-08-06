import React, { useEffect, useState } from 'react';
import { getProjects, runSitemapRobotsChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { BookOpen, CheckCircle, XCircle, FileText, Settings, AlertTriangle, Globe } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const SitemapRobotsTool = () => {
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
      const res = await runSitemapRobotsChecker(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report) return [];
    
    return [
      {
        label: 'Sitemap Status',
        value: report.sitemapStatus || 'Not Found',
        status: report.sitemapStatus === 'Found' ? 'good' as const : 'error' as const,
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        label: 'Robots.txt Status',
        value: report.robotsStatus || 'Not Found',
        status: report.robotsStatus === 'Found' ? 'good' as const : 'error' as const,
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        label: 'Crawl Rules',
        value: report.crawlRules?.length || 0,
        status: 'good' as const,
        icon: <CheckCircle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    const details: any[] = [];
    
    if (report.sitemapStatus) {
      details.push({
        label: 'Sitemap Present',
        value: report.sitemapStatus === 'Found',
        status: report.sitemapStatus === 'Found' ? 'good' as const : 'error' as const
      });
    }
    
    if (report.robotsStatus) {
      details.push({
        label: 'Robots.txt Present',
        value: report.robotsStatus === 'Found',
        status: report.robotsStatus === 'Found' ? 'good' as const : 'error' as const
      });
    }
    
    if (report.crawlRules) {
      report.crawlRules.forEach((rule: string, index: number) => {
        details.push({
          label: `Crawl Rule ${index + 1}`,
          value: rule,
          status: 'good' as const
        });
      });
    }
    
    return details;
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];

    // Sitemap optimization guide
    if (report.sitemapStatus !== 'Found') {
      guides.push({
        title: 'Create XML Sitemap',
        description: 'An XML sitemap helps search engines discover and index your pages efficiently.',
        icon: <FileText className="w-4 h-4" />,
        steps: [
          'Generate an XML sitemap for your website',
          'Include all important pages in your sitemap',
          'Submit your sitemap to Google Search Console',
          'Keep your sitemap updated when you add new pages',
          'Ensure your sitemap follows XML sitemap protocol'
        ]
      });
    }

    // Robots.txt optimization guide
    if (report.robotsStatus !== 'Found') {
      guides.push({
        title: 'Create Robots.txt File',
        description: 'A robots.txt file tells search engines which pages they can and cannot crawl.',
        icon: <Settings className="w-4 h-4" />,
        steps: [
          'Create a robots.txt file in your root directory',
          'Allow crawling of important pages',
          'Disallow crawling of admin, private, or duplicate pages',
          'Specify the location of your XML sitemap',
          'Test your robots.txt with Google Search Console'
        ]
      });
    }

    // General SEO optimization guide
    guides.push({
      title: 'Optimize for Search Engine Crawling',
      description: 'Improve how search engines discover and understand your website.',
      icon: <Globe className="w-4 h-4" />,
      steps: [
        'Ensure your website has a clear site structure',
        'Use descriptive URLs for all pages',
        'Create internal links between related pages',
        'Optimize page load speed for better crawling',
        'Monitor crawl errors in Google Search Console'
      ]
    });

    // Advanced sitemap guide
    if (report.sitemapStatus === 'Found') {
      guides.push({
        title: 'Enhance Your Sitemap',
        description: 'Take your sitemap to the next level with advanced features.',
        icon: <BookOpen className="w-4 h-4" />,
        steps: [
          'Add lastmod dates to show when pages were updated',
          'Include priority values for important pages',
          'Create separate sitemaps for different content types',
          'Use sitemap index files for large websites',
          'Submit sitemap updates when content changes'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sitemap & Robots Checker</h3>
        <p className="text-gray-600 mb-6">Parse crawl rules and sitemap status for better search engine indexing.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Check Sitemap & Robots</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Sitemap & Robots Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default SitemapRobotsTool;
