import React, { useEffect, useState } from 'react';
import { getProjects, runSitemapRobotsChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { BookOpenText, CheckCircle, XCircle } from 'lucide-react';

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
        icon: <BookOpenText className="w-4 h-4" />
      },
      {
        label: 'Robots.txt Status',
        value: report.robotsStatus || 'Not Found',
        status: report.robotsStatus === 'Found' ? 'good' as const : 'error' as const,
        icon: <BookOpenText className="w-4 h-4" />
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
                <BookOpenText className="w-5 h-5" />
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
          icon={<BookOpenText className="w-6 h-6 text-indigo-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default SitemapRobotsTool;
