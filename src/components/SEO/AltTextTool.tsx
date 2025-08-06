import React, { useEffect, useState } from 'react';
import { getProjects, runAltTextChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Image, CheckCircle, XCircle, AlertTriangle, FileText, Eye, Lightbulb, Award } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const AltTextTool = () => {
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
      const res = await runAltTextChecker(selectedProjectId);
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
        label: 'Total Images',
        value: report.totalImages || 0,
        status: 'good' as const,
        icon: <Image className="w-4 h-4" />
      },
      {
        label: 'Images with Alt Text',
        value: report.imagesWithAlt?.length || 0,
        status: 'good' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Images Missing Alt Text',
        value: report.imagesWithoutAlt?.length || 0,
        status: (report.imagesWithoutAlt?.length || 0) === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report?.audit) return [];
    
    return [
      {
        label: 'Total Images',
        value: report.audit.totalImages || 0,
        status: 'good' as const
      },
      {
        label: 'Images with Alt Text',
        value: report.audit.imagesWithAlt || 0,
        status: 'good' as const
      },
      {
        label: 'Images Missing Alt Text',
        value: report.audit.missingAltCount || 0,
        status: (report.audit.missingAltCount || 0) === 0 ? 'good' as const : 'error' as const
      },
      {
        label: 'Alt Text Quality',
        value: report.audit.altTextQuality || 'Unknown',
        status: report.audit.altTextQuality === 'Good' ? 'good' as const : 'warning' as const
      }
    ];
  };

  const getImprovementGuide = () => {
    if (!report?.audit) return [];

    const guides = [];
    const missingAltCount = report.audit.missingAltCount || 0;
    const totalImages = report.audit.totalImages || 0;
    const altTextQuality = report.audit.altTextQuality;

    // Missing alt text guide
    if (missingAltCount > 0) {
      guides.push({
        title: 'Add Alt Text to Images',
        description: 'Alt text is essential for accessibility and helps search engines understand your images.',
        icon: <Image className="w-4 h-4" />,
        steps: [
          'Add descriptive alt text to all images',
          'Use alt="" for decorative images',
          'Include relevant keywords naturally in alt text',
          'Keep alt text concise but descriptive',
          'Test alt text with screen readers'
        ]
      });
    }

    // Poor alt text quality guide
    if (altTextQuality && altTextQuality !== 'Good') {
      guides.push({
        title: 'Improve Alt Text Quality',
        description: 'High-quality alt text provides better accessibility and SEO benefits.',
        icon: <FileText className="w-4 h-4" />,
        steps: [
          'Write descriptive alt text that explains the image content',
          'Avoid generic terms like "image" or "photo"',
          'Include context that\'s relevant to the page content',
          'Use natural language that flows with the content',
          'Consider what information the image conveys'
        ]
      });
    }

    // Accessibility guide
    guides.push({
      title: 'Enhance Image Accessibility',
      description: 'Making images accessible improves user experience for all visitors.',
      icon: <Eye className="w-4 h-4" />,
      steps: [
        'Ensure all informative images have descriptive alt text',
        'Use alt="" for decorative images that don\'t add content',
        'Provide text alternatives for complex images',
        'Test your site with screen readers',
        'Consider using ARIA labels for complex image content'
      ]
    });

    // SEO optimization guide
    guides.push({
      title: 'Optimize Images for SEO',
      description: 'Well-optimized images can improve your search rankings.',
      icon: <Award className="w-4 h-4" />,
      steps: [
        'Use descriptive filenames for your images',
        'Optimize image file sizes for faster loading',
        'Use appropriate image formats (WebP, JPEG, PNG)',
        'Include relevant keywords in alt text naturally',
        'Create an image sitemap for better indexing'
      ]
    });

    // Advanced optimization guide for good implementation
    if (missingAltCount === 0 && altTextQuality === 'Good') {
      guides.push({
        title: 'Maintain and Enhance Image Optimization',
        description: 'Your alt text implementation is excellent. Focus on continuous improvement.',
        icon: <Lightbulb className="w-4 h-4" />,
        steps: [
          'Regularly audit your alt text for quality and relevance',
          'Update alt text when images or content change',
          'Consider implementing lazy loading for images',
          'Monitor image performance in search results',
          'Stay updated with accessibility best practices'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Alt Text Checker</h3>
        <p className="text-gray-600 mb-6">Find images without descriptive alt attributes for better accessibility and SEO.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Check Alt Text</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Alt Text Analysis Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Image className="w-6 h-6 text-orange-600" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default AltTextTool;
