import React, { useEffect, useState } from 'react';
import { getProjects, runCompetitorAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Globe, TrendingUp, Users } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const CompetitorTool = () => {
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
      const res = await runCompetitorAnalyzer(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.results) return [];
    
    const totalCompetitors = report.results.reduce((acc: number, result: any) => acc + result.competitors.length, 0);
    const totalKeywords = report.results.length;
    
    return [
      {
        label: 'Keywords Analyzed',
        value: totalKeywords,
        status: 'good' as const,
        icon: <Globe className="w-4 h-4" />
      },
      {
        label: 'Total Competitors Found',
        value: totalCompetitors,
        status: 'good' as const,
        icon: <Users className="w-4 h-4" />
      },
      {
        label: 'Average Competitors per Keyword',
        value: totalKeywords > 0 ? (totalCompetitors / totalKeywords).toFixed(1) : 0,
        status: 'good' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.results) return [];
    
    const details: any[] = [];
    
    report.results.forEach((result: any, index: number) => {
      details.push({
        label: `Keyword: "${result.keyword}"`,
        value: `${result.competitors.length} competitors found`,
        status: result.competitors.length > 0 ? 'good' as const : 'warning' as const
      });
      
      if (result.competitors.length > 0) {
        result.competitors.slice(0, 3).forEach((competitor: string, compIndex: number) => {
          details.push({
            label: `  Competitor ${compIndex + 1}`,
            value: competitor,
            status: 'good' as const
          });
        });
      }
    });
    
    return details;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Competitor Analyzer</h3>
        <p className="text-gray-600 mb-6">Scrape competitors from SERP based on your keywords to identify market opportunities.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                : 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Run Competitor Analysis</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Competitor Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Globe className="w-6 h-6 text-cyan-600" />}
          metrics={getMetrics()}
          details={getDetails()}
        />
      )}
    </div>
  );
};

export default CompetitorTool;
