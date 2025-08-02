import React, { useEffect, useState } from 'react';
import { getProjects, runSchemaValidatorTool } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Code, CheckCircle, AlertTriangle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const SchemaValidatorTool = () => {
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
      const res = await runSchemaValidatorTool(selectedProjectId);
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
        label: 'Schema Types Found',
        value: report.schemaTypes?.length || 0,
        status: (report.schemaTypes?.length || 0) > 0 ? 'good' as const : 'warning' as const,
        icon: <Code className="w-4 h-4" />
      },
      {
        label: 'Valid Schemas',
        value: report.validSchemas?.length || 0,
        status: 'good' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Validation Errors',
        value: report.errors?.length || 0,
        status: (report.errors?.length || 0) === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    const details: any[] = [];
    
    if (report.schemaTypes) {
      report.schemaTypes.forEach((type: string, index: number) => {
        details.push({
          label: `Schema Type ${index + 1}`,
          value: type,
          status: 'good' as const
        });
      });
    }
    
    if (report.errors) {
      report.errors.forEach((error: string, index: number) => {
        details.push({
          label: `Error ${index + 1}`,
          value: error,
          status: 'error' as const
        });
      });
    }
    
    return details;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Schema Validator</h3>
        <p className="text-gray-600 mb-6">Check structured data for rich result compatibility and validation.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
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
                : 'bg-purple-700 text-white hover:bg-purple-800 focus:ring-2 focus:ring-purple-700 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Validating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Validate Schema</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Schema Validation Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Code className="w-6 h-6 text-purple-700" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default SchemaValidatorTool;
