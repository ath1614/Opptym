import React, { useEffect, useState } from 'react';
import { getProjects, runAltTextChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Image, CheckCircle, AlertTriangle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const AltTextTool = () => {
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
      const res = await runAltTextChecker(selectedProjectId);
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
        label: 'Total Images',
        value: report.totalImages || 0,
        status: 'good' as const,
        icon: <Image className="w-4 h-4" />
      },
      {
        label: 'Images with Alt Text',
        value: report.imagesWithAlt?.length || 0,
        status: 'good' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Images Missing Alt Text',
        value: report.imagesWithoutAlt?.length || 0,
        status: (report.imagesWithoutAlt?.length || 0) === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    const details: any[] = [];
    
    if (report.imagesWithoutAlt) {
      report.imagesWithoutAlt.forEach((image: any, index: number) => {
        details.push({
          label: `Missing Alt Text ${index + 1}`,
          value: image.src || 'No source',
          status: 'error' as const
        });
      });
    }
    
    if (report.imagesWithAlt) {
      report.imagesWithAlt.slice(0, 5).forEach((image: any, index: number) => {
        details.push({
          label: `Has Alt Text ${index + 1}`,
          value: image.alt || 'No alt text',
          status: 'good' as const
        });
      });
    }
    
    return details;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Alt Text Checker</h3>
        <p className="text-gray-600 mb-6">Find images without descriptive alt attributes for better accessibility and SEO.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Check Alt Text</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Alt Text Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Image className="w-6 h-6 text-orange-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default AltTextTool;
