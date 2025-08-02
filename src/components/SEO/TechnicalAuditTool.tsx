import React, { useEffect, useState } from 'react';
import { getProjects, runTechnicalSeoAuditor } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Bug, CheckCircle, AlertTriangle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const TechnicalAuditTool = () => {
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
      const res = await runTechnicalSeoAuditor(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report) return [];
    
    const issues = report.issues || [];
    const criticalIssues = issues.filter((issue: any) => issue.severity === 'critical').length;
    const warnings = issues.filter((issue: any) => issue.severity === 'warning').length;
    
    return [
      {
        label: 'Total Issues Found',
        value: issues.length,
        status: issues.length === 0 ? 'good' as const : 'warning' as const,
        icon: <Bug className="w-4 h-4" />
      },
      {
        label: 'Critical Issues',
        value: criticalIssues,
        status: criticalIssues === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        label: 'Warnings',
        value: warnings,
        status: warnings === 0 ? 'good' as const : 'warning' as const,
        icon: <CheckCircle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.issues) return [];
    
    return report.issues.map((issue: any, index: number) => ({
      label: issue.title || `Issue ${index + 1}`,
      value: issue.description || 'No description',
      status: issue.severity === 'critical' ? 'error' as const : 'warning' as const
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Technical SEO Auditor</h3>
        <p className="text-gray-600 mb-6">Check for common page-level SEO issues and technical problems.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
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
                : 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Auditing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Bug className="w-5 h-5" />
                <span>Run Technical Audit</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Technical SEO Audit Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Bug className="w-6 h-6 text-gray-700" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default TechnicalAuditTool;
