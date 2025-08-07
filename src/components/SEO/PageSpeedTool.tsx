import React, { useEffect, useState } from 'react';
import { getProjects, runPageSpeedAnalyzer } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Zap, Clock, TrendingUp, TrendingDown, Settings, Image, Code, Database } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const PageSpeedTool = () => {
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
      const res = await runPageSpeedAnalyzer(selectedProjectId);
      setReport(res);
    } catch (err) {
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report?.metrics) return [];
    
    // Extract actual data from backend response
    const firstContentfulPaint = report.metrics.firstContentfulPaint || 0;
    const largestContentfulPaint = report.metrics.largestContentfulPaint || 0;
    const cumulativeLayoutShift = report.metrics.cumulativeLayoutShift || 0;
    const score = report.score || 0;
    
    return [
      {
        label: 'Page Speed Score',
        value: `${score}/100`,
        status: score >= 90 ? 'good' as const : score >= 70 ? 'warning' as const : 'error' as const,
        icon: <Clock className="w-4 h-4" />
      },
      {
        label: 'First Contentful Paint',
        value: `${firstContentfulPaint}ms`,
        status: firstContentfulPaint < 1800 ? 'good' as const : firstContentfulPaint < 3000 ? 'warning' as const : 'error' as const,
        icon: <Zap className="w-4 h-4" />
      },
      {
        label: 'Largest Contentful Paint',
        value: `${largestContentfulPaint}ms`,
        status: largestContentfulPaint < 2500 ? 'good' as const : largestContentfulPaint < 4000 ? 'warning' as const : 'error' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.metrics) return [];
    
    // Extract actual data from backend response
    const firstContentfulPaint = report.metrics.firstContentfulPaint || 0;
    const largestContentfulPaint = report.metrics.largestContentfulPaint || 0;
    const cumulativeLayoutShift = report.metrics.cumulativeLayoutShift || 0;
    const score = report.score || 0;
    
    return [
      {
        label: 'Overall Performance Score',
        value: `${score}/100`,
        status: score >= 90 ? 'good' as const : score >= 70 ? 'warning' as const : 'error' as const
      },
      {
        label: 'Fast FCP (< 1.8s)',
        value: firstContentfulPaint < 1800,
        status: firstContentfulPaint < 1800 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Fast LCP (< 2.5s)',
        value: largestContentfulPaint < 2500,
        status: largestContentfulPaint < 2500 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Good CLS (< 0.1)',
        value: cumulativeLayoutShift < 0.1,
        status: cumulativeLayoutShift < 0.1 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Cumulative Layout Shift',
        value: cumulativeLayoutShift.toFixed(3),
        status: cumulativeLayoutShift < 0.1 ? 'good' as const : 'warning' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report?.metrics) return [];

    const guides = [];
    const loadTime = parseInt(report.metrics.loadTime);
    const ttfb = parseInt(report.metrics.ttfb);
    const domContentLoaded = parseInt(report.metrics.domContentLoaded);

    // Slow load time guide
    if (loadTime > 3000) {
      guides.push({
        title: 'Optimize Page Load Speed',
        description: 'Your page is loading slowly, which can hurt user experience and SEO rankings.',
        icon: <Clock className="w-4 h-4" />,
        steps: [
          'Optimize and compress images (use WebP format)',
          'Minify CSS, JavaScript, and HTML files',
          'Enable browser caching for static resources',
          'Use a CDN to serve content from multiple locations',
          'Remove unnecessary plugins and scripts'
        ]
      });
    }

    // Slow TTFB guide
    if (ttfb > 600) {
      guides.push({
        title: 'Improve Server Response Time',
        description: 'Time to First Byte (TTFB) indicates server performance issues.',
        icon: <Database className="w-4 h-4" />,
        steps: [
          'Upgrade your hosting plan or server resources',
          'Optimize database queries and reduce server load',
          'Use server-side caching (Redis, Memcached)',
          'Implement database indexing for faster queries',
          'Consider using a faster web server (Nginx)'
        ]
      });
    }

    // Slow DOM content loaded guide
    if (domContentLoaded > 3000) {
      guides.push({
        title: 'Optimize DOM Rendering',
        description: 'DOM Content Loaded time affects how quickly users can interact with your page.',
        icon: <Code className="w-4 h-4" />,
        steps: [
          'Optimize critical rendering path',
          'Defer non-critical JavaScript loading',
          'Inline critical CSS and defer non-critical CSS',
          'Reduce the number of render-blocking resources',
          'Optimize CSS and JavaScript delivery'
        ]
      });
    }

    // Image optimization guide
    guides.push({
      title: 'Optimize Images and Media',
      description: 'Images often account for the largest portion of page weight.',
      icon: <Image className="w-4 h-4" />,
      steps: [
        'Convert images to modern formats (WebP, AVIF)',
        'Use responsive images with appropriate sizes',
        'Implement lazy loading for images below the fold',
        'Compress images without losing quality',
        'Use image sprites for small, repeated images'
      ]
    });

    // Advanced optimization guide for good performance
    if (loadTime < 2000 && ttfb < 200) {
      guides.push({
        title: 'Maintain and Further Optimize',
        description: 'Your page speed is good. Focus on maintaining and further optimizing.',
        icon: <TrendingUp className="w-4 h-4" />,
        steps: [
          'Monitor Core Web Vitals regularly',
          'Implement advanced caching strategies',
          'Consider using a service worker for offline functionality',
          'Optimize for mobile performance specifically',
          'Test and optimize for different network conditions'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Page Speed Analyzer</h3>
        <p className="text-gray-600 mb-6">Evaluate loading performance and timing metrics for better user experience.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Analyze Page Speed</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Page Speed Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Zap className="w-6 h-6 text-yellow-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default PageSpeedTool;