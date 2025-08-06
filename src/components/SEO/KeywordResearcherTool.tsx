import React, { useState } from 'react';
import { TrendingUp, Search, BarChart3, Target, Lightbulb, Download, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { apiRequest } from '../../lib/api';

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
        const response = await apiRequest('GET', '/projects');
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
      const response = await apiRequest('POST', `/tools/${selectedProject}/run-keyword-research`, {
        seedKeyword: seedKeyword || undefined
      });
      
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to research keywords');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Keyword Researcher</h2>
            <p className="text-sm text-gray-600">Discover new keywords with search volume and competition data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Choose a project...</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={loading || !selectedProject}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Researching Keywords...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Research Keywords
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Keywords</p>
                  <p className="text-2xl font-bold text-gray-900">{result.analysis.totalKeywords}</p>
                </div>
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Search Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{result.analysis.avgSearchVolume.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Competition</p>
                  <p className="text-2xl font-bold text-gray-900">{(parseFloat(result.analysis.avgCompetition) * 100).toFixed(0)}%</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rising Trends</p>
                  <p className="text-2xl font-bold text-gray-900">{result.insights.risingTrends}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Strategic Recommendations</h3>
            </div>
            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Improvement Guide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Improve Your Keyword Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-medium text-gray-800 mb-2">Focus on Long-tail Keywords</h4>
                  <p className="text-sm text-gray-600">
                    Long-tail keywords have lower competition and higher conversion rates. Create detailed content around these specific phrases.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-800 mb-2">Target Question-based Keywords</h4>
                  <p className="text-sm text-gray-600">
                    Questions are perfect for featured snippets. Create FAQ pages and comprehensive guides to capture these opportunities.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-800 mb-2">Monitor Rising Trends</h4>
                  <p className="text-sm text-gray-600">
                    Keywords with rising trends indicate growing interest. Create content early to capture this momentum.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-gray-800 mb-2">Balance Volume vs Competition</h4>
                  <p className="text-sm text-gray-600">
                    High-volume keywords are competitive. Mix high-volume targets with low-competition opportunities for sustainable growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Tables */}
          <div className="space-y-6">
            {result.keywords.main.length > 0 && renderKeywordTable(result.keywords.main, 'Main Keywords', 'main')}
            {result.keywords.longTail.length > 0 && renderKeywordTable(result.keywords.longTail, 'Long-tail Keywords', 'longTail')}
            {result.keywords.questions.length > 0 && renderKeywordTable(result.keywords.questions, 'Question-based Keywords', 'questions')}
          </div>

          {/* Export Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(result, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `keyword-research-${result.seedKeyword}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordResearcherTool; 