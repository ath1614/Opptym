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
      
      // Add PDF-specific styles for better layout - ensure all content is visible
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            overflow: visible !important;
          }
          
          .card-modern {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 12px !important;
            padding: 10px !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 6px !important;
            background: white !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          
          .grid {
            display: block !important;
          }
          
          .grid > * {
            margin-bottom: 12px !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
          }
          
          .flex {
            display: block !important;
          }
          
          .space-y-4 > * {
            margin-bottom: 8px !important;
          }
          
          .space-y-6 > * {
            margin-bottom: 12px !important;
          }
          
          .space-y-8 > * {
            margin-bottom: 16px !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 0 !important;
            margin-bottom: 8px !important;
            page-break-after: avoid !important;
            overflow: visible !important;
          }
          
          h1 { font-size: 20px !important; }
          h2 { font-size: 18px !important; }
          h3 { font-size: 16px !important; }
          h4 { font-size: 14px !important; }
          h5 { font-size: 12px !important; }
          h6 { font-size: 11px !important; }
          
          p {
            margin: 0 0 6px 0 !important;
            line-height: 1.3 !important;
            overflow: visible !important;
          }
          
          .text-sm { font-size: 10px !important; }
          .text-xs { font-size: 9px !important; }
          
          .bg-gradient-to-r {
            background: #f3f4f6 !important;
            border: 1px solid #d1d5db !important;
          }
          
          .rounded-xl, .rounded-lg, .rounded-md {
            border-radius: 4px !important;
          }
          
          .p-6 { padding: 8px !important; }
          .p-4 { padding: 6px !important; }
          .p-3 { padding: 4px !important; }
          .p-2 { padding: 3px !important; }
          
          .mb-6 { margin-bottom: 8px !important; }
          .mb-4 { margin-bottom: 6px !important; }
          .mb-3 { margin-bottom: 4px !important; }
          .mb-2 { margin-bottom: 3px !important; }
          
          .mt-4 { margin-top: 6px !important; }
          .mt-3 { margin-top: 4px !important; }
          .mt-2 { margin-top: 3px !important; }
          
          .w-12, .w-10, .w-8, .w-6, .w-5, .w-4 {
            width: auto !important;
            height: auto !important;
          }
          
          .h-12, .h-10, .h-8, .h-6, .h-5, .h-4 {
            height: auto !important;
          }
          
          .flex.items-center {
            display: block !important;
          }
          
          .flex.items-center > * {
            display: inline-block !important;
            margin-right: 6px !important;
          }
          
          .justify-between {
            display: block !important;
          }
          
          .justify-between > * {
            display: block !important;
            margin-bottom: 4px !important;
          }
          
          .space-x-2 > * {
            margin-right: 3px !important;
          }
          
          .space-x-3 > * {
            margin-right: 4px !important;
          }
          
          .space-x-4 > * {
            margin-right: 6px !important;
          }
          
          .grid-cols-1, .grid-cols-2, .grid-cols-3, .grid-cols-4 {
            display: block !important;
          }
          
          .grid-cols-1 > *, .grid-cols-2 > *, .grid-cols-3 > *, .grid-cols-4 > * {
            display: block !important;
            margin-bottom: 8px !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          .text-right {
            text-align: right !important;
          }
          
          .font-bold { font-weight: bold !important; }
          .font-semibold { font-weight: 600 !important; }
          .font-medium { font-weight: 500 !important; }
          
          .text-gray-900 { color: #000 !important; }
          .text-gray-800 { color: #1f2937 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-400 { color: #9ca3af !important; }
          
          .bg-blue-500, .bg-green-500, .bg-red-500, .bg-yellow-500, .bg-purple-500 {
            background: #f3f4f6 !important;
            border: 1px solid #d1d5db !important;
          }
          
          .text-white {
            color: #000 !important;
          }
          
          .border {
            border: 1px solid #e5e7eb !important;
          }
          
          .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: none !important;
          }
          
          .bg-white\/80 {
            background: white !important;
          }
          
          .border-white\/20 {
            border-color: #e5e7eb !important;
          }
          
          /* CRITICAL: Remove all scrolling and height restrictions */
          .overflow-hidden {
            overflow: visible !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
          }
          
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          .max-h-96, .max-h-80, .max-h-64, .max-h-48, .max-h-32 {
            max-height: none !important;
          }
          
          .h-96, .h-80, .h-64, .h-48, .h-32 {
            height: auto !important;
          }
          
          .scrollbar-hide {
            scrollbar-width: none !important;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none !important;
          }
          
          /* Ensure all content is visible */
          .min-h-screen {
            min-height: auto !important;
          }
          
          .h-screen {
            height: auto !important;
          }
          
          /* Force all content to be visible */
          div, section, article {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          
          /* Ensure tables and lists are fully visible */
          table {
            width: 100% !important;
            font-size: 9px !important;
          }
          
          th, td {
            padding: 2px 4px !important;
            border: 1px solid #e5e7eb !important;
          }
          
          ul, ol {
            margin: 0 0 6px 0 !important;
            padding-left: 16px !important;
          }
          
          li {
            margin-bottom: 2px !important;
          }
          
          /* Ensure all SEO tool sections are visible */
          [class*="tool-"], [class*="analysis-"], [class*="report-"] {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            display: block !important;
          }
        }
      `;
      element.appendChild(style);

      html2pdf()
        .set({
          margin: [0.2, 0.2, 0.2, 0.2],
          filename: `${project.title}_SEO_Report.pdf`,
          html2canvas: { 
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true,
            precision: 16
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after'
          }
        })
        .from(element)
        .save()
        .catch((err: Error) => {
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
                        <div className="overflow-visible">
                          {reportData && typeof reportData === 'object' ? (
                            <div className="space-y-2">
                              {Object.entries(reportData).map(([key, value]) => (
                                <div key={key} className="border-b border-gray-100 pb-2 last:border-b-0">
                                  <div className="font-medium text-gray-800 text-xs capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {typeof value === 'object' ? (
                                      <pre className="whitespace-pre-wrap text-xs">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    ) : (
                                      <span>{String(value)}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(reportData, null, 2)}
                            </pre>
                          )}
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