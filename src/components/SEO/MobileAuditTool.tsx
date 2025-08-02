import React, { useEffect, useState } from 'react';
import { getProjects, runMobileAuditChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Smartphone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const MobileAuditTool = () => {
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
      const res = await runMobileAuditChecker(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.audit) return [];
    
    return [
      {
        label: 'Mobile Friendly',
        value: report.audit.isMobileFriendly ? 'Yes' : 'No',
        status: report.audit.isMobileFriendly ? 'good' as const : 'error' as const,
        icon: <Smartphone className="w-4 h-4" />
      },
      {
        label: 'Viewport Meta Tag',
        value: report.audit.hasViewportMeta ? 'Present' : 'Missing',
        status: report.audit.hasViewportMeta ? 'good' as const : 'error' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Small Tap Targets',
        value: report.audit.smallTapTargets,
        status: report.audit.smallTapTargets === 0 ? 'good' as const : 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.audit) return [];
    
    return [
      {
        label: 'Viewport Meta Tag',
        value: report.audit.hasViewportMeta,
        status: report.audit.hasViewportMeta ? 'good' as const : 'error' as const
      },
      {
        label: 'Font Size OK',
        value: report.audit.fontSizeOk,
        status: report.audit.fontSizeOk ? 'good' as const : 'warning' as const
      },
      {
        label: 'No Small Tap Targets',
        value: report.audit.smallTapTargets === 0,
        status: report.audit.smallTapTargets === 0 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Overall Mobile Score',
        value: report.audit.isMobileFriendly ? 'Excellent' : 'Needs Improvement',
        status: report.audit.isMobileFriendly ? 'good' as const : 'error' as const
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Mobile Audit Checker</h3>
        <p className="text-gray-600 mb-6">Check responsive design and tap usability for mobile devices.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                : 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Run Mobile Audit</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Mobile Audit Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Smartphone className="w-6 h-6 text-pink-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default MobileAuditTool;