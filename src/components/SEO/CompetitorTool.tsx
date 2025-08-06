import React, { useEffect, useState } from 'react';
import { getProjects, runCompetitorAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Globe, Users, TrendingUp, Target, BarChart3, Lightbulb, Award } from 'lucide-react';

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
    
    return report.results.slice(0, 5).map((result: any, index: number) => ({
      label: `Keyword: "${result.keyword}"`,
      value: `${result.competitors.length} competitors found`,
      status: 'good' as const
    }));
  };

  const getImprovementGuide = () => {
    if (!report?.results) return [];

    const guides = [];
    const totalCompetitors = report.results.reduce((acc: number, result: any) => acc + result.competitors.length, 0);
    const totalKeywords = report.results.length;
    const avgCompetitors = totalKeywords > 0 ? totalCompetitors / totalKeywords : 0;

    // High competition guide
    if (avgCompetitors > 10) {
      guides.push({
        title: 'Target Less Competitive Keywords',
        description: 'High competition makes it difficult to rank. Focus on long-tail and niche keywords.',
        icon: <Target className="w-4 h-4" />,
        steps: [
          'Research long-tail keywords with lower search volume',
          'Target specific, niche topics in your industry',
          'Focus on question-based keywords and local SEO',
          'Create content for emerging trends and topics',
          'Use keyword research tools to find low-competition opportunities'
        ]
      });
    }

    // Competitor analysis guide
    guides.push({
      title: 'Analyze and Learn from Competitors',
      description: 'Understanding your competitors can help you improve your SEO strategy.',
      icon: <BarChart3 className="w-4 h-4" />,
      steps: [
        'Study your competitors\' content strategies and topics',
        'Analyze their backlink profiles and link building tactics',
        'Identify content gaps and opportunities they\'re missing',
        'Monitor their social media presence and engagement',
        'Track their keyword rankings and performance changes'
      ]
      });

    // Content strategy guide
    guides.push({
      title: 'Develop a Competitive Content Strategy',
      description: 'Create content that outperforms your competitors and attracts more traffic.',
      icon: <Lightbulb className="w-4 h-4" />,
      steps: [
        'Create more comprehensive and detailed content than competitors',
        'Focus on user intent and providing better answers',
        'Use multimedia content (videos, infographics, interactive elements)',
        'Update and improve existing content regularly',
        'Create content clusters around your main topics'
      ]
    });

    // Technical optimization guide
    guides.push({
      title: 'Optimize Technical SEO Factors',
      description: 'Technical improvements can give you an edge over competitors.',
      icon: <Award className="w-4 h-4" />,
      steps: [
        'Improve page load speed and Core Web Vitals',
        'Ensure mobile-friendliness and responsive design',
        'Optimize for featured snippets and rich results',
        'Implement structured data markup',
        'Fix technical issues that competitors might have'
      ]
    });

    // Advanced competitive guide
    if (avgCompetitors < 5) {
      guides.push({
        title: 'Capitalize on Low Competition',
        description: 'Low competition presents an opportunity to dominate these keywords.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Create comprehensive content for these keywords',
          'Build quality backlinks to strengthen your authority',
          'Optimize for local SEO if applicable',
          'Create content variations and related topics',
          'Monitor and protect your rankings from new competitors'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Competitor Analyzer</h3>
        <p className="text-gray-600 mb-6">Scrape competitors from SERP based on your keywords to understand the competitive landscape.</p>

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
                <span>Analyze Competitors</span>
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
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default CompetitorTool;
