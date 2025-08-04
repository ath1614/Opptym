import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Smartphone, 
  Globe, 
  Code, 
  Image, 
  Link2,
  Download,
  FileText,
  Search,
  Settings,
  BarChart3,
  Target,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';

type Submission = {
  siteName: string;
  submissionType: string;
  submittedAt: string;
};

type SEOScore = {
  total: number;
  breakdown: Record<string, number>;
  suggestions?: string[];
};

type Project = {
  title: string;
  url: string;
  email?: string;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  targetKeywords?: string[];
  sitemapUrl?: string;
  robotsTxtUrl?: string;

  metaTagReport?: object;
  keywordDensityReport?: object;
  backlinkReport?: object;
  brokenLinksReport?: object;
  sitemapReport?: object;
  robotsReport?: object;
  keywordTrackerReport?: object;
  pageSpeedReport?: object;
  schemaReport?: object;
  altTextReport?: object;
  canonicalReport?: object;
  mobileAuditReport?: object;
  competitorReport?: object;
  technicalAuditReport?: object;

  submissions?: Submission[];
  seoScore?: SEOScore;
};

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    if (reportRef.current) {
      // Clone the element to avoid modifying the original
      const element = reportRef.current.cloneNode(true) as HTMLElement;
      
      // Add PDF-specific styles
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .card-modern {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          .grid {
            display: block !important;
          }
          .grid > * {
            margin-bottom: 20px;
          }
        }
      `;
      element.appendChild(style);

      html2pdf()
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${project.title}_SEO_Report.pdf`,
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(element)
        .save()
        .catch(err => {
          console.error('PDF generation error:', err);
          alert('Failed to generate PDF. Please try again.');
        });
    }
  };

  // Define tool configurations with icons and colors
  const toolConfigs = {
    metaTagReport: {
      title: 'Meta Tag Analysis',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600',
      description: 'Meta title, description, and tag optimization'
    },
    keywordDensityReport: {
      title: 'Keyword Density Analysis',
      icon: <Search className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      description: 'Keyword distribution and optimization'
    },
    backlinkReport: {
      title: 'Backlink Analysis',
      icon: <Link2 className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-600',
      description: 'External links and domain authority'
    },
    brokenLinksReport: {
      title: 'Broken Links Check',
      icon: <XCircle className="w-5 h-5" />,
      color: 'from-red-500 to-orange-600',
      description: 'Internal and external broken links'
    },
    sitemapReport: {
      title: 'Sitemap Analysis',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-600',
      description: 'XML sitemap structure and coverage'
    },
    robotsReport: {
      title: 'Robots.txt Analysis',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-gray-500 to-slate-600',
      description: 'Crawler directives and indexing rules'
    },
    keywordTrackerReport: {
      title: 'Keyword Tracking',
      icon: <Target className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-600',
      description: 'Keyword ranking and performance'
    },
    pageSpeedReport: {
      title: 'Page Speed Analysis',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-green-500 to-teal-600',
      description: 'Loading speed and performance metrics'
    },
    schemaReport: {
      title: 'Schema Markup Analysis',
      icon: <Code className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-600',
      description: 'Structured data implementation'
    },
    altTextReport: {
      title: 'Alt Text Analysis',
      icon: <Image className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-600',
      description: 'Image accessibility and optimization'
    },
    canonicalReport: {
      title: 'Canonical Tags Analysis',
      icon: <Link2 className="w-5 h-5" />,
      color: 'from-purple-500 to-violet-600',
      description: 'Duplicate content prevention'
    },
    mobileAuditReport: {
      title: 'Mobile Audit',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      description: 'Mobile-friendliness and responsiveness'
    },
    competitorReport: {
      title: 'Competitor Analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-orange-500 to-red-600',
      description: 'Competitive landscape analysis'
    },
    technicalAuditReport: {
      title: 'Technical SEO Audit',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-gray-500 to-slate-600',
      description: 'Comprehensive technical analysis'
    }
  };

  // Get only the tools that have been used (have data)
  const usedTools = Object.entries(toolConfigs).filter(([key]) => 
    project[key as keyof Project] && Object.keys(project[key as keyof Project] as object).length > 0
  );

  const getStatusIcon = (status?: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status?: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-600">{project.url}</p>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        <div ref={reportRef}>
          {/* Project Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Project Information</h2>
                <p className="text-sm text-gray-600">Basic project details and metadata</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">URL:</span>
                  <span className="text-sm font-medium text-gray-800">{project.url}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium text-gray-800">{project.category || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Target Keywords:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {project.targetKeywords?.join(', ') || 'Not specified'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Meta Title:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {project.metaTitle || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Keywords:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {project.keywords?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Sitemap:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {project.sitemapUrl || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Score */}
          {project.seoScore && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">SEO Score</h2>
                  <p className="text-sm text-gray-600">Overall performance and optimization score</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">Total Score</span>
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-yellow-700">{project.seoScore.total}/130</span>
                  </div>
                </div>
                
                {project.seoScore.breakdown && Object.entries(project.seoScore.breakdown).map(([tool, score]) => (
                  <div key={tool} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">{tool}</span>
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-blue-700">{score}/10</span>
                    </div>
                  </div>
                ))}
              </div>

              {Array.isArray(project.seoScore.suggestions) && project.seoScore.suggestions.length > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Suggestions for Improvement:</h4>
                  <ul className="space-y-1">
                    {project.seoScore.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start space-x-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tool Reports - Only show used tools */}
          {usedTools.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">SEO Tool Reports</h2>
                  <p className="text-sm text-gray-600">{usedTools.length} tool(s) analyzed</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {usedTools.map(([key, config]) => {
                  const reportData = project[key as keyof Project] as any;
                  return (
                    <div key={key} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center`}>
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
                          <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="max-h-48 overflow-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(reportData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submissions */}
          {project.submissions && project.submissions.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Submissions</h2>
                  <p className="text-sm text-gray-600">{project.submissions.length} submission(s) logged</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.submissions.map((submission, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">{submission.submissionType}</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-3 h-3 text-green-600" />
                        <span className="text-sm text-green-700">{submission.siteName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-green-600" />
                        <span className="text-sm text-green-700">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Tools Used Message */}
          {usedTools.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No SEO Tools Used Yet</h3>
              <p className="text-gray-600 mb-6">
                This project hasn't been analyzed with any SEO tools yet. 
                Run some tools to see detailed reports here.
              </p>
              <button 
                onClick={() => window.location.hash = '#tools'}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to SEO Tools
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;