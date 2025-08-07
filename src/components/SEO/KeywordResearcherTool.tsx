import React, { useState } from 'react';
import { TrendingUp, Search, BarChart3, Target, Lightbulb, Download, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { getProjects, runKeywordResearcher } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: string;
  difficulty: number;
  cpc: string;
  trend: string;
  intent: string;
}

interface KeywordResearchResult {
  success: boolean;
  seedKeyword: string;
  analysis: {
    totalKeywords: number;
    avgSearchVolume: number;
    avgCompetition: string;
    keywordTypes: {
      main: number;
      longTail: number;
      questions: number;
    };
  };
  keywords: {
    main: KeywordData[];
    longTail: KeywordData[];
    questions: KeywordData[];
  };
  recommendations: string[];
  insights: {
    highVolumeKeywords: number;
    lowCompetitionKeywords: number;
    risingTrends: number;
  };
  message: string;
}

const KeywordResearcherTool: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [seedKeyword, setSeedKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KeywordResearchResult | null>(null);
  const [error, setError] = useState<string>('');

  // Load projects on component mount
  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const handleResearch = async () => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await runKeywordResearcher(selectedProject, seedKeyword || undefined);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to research keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword-research-${result.seedKeyword}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-600';
    if (difficulty <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (competition: string) => {
    const comp = parseFloat(competition);
    if (comp <= 0.3) return 'text-green-600';
    if (comp <= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderKeywordTable = (keywords: KeywordData[], title: string, type: string) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-500">({keywords.length} keywords)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {keyword.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.searchVolume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getCompetitionColor(keyword.competition)}>
                    {(parseFloat(keyword.competition) * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getDifficultyColor(keyword.difficulty)}>
                    {keyword.difficulty}/100
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${keyword.cpc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(keyword.trend)}
                    <span className="capitalize">{keyword.trend}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {keyword.intent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getMetrics = () => {
    if (!result?.analysis) return [];
    
    // Extract actual data from backend response
    const totalKeywords = result.analysis.totalKeywords || 0;
    const avgSearchVolume = result.analysis.avgSearchVolume || 0;
    const avgCompetition = result.analysis.avgCompetition || 0;
    const insights = result.insights || {};
    
    return [
      {
        label: 'Total Keywords Found',
        value: totalKeywords,
        status: 'good' as const,
        icon: <Search className="w-4 h-4" />
      },
      {
        label: 'Average Search Volume',
        value: avgSearchVolume.toLocaleString(),
        status: avgSearchVolume > 5000 ? 'good' as const : 'warning' as const,
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        label: 'Average Competition',
        value: `${(parseFloat(String(avgCompetition)) * 100).toFixed(1)}%`,
        status: parseFloat(String(avgCompetition)) < 0.5 ? 'good' as const : 'warning' as const,
        icon: <BarChart3 className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!result?.analysis) return [];
    
    // Extract actual data from backend response
    const totalKeywords = result.analysis.totalKeywords || 0;
    const avgSearchVolume = result.analysis.avgSearchVolume || 0;
    const avgCompetition = result.analysis.avgCompetition || 0;
    const keywordTypes = result.analysis.keywordTypes || {};
    const insights = result.insights || {};
    
    return [
      {
        label: 'Seed Keyword',
        value: result.seedKeyword || 'N/A',
        status: 'good' as const
      },
      {
        label: 'Main Keywords',
        value: keywordTypes.main || 0,
        status: 'good' as const
      },
      {
        label: 'Long-tail Keywords',
        value: keywordTypes.longTail || 0,
        status: 'good' as const
      },
      {
        label: 'Question Keywords',
        value: keywordTypes.questions || 0,
        status: 'good' as const
      },
      {
        label: 'High Volume Keywords',
        value: insights.highVolumeKeywords || 0,
        status: 'good' as const
      },
      {
        label: 'Low Competition Keywords',
        value: insights.lowCompetitionKeywords || 0,
        status: 'good' as const
      },
      {
        label: 'Rising Trend Keywords',
        value: insights.risingTrends || 0,
        status: 'good' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!result) return [];

    const guides = [];
    const avgCompetition = parseFloat(result.analysis.avgCompetition);
    const avgSearchVolume = result.analysis.avgSearchVolume;

    // High competition guide
    if (avgCompetition > 0.7) {
      guides.push({
        title: 'Target Less Competitive Keywords',
        description: 'High competition makes it difficult to rank. Focus on long-tail and niche keywords.',
        icon: <Target className="w-4 h-4" />,
        steps: [
          'Focus on long-tail keywords with lower competition',
          'Target specific, niche topics in your industry',
          'Use question-based keywords and local SEO',
          'Create content for emerging trends and topics',
          'Research keywords with competition scores below 0.5'
        ]
      });
    }

    // Low search volume guide
    if (avgSearchVolume < 1000) {
      guides.push({
        title: 'Balance Search Volume and Competition',
        description: 'Low search volume keywords may not drive enough traffic.',
        icon: <BarChart3 className="w-4 h-4" />,
        steps: [
          'Mix high-volume and low-competition keywords',
          'Target keywords with at least 1,000 monthly searches',
          'Focus on keywords with commercial intent',
          'Create content clusters around main keywords',
          'Monitor keyword performance and adjust strategy'
        ]
      });
    }

    // Content strategy guide
    guides.push({
      title: 'Develop Content Strategy Around Keywords',
      description: 'Use your keyword research to create comprehensive content.',
      icon: <Lightbulb className="w-4 h-4" />,
      steps: [
        'Create content for each keyword type (main, long-tail, questions)',
        'Develop content clusters around main topics',
        'Use keywords naturally throughout your content',
        'Create content that answers user intent',
        'Update and expand content based on keyword performance'
      ]
    });

    // Advanced keyword guide
    guides.push({
      title: 'Optimize for Featured Snippets',
      description: 'Target question-based keywords to capture featured snippets.',
      icon: <TrendingUp className="w-4 h-4" />,
      steps: [
        'Create content that directly answers questions',
        'Use clear, concise answers in your content',
        'Structure content with proper headings and lists',
        'Target "how to" and "what is" keywords',
        'Monitor featured snippet opportunities'
      ]
    });

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Keyword Researcher</h3>
        <p className="text-gray-600 mb-6">Discover new keywords with search volume and competition data to expand your SEO strategy.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Choose a project to analyze</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seed Keyword (Optional)
            </label>
            <input
              type="text"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              placeholder="e.g., seo tools, digital marketing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleResearch}
            disabled={loading || !selectedProject}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !selectedProject
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Researching...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Research Keywords</span>
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          <ResultsDisplay
            title="Keyword Research Results"
            success={result.success}
            data={result}
            suggestions={result.recommendations}
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            metrics={getMetrics()}
            details={getDetails()}
            improvementGuide={getImprovementGuide()}
          />

          {/* Keyword Tables */}
          <div className="space-y-6">
            {result.keywords.main.length > 0 && renderKeywordTable(result.keywords.main, 'Main Keywords', 'main')}
            {result.keywords.longTail.length > 0 && renderKeywordTable(result.keywords.longTail, 'Long-Tail Keywords', 'longTail')}
            {result.keywords.questions.length > 0 && renderKeywordTable(result.keywords.questions, 'Question-Based Keywords', 'questions')}
          </div>

          {/* Export Button */}
          <div className="mt-6">
            <button
              onClick={handleExport}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default KeywordResearcherTool; 