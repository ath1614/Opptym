import React, { useState, useEffect } from 'react';
import { getProjects } from '../../services/projectService';
import { runMetaTagAnalyzer } from '../../services/seoService';
import { FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  url: string;
}

interface MetaReport {
  url: string;
  title: {
    present: boolean;
    content: string;
    length: number;
    optimal: boolean;
  };
  description: {
    present: boolean;
    content: string;
    length: number;
    optimal: boolean;
  };
  keywords: {
    present: boolean;
    content: string;
  };
  ogTags: {
    present: boolean;
    title: string;
    description: string;
    image: string;
  };
  twitterTags: {
    present: boolean;
    title: string;
    description: string;
    image: string;
  };
  recommendations: string[];
  score: number;
}

export default function MetaAnalyzer() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<MetaReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      }
    };
    fetchProjects();
  }, []);

  const handleRunAnalyzer = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const res = await runMetaTagAnalyzer(selectedProjectId);
      setReport(res);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report) return [];
    
    return [
      {
        label: 'Title Tag',
        status: report.title.present ? (report.title.optimal ? 'optimal' : 'warning') : 'error',
        value: report.title.present ? `${report.title.length} chars` : 'Missing',
        description: report.title.present 
          ? (report.title.optimal ? 'Optimal length (50-60 chars)' : 'Consider optimizing length')
          : 'Title tag is required for SEO'
      },
      {
        label: 'Meta Description',
        status: report.description.present ? (report.description.optimal ? 'optimal' : 'warning') : 'error',
        value: report.description.present ? `${report.description.length} chars` : 'Missing',
        description: report.description.present 
          ? (report.description.optimal ? 'Optimal length (150-160 chars)' : 'Consider optimizing length')
          : 'Meta description is recommended for SEO'
      },
      {
        label: 'Open Graph Tags',
        status: report.ogTags.present ? 'optimal' : 'warning',
        value: report.ogTags.present ? 'Present' : 'Missing',
        description: report.ogTags.present 
          ? 'Good for social media sharing'
          : 'Consider adding for better social sharing'
      },
      {
        label: 'Twitter Cards',
        status: report.twitterTags.present ? 'optimal' : 'warning',
        value: report.twitterTags.present ? 'Present' : 'Missing',
        description: report.twitterTags.present 
          ? 'Good for Twitter sharing'
          : 'Consider adding for better Twitter sharing'
      }
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-glass border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meta Tag Analyzer</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyze your site's meta tags for SEO optimization</p>
            </div>
          </div>
        </div>

        {/* Project Selection */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Project</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value="">-- Select a project --</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title} ({project.url})
                  </option>
                ))}
              </select>
              <button
                onClick={handleRunAnalyzer}
                disabled={!selectedProjectId || loading}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Analyze Meta Tags</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-12 text-center">
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing Meta Tags</h3>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we analyze your website's meta tags...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {report && (
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Score</h2>
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {report.score}/100
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {report.score >= 80 ? 'Excellent!' : report.score >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Meta Tag Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getMetrics().map((metric, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getStatusColor(metric.status)}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(metric.status)}
                      <h3 className="font-semibold">{metric.label}</h3>
                    </div>
                    <p className="text-sm font-medium mb-1">{metric.value}</p>
                    <p className="text-xs opacity-75">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h2>
                <ul className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Report */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Report</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Title Tag</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {report.title.content || 'Not found'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Meta Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {report.description.content || 'Not found'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
