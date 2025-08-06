import React, { useEffect, useState } from 'react';
import { getProjects, runCanonicalChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Link2, CheckCircle, XCircle, AlertTriangle, FileText, Settings, Lightbulb, Award } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const CanonicalTool = () => {
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
      const res = await runCanonicalChecker(selectedProjectId);
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
        label: 'Canonical URL Present',
        value: report.hasCanonical ? 'Yes' : 'No',
        status: report.hasCanonical ? 'good' as const : 'error' as const,
        icon: <Link2 className="w-4 h-4" />
      },
      {
        label: 'Canonical URL Valid',
        value: report.isValid ? 'Yes' : 'No',
        status: report.isValid ? 'good' as const : 'error' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Self-Referencing',
        value: report.isSelfReferencing ? 'Yes' : 'No',
        status: report.isSelfReferencing ? 'good' as const : 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    return [
      {
        label: 'Canonical URL Present',
        value: report.hasCanonical ? 'Yes' : 'No',
        status: report.hasCanonical ? 'good' as const : 'error' as const
      },
      {
        label: 'Canonical URL Valid',
        value: report.isValid ? 'Yes' : 'No',
        status: report.isValid ? 'good' as const : 'error' as const
      },
      {
        label: 'Self-Referencing',
        value: report.isSelfReferencing ? 'Yes' : 'No',
        status: report.isSelfReferencing ? 'good' as const : 'warning' as const
      },
      {
        label: 'Canonical URL',
        value: report.canonicalUrl || 'Not found',
        status: report.canonicalUrl ? 'good' as const : 'error' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];

    // Missing canonical guide
    if (!report.hasCanonical) {
      guides.push({
        title: 'Add Canonical URLs',
        description: 'Canonical URLs help prevent duplicate content issues and tell search engines which page is the primary version.',
        icon: <Link2 className="w-4 h-4" />,
        steps: [
          'Add canonical URLs to all pages on your website',
          'Use the format: <link rel="canonical" href="https://yoursite.com/page" />',
          'Place canonical tags in the <head> section of your HTML',
          'Ensure canonical URLs point to the preferred version of each page',
          'Use absolute URLs rather than relative URLs'
        ]
      });
    }

    // Invalid canonical guide
    if (report.hasCanonical && !report.isValid) {
      guides.push({
        title: 'Fix Invalid Canonical URLs',
        description: 'Invalid canonical URLs can confuse search engines and hurt your SEO.',
        icon: <Settings className="w-4 h-4" />,
        steps: [
          'Check that canonical URLs are properly formatted',
          'Ensure canonical URLs use absolute URLs (https://yoursite.com/page)',
          'Verify that canonical URLs point to existing pages',
          'Fix any syntax errors in your canonical tags',
          'Test canonical URLs with Google Search Console'
        ]
      });
    }

    // Not self-referencing guide
    if (report.hasCanonical && !report.isSelfReferencing) {
      guides.push({
        title: 'Use Self-Referencing Canonical URLs',
        description: 'Self-referencing canonical URLs are the best practice for most pages.',
        icon: <FileText className="w-4 h-4" />,
        steps: [
          'Make canonical URLs point to the same page they\'re on',
          'Use the exact URL of the current page as the canonical',
          'Avoid pointing canonical URLs to different pages unless necessary',
          'Ensure consistency across your entire website',
          'Test that canonical URLs resolve correctly'
        ]
      });
    }

    // Duplicate content prevention guide
    guides.push({
      title: 'Prevent Duplicate Content Issues',
      description: 'Proper canonical implementation helps prevent duplicate content problems.',
      icon: <Award className="w-4 h-4" />,
      steps: [
        'Use canonical URLs for pages with similar content',
        'Implement canonical URLs for pagination and filtering',
        'Add canonical URLs to print-friendly and mobile versions',
        'Use canonical URLs for AMP pages',
        'Monitor for duplicate content issues in Google Search Console'
      ]
    });

    // Advanced canonical guide for good implementation
    if (report.hasCanonical && report.isValid && report.isSelfReferencing) {
      guides.push({
        title: 'Optimize Your Canonical Implementation',
        description: 'Your canonical implementation is good. Focus on advanced optimizations.',
        icon: <Lightbulb className="w-4 h-4" />,
        steps: [
          'Audit your canonical URLs regularly for consistency',
          'Monitor canonical URL performance in search results',
          'Consider implementing hreflang tags for international sites',
          'Use canonical URLs strategically for content consolidation',
          'Test canonical URL behavior with different user agents'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Canonical Checker</h3>
        <p className="text-gray-600 mb-6">Validate canonical URLs and avoid duplicate content issues.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                : 'bg-lime-600 text-white hover:bg-lime-700 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Link2 className="w-5 h-5" />
                <span>Check Canonical</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Canonical Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Link2 className="w-6 h-6 text-lime-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default CanonicalTool;
