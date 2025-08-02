import React, { useEffect, useState } from 'react';
import { getProjects, runBacklinkScanner } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Link, ExternalLink, TrendingUp } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const BacklinkTool = () => {
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
      const res = await runBacklinkScanner(selectedProjectId);
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
        label: 'Total Backlinks Found',
        value: report.backlinks?.length || 0,
        status: 'good' as const,
        icon: <Link className="w-4 h-4" />
      },
      {
        label: 'Unique Domains',
        value: report.uniqueDomains || 0,
        status: 'good' as const,
        icon: <ExternalLink className="w-4 h-4" />
      },
      {
        label: 'Average Domain Authority',
        value: report.avgDomainAuthority ? `${report.avgDomainAuthority.toFixed(1)}/100` : 'N/A',
        status: 'good' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.backlinks) return [];
    
    return report.backlinks.slice(0, 10).map((backlink: any, index: number) => ({
      label: `Backlink ${index + 1}`,
      value: backlink.url,
      status: 'good' as const
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Backlink Scanner</h3>
        <p className="text-gray-600 mb-6">Check external domains linking to your page to understand your link profile.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
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
                <span>Scan Backlinks</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Backlink Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Link className="w-6 h-6 text-blue-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default BacklinkTool;
