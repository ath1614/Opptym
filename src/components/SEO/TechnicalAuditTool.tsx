import React, { useEffect, useState } from 'react';
import { getProjects, runTechnicalSeoAuditor } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Bug, CheckCircle, XCircle, AlertTriangle, Code, Settings, FileText, Link } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const TechnicalAuditTool = () => {
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
      const res = await runTechnicalSeoAuditor(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.audit) return [];
    
    // Extract actual data from backend response
    const title = report.audit.title || 'N/A';
    const metaDescription = report.audit.metaDescription || 'N/A';
    const h1Count = report.audit.h1Count || 0;
    const internalLinks = report.audit.internalLinks || 0;
    const robotsTag = report.audit.robotsTag || 'N/A';
    const issues = Array.isArray(report.issues) ? report.issues : [];
    
    return [
      {
        label: 'Technical Issues Found',
        value: issues.length,
        status: issues.length === 0 ? 'good' as const : 'warning' as const,
        icon: <Bug className="w-4 h-4" />
      },
      {
        label: 'H1 Headings',
        value: h1Count,
        status: h1Count === 1 ? 'good' as const : 'warning' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Internal Links',
        value: internalLinks,
        status: internalLinks >= 5 ? 'good' as const : 'warning' as const,
        icon: <Link className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.audit) return [];
    
    // Extract actual data from backend response
    const title = report.audit.title || 'N/A';
    const metaDescription = report.audit.metaDescription || 'N/A';
    const h1Count = report.audit.h1Count || 0;
    const internalLinks = report.audit.internalLinks || 0;
    const robotsTag = report.audit.robotsTag || 'N/A';
    const issues = Array.isArray(report.issues) ? report.issues : [];
    
    return [
      {
        label: 'Title Tag Present',
        value: title !== 'N/A',
        status: title !== 'N/A' ? 'good' as const : 'error' as const
      },
      {
        label: 'Meta Description Present',
        value: metaDescription !== 'N/A',
        status: metaDescription !== 'N/A' ? 'good' as const : 'error' as const
      },
      {
        label: 'Single H1 Heading',
        value: h1Count === 1,
        status: h1Count === 1 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Adequate Internal Links',
        value: internalLinks >= 5,
        status: internalLinks >= 5 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Robots Tag OK',
        value: !robotsTag.includes('noindex') && !robotsTag.includes('nofollow'),
        status: (!robotsTag.includes('noindex') && !robotsTag.includes('nofollow')) ? 'good' as const : 'warning' as const
      },
      {
        label: 'Total Issues Found',
        value: issues.length,
        status: issues.length === 0 ? 'good' as const : 'warning' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report?.audit) return [];

    const guides = [];
    const issues = report.issues || [];

    // Missing title guide
    if (!report.audit.title) {
      guides.push({
        title: 'Add a Title Tag',
        description: 'Title tags are crucial for SEO and appear in search results.',
        icon: <FileText className="w-4 h-4" />,
        steps: [
          'Add a unique, descriptive title tag to each page',
          'Keep titles between 50-60 characters',
          'Include your primary keyword near the beginning',
          'Make titles compelling and click-worthy',
          'Avoid duplicate titles across your site'
        ]
      });
    }

    // Missing meta description guide
    if (!report.audit.metaDescription) {
      guides.push({
        title: 'Add Meta Descriptions',
        description: 'Meta descriptions appear in search results and influence click-through rates.',
        icon: <FileText className="w-4 h-4" />,
        steps: [
          'Write unique meta descriptions for each page',
          'Keep descriptions between 150-160 characters',
          'Include your target keyword naturally',
          'Make descriptions compelling and action-oriented',
          'Avoid duplicate meta descriptions'
        ]
      });
    }

    // H1 issues guide
    if (report.audit.h1Count !== 1) {
      guides.push({
        title: 'Fix H1 Heading Structure',
        description: 'Each page should have exactly one H1 heading for proper SEO structure.',
        icon: <Code className="w-4 h-4" />,
        steps: [
          'Ensure each page has exactly one H1 heading',
          'Use H1 for the main page title or topic',
          'Structure other headings with H2, H3, etc.',
          'Include your primary keyword in the H1',
          'Make H1 headings descriptive and relevant'
        ]
      });
    }

    // Internal linking guide
    if (report.audit.internalLinks < 5) {
      guides.push({
        title: 'Improve Internal Linking',
        description: 'Internal links help search engines understand your site structure and distribute page authority.',
        icon: <Link className="w-4 h-4" />,
        steps: [
          'Add more internal links to relevant pages',
          'Use descriptive anchor text for internal links',
          'Link to important pages from your homepage',
          'Create a logical site structure with clear navigation',
          'Use internal links to guide users through your content'
        ]
      });
    }

    // Robots tag issues guide
    if (report.audit.robotsTag && report.audit.robotsTag.includes('noindex')) {
      guides.push({
        title: 'Fix Robots Meta Tag',
        description: 'The robots meta tag is preventing search engines from indexing your page.',
        icon: <Settings className="w-4 h-4" />,
        steps: [
          'Remove noindex directive if you want the page indexed',
          'Use noindex only for private or duplicate pages',
          'Ensure robots tag is properly formatted',
          'Test robots tag with Google Search Console',
          'Monitor indexing status after changes'
        ]
      });
    }

    // General technical SEO guide
    guides.push({
      title: 'Improve Technical SEO Foundation',
      description: 'Strong technical SEO provides the foundation for better rankings.',
      icon: <Bug className="w-4 h-4" />,
      steps: [
        'Fix all technical issues identified in the audit',
        'Ensure your site has a clear site structure',
        'Optimize for Core Web Vitals and page speed',
        'Implement proper schema markup',
        'Regularly monitor and fix technical issues'
      ]
    });

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Technical SEO Auditor</h3>
        <p className="text-gray-600 mb-6">Check for common page-level SEO issues and technical problems.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                : 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Auditing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Bug className="w-5 h-5" />
                <span>Run Technical Audit</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Technical SEO Audit Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Bug className="w-6 h-6 text-gray-700" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default TechnicalAuditTool;
