import React, { useEffect, useState } from 'react';
import { getProjects, runBrokenLinkChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Link, AlertTriangle, CheckCircle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const BrokenLinkTool = () => {
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
      const res = await runBrokenLinkChecker(selectedProjectId);
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
        label: 'Total Links Checked',
        value: report.totalLinks || 0,
        status: 'good' as const,
        icon: <Link className="w-4 h-4" />
      },
      {
        label: 'Broken Links Found',
        value: report.brokenLinks?.length || 0,
        status: (report.brokenLinks?.length || 0) === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        label: 'Success Rate',
        value: report.totalLinks > 0 ? `${(((report.totalLinks - (report.brokenLinks?.length || 0)) / report.totalLinks) * 100).toFixed(1)}%` : '100%',
        status: (report.brokenLinks?.length || 0) === 0 ? 'good' as const : 'warning' as const,
        icon: <CheckCircle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.brokenLinks) return [];
    
    return report.brokenLinks.map((link: any, index: number) => ({
      label: `Broken Link ${index + 1}`,
      value: link.url,
      status: 'error' as const
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Broken Link Scanner</h3>
        <p className="text-gray-600 mb-6">Identify dead outbound links on your site that may hurt SEO performance.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Link className="w-5 h-5" />
                <span>Scan for Broken Links</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Broken Link Scan Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Link className="w-6 h-6 text-red-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default BrokenLinkTool;
