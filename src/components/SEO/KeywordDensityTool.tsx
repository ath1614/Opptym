import React, { useEffect, useState } from 'react';
import { getProjects, runKeywordDensityAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Search, TrendingUp, TrendingDown, Target, Edit3, BarChart3 } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const KeywordDensityTool = () => {
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
      const res = await runKeywordDensityAnalyzer(selectedProjectId);
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
        label: 'Total Words',
        value: report.totalWords || 0,
        status: 'good' as const,
        icon: <Search className="w-4 h-4" />
      },
      {
        label: 'Keywords Analyzed',
        value: report.keywordStats?.length || 0,
        status: 'good' as const,
        icon: <Search className="w-4 h-4" />
      },
      {
        label: 'Average Density',
        value: report.keywordStats?.length > 0 
          ? `${((report.keywordStats.reduce((acc: number, kw: any) => acc + parseFloat(kw.density.replace('%', '')), 0) / report.keywordStats.length)).toFixed(2)}%`
          : '0%',
        status: 'good' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.keywordStats) return [];
    
    return report.keywordStats.map((keyword: any) => ({
      label: `"${keyword.keyword}"`,
      value: `${keyword.count} times (${keyword.density})`,
      status: (parseFloat(keyword.density.replace('%', '')) > 0.5 && parseFloat(keyword.density.replace('%', '')) < 2.5) ? 'good' as const : 'warning' as const
    }));
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];
    const keywordStats = report.keywordStats || [];

    // Check for low density keywords
    const lowDensityKeywords = keywordStats.filter((kw: any) => parseFloat(kw.density.replace('%', '')) < 0.5);
    if (lowDensityKeywords.length > 0) {
      guides.push({
        title: 'Optimize Low Density Keywords',
        description: 'Some keywords have very low density, which may affect SEO performance.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Naturally incorporate low-density keywords into your content',
          'Use keywords in headings (H1, H2, H3) for better emphasis',
          'Include keywords in the first paragraph of your content',
          'Add keywords to image alt text and meta descriptions',
          'Create content clusters around your target keywords'
        ]
      });
    }

    // Check for high density keywords (keyword stuffing)
    const highDensityKeywords = keywordStats.filter((kw: any) => parseFloat(kw.density.replace('%', '')) > 2.5);
    if (highDensityKeywords.length > 0) {
      guides.push({
        title: 'Reduce Keyword Stuffing',
        description: 'Some keywords have very high density, which can be seen as keyword stuffing.',
        icon: <Edit3 className="w-4 h-4" />,
        steps: [
          'Reduce the frequency of overused keywords',
          'Use synonyms and related terms instead',
          'Focus on natural, readable content flow',
          'Expand content length to naturally dilute keyword density',
          'Use LSI (Latent Semantic Indexing) keywords'
        ]
      });
    }

    // Check for missing keywords
    if (keywordStats.length === 0) {
      guides.push({
        title: 'Add Target Keywords',
        description: 'No keywords were found in your content. You need to add relevant keywords.',
        icon: <Target className="w-4 h-4" />,
        steps: [
          'Research relevant keywords for your topic',
          'Include primary and secondary keywords naturally',
          'Use long-tail keywords for better targeting',
          'Add keywords to headings and subheadings',
          'Include keywords in meta descriptions and titles'
        ]
      });
    }

    // General keyword optimization guide
    guides.push({
      title: 'Keyword Density Best Practices',
      description: 'Follow these best practices for optimal keyword density.',
      icon: <BarChart3 className="w-4 h-4" />,
      steps: [
        'Aim for 0.5% to 2.5% keyword density for optimal results',
        'Use keywords naturally in the flow of your content',
        'Include keywords in the first 100 words of your content',
        'Distribute keywords evenly throughout the content',
        'Use variations and synonyms of your target keywords'
      ]
    });

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Keyword Density Analyzer</h3>
        <p className="text-gray-600 mb-6">Evaluate keyword usage and relevance in your content for optimal SEO performance.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Run Keyword Density Analysis</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Keyword Density Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Search className="w-6 h-6 text-green-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default KeywordDensityTool;
