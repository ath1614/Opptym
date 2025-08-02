import React, { useEffect, useState } from 'react';
import { getProjects, runSeoScoreCalculator } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { BarChart, TrendingUp, Award } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const SeoScoreCalculator = () => {
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
      const res = await runSeoScoreCalculator(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report) return [];
    
    const score = report.total || 0;
    const getScoreStatus = (score: number) => {
      if (score >= 80) return 'good' as const;
      if (score >= 60) return 'warning' as const;
      return 'error' as const;
    };
    
    return [
      {
        label: 'Overall SEO Score',
        value: `${score}/100`,
        status: getScoreStatus(score),
        icon: <Award className="w-4 h-4" />
      },
      {
        label: 'Score Grade',
        value: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        status: getScoreStatus(score),
        icon: <BarChart className="w-4 h-4" />
      },
      {
        label: 'Areas Analyzed',
        value: report.breakdown ? Object.keys(report.breakdown).length : 0,
        status: 'good' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.breakdown) return [];
    
    const details: any[] = [];
    
    Object.entries(report.breakdown).forEach(([area, score]) => {
      const scoreNum = typeof score === 'number' ? score : 0;
      details.push({
        label: `${area.charAt(0).toUpperCase() + area.slice(1)}`,
        value: `${scoreNum}/10`,
        status: scoreNum >= 7 ? 'good' as const : scoreNum >= 5 ? 'warning' as const : 'error' as const
      });
    });
    
    return details;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">SEO Score Calculator</h3>
        <p className="text-gray-600 mb-6">Get a comprehensive SEO score with detailed breakdown across all optimization areas.</p>

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
                <span>Calculating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <BarChart className="w-5 h-5" />
                <span>Calculate SEO Score</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="SEO Score Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<BarChart className="w-6 h-6 text-indigo-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default SeoScoreCalculator; 