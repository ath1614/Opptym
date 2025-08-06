import React, { useEffect, useState } from 'react';
import { getProjects, runMetaTagAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { FileText, CheckCircle, XCircle, AlertTriangle, Edit3, Target, TrendingUp } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const MetaAnalyzer = () => {
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
      const res = await runMetaTagAnalyzer(selectedProjectId);
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
        label: 'Title Length',
        value: `${report.titleLength || 0} chars`,
        status: ((report.titleLength || 0) >= 30 && (report.titleLength || 0) <= 70 ? 'good' : 'warning') as 'good' | 'warning',
        icon: <FileText className="w-4 h-4" />
      },
      {
        label: 'Description Length',
        value: `${report.descriptionLength || 0} chars`,
        status: ((report.descriptionLength || 0) >= 50 && (report.descriptionLength || 0) <= 160 ? 'good' : 'warning') as 'good' | 'warning',
        icon: <FileText className="w-4 h-4" />
      },
      {
        label: 'Keywords Found',
        value: report.keywords?.length || 0,
        status: ((report.keywords?.length || 0) > 0 ? 'good' : 'warning') as 'good' | 'warning',
        icon: <FileText className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    return [
      {
        label: 'Meta Title Present',
        value: !!(report.titleLength && report.titleLength > 0),
        status: (report.titleLength && report.titleLength > 0 ? 'good' : 'error') as 'good' | 'error'
      },
      {
        label: 'Meta Description Present',
        value: !!(report.descriptionLength && report.descriptionLength > 0),
        status: (report.descriptionLength && report.descriptionLength > 0 ? 'good' : 'error') as 'good' | 'error'
      },
      {
        label: 'Keywords Present',
        value: !!(report.keywords && report.keywords.length > 0),
        status: (report.keywords && report.keywords.length > 0 ? 'good' : 'warning') as 'good' | 'warning'
      },
      {
        label: 'Title Length Optimal',
        value: ((report.titleLength || 0) >= 30 && (report.titleLength || 0) <= 70),
        status: ((report.titleLength || 0) >= 30 && (report.titleLength || 0) <= 70 ? 'good' : 'warning') as 'good' | 'warning'
      },
      {
        label: 'Description Length Optimal',
        value: ((report.descriptionLength || 0) >= 50 && (report.descriptionLength || 0) <= 160),
        status: ((report.descriptionLength || 0) >= 50 && (report.descriptionLength || 0) <= 160 ? 'good' : 'warning') as 'good' | 'warning'
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];

    // Title optimization guide
    if ((report.titleLength || 0) < 30 || (report.titleLength || 0) > 70) {
      guides.push({
        title: 'Optimize Meta Title',
        description: 'Your meta title needs optimization for better search visibility and click-through rates.',
        icon: <Edit3 className="w-4 h-4" />,
        steps: [
          'Keep title between 30-70 characters for optimal display',
          'Include your primary keyword near the beginning',
          'Make it compelling and click-worthy',
          'Avoid keyword stuffing - focus on user intent',
          'Include your brand name if space allows'
        ]
      });
    }

    // Description optimization guide
    if ((report.descriptionLength || 0) < 50 || (report.descriptionLength || 0) > 160) {
      guides.push({
        title: 'Optimize Meta Description',
        description: 'Your meta description needs improvement to increase click-through rates from search results.',
        icon: <Target className="w-4 h-4" />,
        steps: [
          'Keep description between 50-160 characters',
          'Include your primary keyword naturally',
          'Write compelling, action-oriented copy',
          'Include a clear value proposition',
          'Add a call-to-action if appropriate'
        ]
      });
    }

    // Keywords guide
    if (!report.keywords || report.keywords.length === 0) {
      guides.push({
        title: 'Add Target Keywords',
        description: 'Your page lacks target keywords which are essential for SEO optimization.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Research relevant keywords for your content',
          'Include primary and secondary keywords',
          'Use long-tail keywords for better targeting',
          'Ensure keywords match user search intent',
          'Update keywords regularly based on performance'
        ]
      });
    }

    // General meta tag guide
    guides.push({
      title: 'Meta Tag Best Practices',
      description: 'Follow these best practices to maximize your meta tag effectiveness.',
      icon: <FileText className="w-4 h-4" />,
      steps: [
        'Write unique titles and descriptions for each page',
        'Include your target keyword in both title and description',
        'Make meta descriptions compelling and informative',
        'Use action words and emotional triggers',
        'Test different variations to improve CTR'
      ]
    });

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Meta Tag Analyzer</h3>
        <p className="text-gray-600 mb-6">Analyze your site's meta title, description, and keywords for SEO optimization.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Run Meta Analysis</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Meta Tag Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<FileText className="w-6 h-6 text-purple-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default MetaAnalyzer;