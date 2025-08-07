import React, { useEffect, useState } from 'react';
import { getProjects, runSchemaValidatorTool } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { Code, CheckCircle, AlertTriangle, FileText, Settings, Lightbulb, Award } from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const SchemaValidatorTool = () => {
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
      const res = await runSchemaValidatorTool(selectedProjectId);
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
    const schemaTypes = Array.isArray(report.schemaTypes) ? report.schemaTypes : [];
    const found = report.found || false;
    const errors = Array.isArray(report.errors) ? report.errors : [];
    
    return [
      {
        label: 'Schema Found',
        value: found ? 'Yes' : 'No',
        status: found ? 'good' as const : 'warning' as const,
        icon: <Code className="w-4 h-4" />
      },
      {
        label: 'Schema Types',
        value: schemaTypes.length,
        status: schemaTypes.length > 0 ? 'good' as const : 'warning' as const,
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        label: 'Validation Errors',
        value: errors.length,
        status: errors.length === 0 ? 'good' as const : 'error' as const,
        icon: <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    // Extract actual data from backend response
    const schemaTypes = Array.isArray(report.schemaTypes) ? report.schemaTypes : [];
    const found = report.found || false;
    const errors = Array.isArray(report.errors) ? report.errors : [];
    
    const details = [
      {
        label: 'Structured Data Present',
        value: found,
        status: found ? 'good' as const : 'warning' as const
      },
      {
        label: 'Schema Types Found',
        value: schemaTypes.length,
        status: schemaTypes.length > 0 ? 'good' as const : 'warning' as const
      },
      {
        label: 'Validation Status',
        value: errors.length === 0 ? 'Valid' : 'Has Errors',
        status: errors.length === 0 ? 'good' as const : 'error' as const
      }
    ];

    // Add schema type details
    schemaTypes.forEach((type: string, index: number) => {
      details.push({
        label: `Schema Type ${index + 1}`,
        value: type,
        status: 'good' as const
      });
    });
    
    return details;
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];
    const hasSchema = (report.schemaTypes?.length || 0) > 0;
    const hasErrors = (report.errors?.length || 0) > 0;

    // No schema found guide
    if (!hasSchema) {
      guides.push({
        title: 'Implement Schema Markup',
        description: 'Schema markup helps search engines understand your content and can lead to rich results.',
        icon: <Code className="w-4 h-4" />,
        steps: [
          'Choose the appropriate schema type for your content',
          'Implement JSON-LD structured data in your HTML',
          'Use Google\'s Structured Data Testing Tool to validate',
          'Start with basic schemas like Organization, WebPage, or Article',
          'Add more specific schemas based on your content type'
        ]
      });
    }

    // Schema errors guide
    if (hasErrors) {
      guides.push({
        title: 'Fix Schema Validation Errors',
        description: 'Invalid schema markup won\'t be recognized by search engines.',
        icon: <Settings className="w-4 h-4" />,
        steps: [
          'Use Google\'s Structured Data Testing Tool to identify errors',
          'Fix syntax errors in your JSON-LD markup',
          'Ensure all required properties are included',
          'Validate your schema implementation',
          'Test with Google Search Console\'s Rich Results Test'
        ]
      });
    }

    // Schema type optimization guide
    guides.push({
      title: 'Choose the Right Schema Types',
      description: 'Different content types require different schema markup.',
      icon: <FileText className="w-4 h-4" />,
      steps: [
        'Use Organization schema for business information',
        'Implement Article schema for blog posts and articles',
        'Add Product schema for e-commerce pages',
        'Use LocalBusiness schema for local businesses',
        'Consider FAQ schema for question-and-answer content'
      ]
    });

    // Advanced schema guide for good implementation
    if (hasSchema && !hasErrors) {
      guides.push({
        title: 'Enhance Your Schema Implementation',
        description: 'Your schema is working well. Consider advanced optimizations.',
        icon: <Lightbulb className="w-4 h-4" />,
        steps: [
          'Add more specific schema types for different content',
          'Implement breadcrumb schema for better navigation',
          'Add review schema for products and services',
          'Consider implementing FAQ schema for common questions',
          'Monitor rich results performance in Google Search Console'
        ]
      });
    }

    return guides;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Schema Validator</h3>
        <p className="text-gray-600 mb-6">Check structured data for rich result compatibility and validation.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                : 'bg-purple-700 text-white hover:bg-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Validating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Validate Schema</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <ResultsDisplay
          title="Schema Validation Results"
          success={report.success}
          data={report}
          suggestions={report.suggestions || []}
          icon={<Code className="w-6 h-6 text-purple-700" />}
          metrics={getMetrics()}
          details={getDetails()}
          improvementGuide={getImprovementGuide()}
        />
      )}
    </div>
  );
};

export default SchemaValidatorTool;
