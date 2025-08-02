import React, { useEffect, useState } from 'react';
import { getProjects, runMetaTagAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
      }
    ];
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
        />
      )}
    </div>
  );
};

export default MetaAnalyzer;