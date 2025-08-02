import React, { useEffect, useState } from 'react';
import { getProjects, runPageSpeedAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const PageSpeedTool = () => {
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
      const res = await runPageSpeedAnalyzer(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.metrics) return [];
    
    const loadTime = parseInt(report.metrics.loadTime);
    const ttfb = parseInt(report.metrics.ttfb);
    const domContentLoaded = parseInt(report.metrics.domContentLoaded);
    
    return [
      {
        label: 'Load Time',
        value: report.metrics.loadTime,
        status: loadTime < 2000 ? 'good' as const : loadTime < 4000 ? 'warning' as const : 'error' as const,
        icon: <Clock className="w-4 h-4" />
      },
      {
        label: 'Time to First Byte',
        value: report.metrics.ttfb,
        status: ttfb < 200 ? 'good' as const : ttfb < 600 ? 'warning' as const : 'error' as const,
        icon: <Zap className="w-4 h-4" />
      },
      {
        label: 'DOM Content Loaded',
        value: report.metrics.domContentLoaded,
        status: domContentLoaded < 1500 ? 'good' as const : domContentLoaded < 3000 ? 'warning' as const : 'error' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.metrics) return [];
    
    const loadTime = parseInt(report.metrics.loadTime);
    const ttfb = parseInt(report.metrics.ttfb);
    const domContentLoaded = parseInt(report.metrics.domContentLoaded);
    const totalTime = parseInt(report.metrics.totalTime);
    
    return [
      {
        label: 'Total Page Load Time',
        value: report.metrics.totalTime,
        status: totalTime < 3000 ? 'good' as const : totalTime < 5000 ? 'warning' as const : 'error' as const
      },
      {
        label: 'Fast Load Time (< 2s)',
        value: loadTime < 2000,
        status: loadTime < 2000 ? 'good' as const : 'error' as const
      },
      {
        label: 'Fast TTFB (< 200ms)',
        value: ttfb < 200,
        status: ttfb < 200 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Fast DOM Ready (< 1.5s)',
        value: domContentLoaded < 1500,
        status: domContentLoaded < 1500 ? 'good' as const : 'warning' as const
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Page Speed Analyzer</h3>
        <p className="text-gray-600 mb-6">Evaluate loading performance and timing metrics for optimal user experience.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Run Speed Analysis</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Page Speed Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Zap className="w-6 h-6 text-yellow-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default PageSpeedTool;