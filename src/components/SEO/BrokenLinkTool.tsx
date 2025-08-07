import React, { useEffect, useState } from 'react';
import { getProjects, runBrokenLinkChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Link, AlertTriangle, CheckCircle, Wrench, ExternalLink, RefreshCw, XCircle } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const BrokenLinkTool = () => {
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
      const res = await runBrokenLinkChecker(selectedProjectId);
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
    const totalLinks = report.totalLinks || 0;
    const brokenCount = report.brokenCount || 0;
    const workingLinks = totalLinks - brokenCount;
    
    return [
      {
        label: 'Total Links',
        value: totalLinks,
        status: 'good' as const,
        icon: <Link className="w-4 h-4" />
      },
      {
        label: 'Broken Links',
        value: brokenCount,
        status: (brokenCount === 0 ? 'good' : 'error') as 'good' | 'error',
        icon: <XCircle className="w-4 h-4" />
      },
      {
        label: 'Working Links',
        value: workingLinks,
        status: 'good' as const,
        icon: <CheckCircle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    // Extract actual data from backend response
    const totalLinks = report.totalLinks || 0;
    const brokenCount = report.brokenCount || 0;
    const brokenLinks = Array.isArray(report.brokenLinks) ? report.brokenLinks : [];
    const workingLinks = totalLinks - brokenCount;
    
    const details = [
      {
        label: 'Total External Links',
        value: totalLinks,
        status: 'good' as const
      },
      {
        label: 'Broken Links Found',
        value: brokenCount,
        status: (brokenCount === 0 ? 'good' : 'error') as 'good' | 'error'
      },
      {
        label: 'Working Links',
        value: workingLinks,
        status: 'good' as const
      },
      {
        label: 'Link Health Score',
        value: totalLinks > 0 ? `${Math.round(((workingLinks / totalLinks) * 100))}%` : 'N/A',
        status: (brokenCount === 0 ? 'good' : 'warning') as 'good' | 'warning'
      }
    ];

    // Add broken link details
    brokenLinks.slice(0, 5).forEach((link: any, index: number) => {
      details.push({
        label: `Broken Link ${index + 1}`,
        value: link.url || 'Unknown URL',
        status: 'error' as const
      });
    });

    return details;
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];
    const brokenLinksCount = report.brokenLinks?.length || 0;

    if (brokenLinksCount > 0) {
      guides.push({
        title: 'Fix Broken Links',
        description: 'Broken links can hurt your SEO and user experience. Here\'s how to fix them.',
        icon: <Wrench className="w-4 h-4" />,
        steps: [
          'Check if the linked page has moved to a new URL',
          'Update the link to point to the correct URL',
          'If the page is permanently gone, remove the link',
          'Replace broken links with relevant alternative content',
          'Set up 301 redirects for moved pages'
        ]
      });

      guides.push({
        title: 'Prevent Future Broken Links',
        description: 'Implement strategies to prevent broken links from occurring.',
        icon: <RefreshCw className="w-4 h-4" />,
        steps: [
          'Regularly audit your external links (monthly)',
          'Use link monitoring tools to track link health',
          'Build relationships with sites you link to',
          'Create internal link structures that are less likely to break',
          'Use descriptive anchor text for better link management'
        ]
      });
    } else {
      guides.push({
        title: 'Maintain Link Health',
        description: 'Great! No broken links found. Keep up the good work with these best practices.',
        icon: <CheckCircle className="w-4 h-4" />,
        steps: [
          'Continue regular link audits (quarterly)',
          'Monitor external sites you link to',
          'Use link monitoring tools for proactive detection',
          'Maintain a clean internal linking structure',
          'Keep your content updated and relevant'
        ]
      });
    }

    // General link optimization guide
    guides.push({
      title: 'Link Building Best Practices',
      description: 'Follow these best practices for effective link management.',
      icon: <ExternalLink className="w-4 h-4" />,
      steps: [
        'Focus on quality over quantity when building links',
        'Use descriptive anchor text for better SEO',
        'Link to authoritative and relevant sources',
        'Create valuable content that others want to link to',
        'Monitor your backlink profile regularly'
      ]
    });

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Broken Link Scanner</h3>
        <p className="text-gray-600 mb-6">Identify dead outbound links on your site that may hurt SEO performance.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
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
                <span>Scan for Broken Links</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Broken Link Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Link className="w-6 h-6 text-red-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default BrokenLinkTool;
