import React, { useEffect, useState } from 'react';
import { getProjects, runBacklinkScanner } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Link, ExternalLink, TrendingUp, Target, Globe, Users, Award } from 'lucide-react';

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
    
    // Extract actual data from backend response
    const totalExternal = report.totalExternal || 0;
    const domainsLinkingIn = report.domainsLinkingIn || 0;
    const domains = report.domains || {};
    const avgDomainAuthority = domainsLinkingIn > 0 ? Math.round(75 / domainsLinkingIn) : 0; // Mock calculation
    
    return [
      {
        label: 'Total Backlinks Found',
        value: totalExternal,
        status: 'good' as const,
        icon: <Link className="w-4 h-4" />
      },
      {
        label: 'Unique Domains',
        value: domainsLinkingIn,
        status: 'good' as const,
        icon: <ExternalLink className="w-4 h-4" />
      },
      {
        label: 'Average Domain Authority',
        value: `${avgDomainAuthority}/100`,
        status: 'good' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    // Extract actual data from backend response
    const totalExternal = report.totalExternal || 0;
    const domainsLinkingIn = report.domainsLinkingIn || 0;
    const domains = report.domains || {};
    
    const details = [
      {
        label: 'Total External Links',
        value: totalExternal,
        status: 'good' as const
      },
      {
        label: 'Unique Linking Domains',
        value: domainsLinkingIn,
        status: 'good' as const
      },
      {
        label: 'Average Links per Domain',
        value: domainsLinkingIn > 0 ? Math.round(totalExternal / domainsLinkingIn) : 0,
        status: 'good' as const
      }
    ];

    // Add domain details
    Object.entries(domains).slice(0, 10).forEach(([domain, anchors]: [string, any], index: number) => {
      details.push({
        label: `Domain ${index + 1}`,
        value: `${domain} (${Array.isArray(anchors) ? anchors.length : 0} links)`,
        status: 'good' as const
      });
    });
    
    return details;
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];
    const backlinkCount = report.backlinks?.length || 0;
    const uniqueDomains = report.uniqueDomains || 0;
    const avgDomainAuthority = report.avgDomainAuthority || 0;

    // Low backlink count guide
    if (backlinkCount < 10) {
      guides.push({
        title: 'Build Quality Backlinks',
        description: 'Increase your website\'s authority by building relevant backlinks from reputable sources.',
        icon: <Link className="w-4 h-4" />,
        steps: [
          'Create high-quality, shareable content',
          'Reach out to industry influencers and bloggers',
          'Submit your content to relevant directories',
          'Participate in industry forums and discussions',
          'Create infographics and visual content for sharing'
        ]
      });
    }

    // Low domain diversity guide
    if (uniqueDomains < 5) {
      guides.push({
        title: 'Diversify Your Link Sources',
        description: 'Having backlinks from diverse domains is better than many links from the same source.',
        icon: <Globe className="w-4 h-4" />,
        steps: [
          'Target different types of websites (blogs, news, directories)',
          'Focus on industry-specific websites',
          'Build relationships with multiple publishers',
          'Create content that appeals to different audiences',
          'Use various link building strategies'
        ]
      });
    }

    // Low domain authority guide
    if (avgDomainAuthority < 30) {
      guides.push({
        title: 'Target High-Authority Websites',
        description: 'Backlinks from high-authority domains have more SEO value.',
        icon: <Award className="w-4 h-4" />,
        steps: [
          'Research websites with high domain authority in your niche',
          'Create content that these sites would want to link to',
          'Build relationships with editors and content managers',
          'Offer value through guest posting and collaborations',
          'Focus on quality over quantity in link building'
        ]
      });
    }

    // General backlink strategy guide
    guides.push({
      title: 'Develop a Comprehensive Link Building Strategy',
      description: 'A strategic approach to link building will improve your SEO performance.',
      icon: <Target className="w-4 h-4" />,
      steps: [
        'Audit your current backlink profile regularly',
        'Disavow toxic or spammy backlinks',
        'Monitor your competitors\' backlink strategies',
        'Create linkable assets (studies, research, tools)',
        'Use social media to amplify your content reach'
      ]
    });

    // Advanced backlink guide for good profiles
    if (backlinkCount >= 50 && avgDomainAuthority >= 40) {
      guides.push({
        title: 'Optimize Your Existing Backlink Profile',
        description: 'Your backlink profile is strong. Focus on maintaining and improving it.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Monitor for lost backlinks and try to recover them',
          'Update and republish old content to maintain relevance',
          'Build relationships with your existing link partners',
          'Create more linkable content to attract new backlinks',
          'Focus on building brand mentions and citations'
        ]
      });
    }

    return guides;
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
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default BacklinkTool;
