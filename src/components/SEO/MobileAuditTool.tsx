import React, { useEffect, useState } from 'react';
import { getProjects, runMobileAuditChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Smartphone, CheckCircle, XCircle, AlertTriangle, MousePointer, Type, Monitor, Zap } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const MobileAuditTool = () => {
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
      const res = await runMobileAuditChecker(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.audit) return [];
    
    return [
      {
        label: 'Mobile Friendly',
        value: report.audit.isMobileFriendly ? 'Yes' : 'No',
        status: report.audit.isMobileFriendly ? 'good' as const : 'error' as const,
        icon: <Smartphone className="w-4 h-4" />
      },
      {
        label: 'Viewport Meta Tag',
        value: report.audit.hasViewportMeta ? 'Present' : 'Missing',
        status: report.audit.hasViewportMeta ? 'good' as const : 'error' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Small Tap Targets',
        value: report.audit.smallTapTargets,
        status: report.audit.smallTapTargets === 0 ? 'good' as const : 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.audit) return [];
    
    return [
      {
        label: 'Viewport Meta Tag',
        value: report.audit.hasViewportMeta,
        status: report.audit.hasViewportMeta ? 'good' as const : 'error' as const
      },
      {
        label: 'Font Size OK',
        value: report.audit.fontSizeOk,
        status: report.audit.fontSizeOk ? 'good' as const : 'warning' as const
      },
      {
        label: 'No Small Tap Targets',
        value: report.audit.smallTapTargets === 0,
        status: report.audit.smallTapTargets === 0 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Overall Mobile Score',
        value: report.audit.isMobileFriendly ? 'Excellent' : 'Needs Improvement',
        status: report.audit.isMobileFriendly ? 'good' as const : 'error' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report?.audit) return [];

    const guides = [];

    // Not mobile friendly guide
    if (!report.audit.isMobileFriendly) {
      guides.push({
        title: 'Make Your Site Mobile-Friendly',
        description: 'Mobile-friendliness is crucial for SEO and user experience in today\'s mobile-first world.',
        icon: <Smartphone className="w-4 h-4" />,
        steps: [
          'Implement responsive design using CSS media queries',
          'Add a proper viewport meta tag to your HTML head',
          'Ensure all content is accessible on mobile devices',
          'Test your site on various mobile devices and screen sizes',
          'Optimize images and media for mobile viewing'
        ]
      });
    }

    // Missing viewport meta tag guide
    if (!report.audit.hasViewportMeta) {
      guides.push({
        title: 'Add Viewport Meta Tag',
        description: 'The viewport meta tag is essential for proper mobile rendering.',
        icon: <Monitor className="w-4 h-4" />,
        steps: [
          'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML head',
          'Ensure the viewport tag is placed before other meta tags',
          'Test the viewport behavior on different mobile devices',
          'Consider adding user-scalable=no if you want to prevent zooming',
          'Verify the viewport tag is working correctly'
        ]
      });
    }

    // Small tap targets guide
    if (report.audit.smallTapTargets > 0) {
      guides.push({
        title: 'Fix Small Tap Targets',
        description: 'Small tap targets make it difficult for users to interact with your site on mobile.',
        icon: <MousePointer className="w-4 h-4" />,
        steps: [
          'Ensure all clickable elements are at least 44x44 pixels',
          'Add proper padding around buttons and links',
          'Increase spacing between interactive elements',
          'Use larger touch targets for important actions',
          'Test touch interactions on actual mobile devices'
        ]
      });
    }

    // Font size issues guide
    if (!report.audit.fontSizeOk) {
      guides.push({
        title: 'Optimize Font Sizes for Mobile',
        description: 'Text should be readable on mobile devices without requiring zoom.',
        icon: <Type className="w-4 h-4" />,
        steps: [
          'Use a minimum font size of 16px for body text',
          'Ensure headings are properly sized and readable',
          'Avoid using very small fonts for important information',
          'Test text readability on various mobile screen sizes',
          'Consider using relative units (em, rem) for better scaling'
        ]
      });
    }

    // General mobile optimization guide
    guides.push({
      title: 'Optimize for Mobile Performance',
      description: 'Mobile users expect fast, smooth experiences on their devices.',
      icon: <Zap className="w-4 h-4" />,
      steps: [
        'Optimize images and use appropriate formats for mobile',
        'Minimize HTTP requests and reduce page weight',
        'Use mobile-specific caching strategies',
        'Implement progressive web app (PWA) features',
        'Test and optimize for different mobile browsers'
      ]
    });

    // Advanced mobile guide for good performance
    if (report.audit.isMobileFriendly) {
      guides.push({
        title: 'Enhance Mobile User Experience',
        description: 'Your site is mobile-friendly. Focus on enhancing the user experience.',
        icon: <CheckCircle className="w-4 h-4" />,
        steps: [
          'Implement touch gestures and mobile-specific interactions',
          'Add mobile-specific features like swipe navigation',
          'Optimize for mobile search and voice search',
          'Consider implementing AMP (Accelerated Mobile Pages)',
          'Monitor mobile performance metrics regularly'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Mobile Checker</h3>
        <p className="text-gray-600 mb-6">Check responsive design and tap usability for mobile devices.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                : 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Check Mobile</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Mobile Audit Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Smartphone className="w-6 h-6 text-pink-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default MobileAuditTool;