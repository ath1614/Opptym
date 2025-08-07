import React, { useRef, useMemo } from 'react';
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
  ExternalLink,
  Star,
  Award,
  Shield,
  Activity
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
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
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
  keywordResearcherReport?: object;

  submissions?: Submission[];
  seoScore?: SEOScore;
};

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Calculate SEO Score based on available reports
  const calculatedSeoScore = useMemo(() => {
    const scores: Record<string, number> = {};
    let totalScore = 0;
    let totalTools = 0;
    const suggestions: string[] = [];

    // Meta Tag Analysis (0-10 points)
    if (project.metaTagReport) {
      const report = project.metaTagReport as any;
      let score = 10;
      if (!report.titleLength || report.titleLength < 30 || report.titleLength > 70) {
        score -= 3;
        suggestions.push('Optimize meta title length (30-70 characters)');
      }
      if (!report.descriptionLength || report.descriptionLength < 50 || report.descriptionLength > 160) {
        score -= 3;
        suggestions.push('Optimize meta description length (50-160 characters)');
      }
      if (!report.keywords || report.keywords.length === 0) {
        score -= 2;
        suggestions.push('Add relevant keywords to meta tags');
      }
      scores['Meta Tags'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Keyword Density (0-10 points)
    if (project.keywordDensityReport) {
      const report = project.keywordDensityReport as any;
      let score = 10;
      if (report.keywordStats) {
        const avgDensity = report.keywordStats.reduce((sum: number, kw: any) => 
          sum + parseFloat(kw.density.replace('%', '')), 0) / report.keywordStats.length;
        if (avgDensity < 0.5 || avgDensity > 2.5) {
          score -= 5;
          suggestions.push('Optimize keyword density (0.5-2.5%)');
        }
      }
      scores['Keyword Density'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Broken Links (0-10 points)
    if (project.brokenLinksReport) {
      const report = project.brokenLinksReport as any;
      let score = 10;
      if (report.brokenCount > 0) {
        score -= report.brokenCount * 2;
        suggestions.push(`Fix ${report.brokenCount} broken link(s)`);
      }
      scores['Broken Links'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Page Speed (0-10 points)
    if (project.pageSpeedReport) {
      const report = project.pageSpeedReport as any;
      let score = 10;
      if (report.score < 90) {
        score -= (90 - report.score) / 10;
        suggestions.push('Improve page loading speed');
      }
      scores['Page Speed'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Mobile Audit (0-10 points)
    if (project.mobileAuditReport) {
      const report = project.mobileAuditReport as any;
      let score = 10;
      if (!report.audit?.isMobileFriendly) {
        score -= 5;
        suggestions.push('Make website mobile-friendly');
      }
      if (!report.audit?.hasViewportMeta) {
        score -= 3;
        suggestions.push('Add viewport meta tag');
      }
      scores['Mobile Optimization'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Technical SEO (0-10 points)
    if (project.technicalAuditReport) {
      const report = project.technicalAuditReport as any;
      let score = 10;
      if (report.issues && report.issues.length > 0) {
        score -= report.issues.length * 2;
        suggestions.push(`Fix ${report.issues.length} technical SEO issue(s)`);
      }
      scores['Technical SEO'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Schema Markup (0-10 points)
    if (project.schemaReport) {
      const report = project.schemaReport as any;
      let score = 10;
      if (!report.found) {
        score -= 5;
        suggestions.push('Implement structured data markup');
      }
      if (report.errors && report.errors.length > 0) {
        score -= report.errors.length;
        suggestions.push('Fix schema markup errors');
      }
      scores['Schema Markup'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Alt Text (0-10 points)
    if (project.altTextReport) {
      const report = project.altTextReport as any;
      let score = 10;
      if (report.audit?.missingAltCount > 0) {
        score -= report.audit.missingAltCount;
        suggestions.push(`Add alt text to ${report.audit.missingAltCount} image(s)`);
      }
      scores['Alt Text'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Canonical Tags (0-10 points)
    if (project.canonicalReport) {
      const report = project.canonicalReport as any;
      let score = 10;
      if (!report.canonicalUrl || report.canonicalUrl === 'Not found') {
        score -= 5;
        suggestions.push('Add canonical URL tags');
      }
      if (report.issues && report.issues.length > 0) {
        score -= report.issues.length * 2;
        suggestions.push('Fix canonical tag issues');
      }
      scores['Canonical Tags'] = Math.max(0, score);
      totalScore += score;
      totalTools++;
    }

    // Calculate final score and grade
    const finalScore = totalTools > 0 ? Math.round(totalScore / totalTools) : 0;
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let color: string;

    if (finalScore >= 90) {
      grade = 'A';
      color = 'from-green-500 to-emerald-600';
    } else if (finalScore >= 80) {
      grade = 'B';
      color = 'from-blue-500 to-cyan-600';
    } else if (finalScore >= 70) {
      grade = 'C';
      color = 'from-yellow-500 to-orange-600';
    } else if (finalScore >= 60) {
      grade = 'D';
      color = 'from-orange-500 to-red-600';
    } else {
      grade = 'F';
      color = 'from-red-500 to-pink-600';
    }

    return {
      total: finalScore,
      breakdown: scores,
      suggestions: suggestions.slice(0, 5), // Limit to top 5 suggestions
      grade,
      color
    };
  }, [project]);

  const downloadPDF = () => {
    if (reportRef.current) {
      const element = reportRef.current.cloneNode(true) as HTMLElement;
      
      // Enhanced PDF-specific styles for professional layout
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
            font-size: 10px !important;
            line-height: 1.2 !important;
            font-family: Arial, sans-serif !important;
            color: #000 !important;
            background: white !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
          
          .page-break-after {
            page-break-after: always !important;
          }
          
          .no-break {
            page-break-inside: avoid !important;
          }
          
          /* Header styling */
          .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            padding: 20px !important;
            margin-bottom: 20px !important;
            border-radius: 8px !important;
          }
          
          .report-header h1 {
            font-size: 24px !important;
            margin: 0 0 10px 0 !important;
            font-weight: bold !important;
          }
          
          .report-header p {
            font-size: 14px !important;
            margin: 0 !important;
            opacity: 0.9 !important;
          }
          
          /* Section styling */
          .report-section {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            padding: 15px !important;
            margin-bottom: 15px !important;
            page-break-inside: avoid !important;
          }
          
          .section-header {
            border-bottom: 2px solid #3b82f6 !important;
            padding-bottom: 8px !important;
            margin-bottom: 12px !important;
          }
          
          .section-header h2 {
            font-size: 18px !important;
            font-weight: bold !important;
            color: #1f2937 !important;
            margin: 0 !important;
          }
          
          /* SEO Score styling */
          .seo-score {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
            color: white !important;
            padding: 20px !important;
            border-radius: 8px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          
          .seo-score .grade {
            font-size: 48px !important;
            font-weight: bold !important;
            margin: 0 !important;
          }
          
          .seo-score .score {
            font-size: 24px !important;
            margin: 5px 0 !important;
          }
          
          /* Metrics grid */
          .metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 10px !important;
            margin-bottom: 15px !important;
          }
          
          .metric-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            padding: 10px !important;
            text-align: center !important;
          }
          
          .metric-card .label {
            font-size: 11px !important;
            color: #64748b !important;
            margin-bottom: 5px !important;
          }
          
          .metric-card .value {
            font-size: 16px !important;
            font-weight: bold !important;
            color: #1f2937 !important;
          }
          
          /* Tool reports */
          .tool-report {
            background: #f9fafb !important;
            border: 1px solid #d1d5db !important;
            border-radius: 6px !important;
            padding: 12px !important;
            margin-bottom: 10px !important;
          }
          
          .tool-report h3 {
            font-size: 14px !important;
            font-weight: bold !important;
            color: #374151 !important;
            margin: 0 0 8px 0 !important;
          }
          
          .tool-report .details {
            font-size: 11px !important;
            color: #6b7280 !important;
          }
          
          /* Status indicators */
          .status-good {
            color: #059669 !important;
            font-weight: bold !important;
          }
          
          .status-warning {
            color: #d97706 !important;
            font-weight: bold !important;
          }
          
          .status-error {
            color: #dc2626 !important;
            font-weight: bold !important;
          }
          
          /* Tables */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 10px 0 !important;
            font-size: 10px !important;
          }
          
          th, td {
            border: 1px solid #d1d5db !important;
            padding: 6px 8px !important;
            text-align: left !important;
          }
          
          th {
            background: #f3f4f6 !important;
            font-weight: bold !important;
          }
          
          /* Lists */
          ul, ol {
            margin: 8px 0 !important;
            padding-left: 20px !important;
          }
          
          li {
            margin-bottom: 4px !important;
            font-size: 11px !important;
          }
          
          /* Hide unnecessary elements */
          .no-print {
            display: none !important;
          }
          
          /* Ensure all content is visible */
          .overflow-hidden, .overflow-y-auto, .overflow-x-auto {
            overflow: visible !important;
          }
          
          .max-h-96, .max-h-80, .max-h-64, .max-h-48, .max-h-32 {
            max-height: none !important;
          }
          
          .h-96, .h-80, .h-64, .h-48, .h-32 {
            height: auto !important;
          }
        }
      `;
      element.appendChild(style);

      html2pdf()
        .set({
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `${project.title}_SEO_Report_${new Date().toISOString().split('T')[0]}.pdf`,
          html2canvas: { 
            scale: 1.5,
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
    },
    keywordResearcherReport: {
      title: 'Keyword Research',
      icon: <Search className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-600',
      description: 'Keyword research and analysis'
    }
  };

  // Get only the tools that have been used (have data)
  const usedTools = Object.entries(toolConfigs).filter(([key]) => 
    project[key as keyof Project] && Object.keys(project[key as keyof Project] as object).length > 0
  );

  // Function to render tool-specific data in a structured way
  const renderToolData = (toolKey: string, reportData: any) => {
    const config = toolConfigs[toolKey as keyof typeof toolConfigs];
    
    switch (toolKey) {
      case 'metaTagReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Title Length</div>
              <div className="value">{reportData.titleLength || 0} chars</div>
            </div>
            <div className="metric-card">
              <div className="label">Description Length</div>
              <div className="value">{reportData.descriptionLength || 0} chars</div>
            </div>
            <div className="metric-card">
              <div className="label">Keywords Found</div>
              <div className="value">{reportData.keywords?.length || 0}</div>
            </div>
          </div>
        );

      case 'keywordDensityReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Total Words</div>
              <div className="value">{reportData.totalWords?.toLocaleString() || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Keywords Analyzed</div>
              <div className="value">{reportData.keywordStats?.length || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Avg Density</div>
              <div className="value">
                {reportData.keywordStats?.length > 0 
                  ? `${(reportData.keywordStats.reduce((sum: number, kw: any) => 
                      sum + parseFloat(kw.density.replace('%', '')), 0) / reportData.keywordStats.length).toFixed(2)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        );

      case 'brokenLinksReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Total Links</div>
              <div className="value">{reportData.totalLinks || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Broken Links</div>
              <div className="value">{reportData.brokenCount || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Health Score</div>
              <div className="value">
                {reportData.totalLinks > 0 
                  ? `${Math.round(((reportData.totalLinks - (reportData.brokenCount || 0)) / reportData.totalLinks) * 100)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        );

      case 'pageSpeedReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Performance Score</div>
              <div className="value">{reportData.score || 0}/100</div>
            </div>
            <div className="metric-card">
              <div className="label">First Contentful Paint</div>
              <div className="value">{reportData.metrics?.firstContentfulPaint || 0}ms</div>
            </div>
            <div className="metric-card">
              <div className="label">Largest Contentful Paint</div>
              <div className="value">{reportData.metrics?.largestContentfulPaint || 0}ms</div>
            </div>
          </div>
        );

      case 'mobileAuditReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Mobile Friendly</div>
              <div className="value">{reportData.audit?.isMobileFriendly ? 'Yes' : 'No'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Viewport Meta</div>
              <div className="value">{reportData.audit?.hasViewportMeta ? 'Present' : 'Missing'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Small Tap Targets</div>
              <div className="value">{reportData.audit?.smallTapTargets || 0}</div>
            </div>
          </div>
        );

      case 'technicalAuditReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Title Present</div>
              <div className="value">{reportData.audit?.title ? 'Yes' : 'No'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Meta Description</div>
              <div className="value">{reportData.audit?.metaDescription ? 'Yes' : 'No'}</div>
            </div>
            <div className="metric-card">
              <div className="label">H1 Count</div>
              <div className="value">{reportData.audit?.h1Count || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Internal Links</div>
              <div className="value">{reportData.audit?.internalLinks || 0}</div>
            </div>
          </div>
        );

      case 'schemaReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Schema Found</div>
              <div className="value">{reportData.found ? 'Yes' : 'No'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Schema Types</div>
              <div className="value">{reportData.schemaTypes?.length || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Validation Errors</div>
              <div className="value">{reportData.errors?.length || 0}</div>
            </div>
          </div>
        );

      case 'altTextReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Total Images</div>
              <div className="value">{reportData.audit?.totalImages || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Missing Alt Text</div>
              <div className="value">{reportData.audit?.missingAltCount || 0}</div>
            </div>
            <div className="metric-card">
              <div className="label">Coverage</div>
              <div className="value">
                {reportData.audit?.totalImages > 0 
                  ? `${Math.round(((reportData.audit.totalImages - (reportData.audit.missingAltCount || 0)) / reportData.audit.totalImages) * 100)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        );

      case 'canonicalReport':
        return (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="label">Canonical Present</div>
              <div className="value">{reportData.canonicalUrl !== 'Not found' ? 'Yes' : 'No'}</div>
            </div>
            <div className="metric-card">
              <div className="label">Issues Found</div>
              <div className="value">{reportData.issues?.length || 0}</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        );
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">SEO Performance Score</h2>
                <p className="text-sm text-gray-600">Overall performance and optimization score</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Score */}
              <div className={`bg-gradient-to-r ${calculatedSeoScore.color} rounded-xl p-6 text-white text-center`}>
                <div className="text-4xl font-bold mb-2">{calculatedSeoScore.grade}</div>
                <div className="text-2xl font-semibold">{calculatedSeoScore.total}/100</div>
                <div className="text-sm opacity-90 mt-2">Overall Score</div>
              </div>
              
              {/* Score Breakdown */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(calculatedSeoScore.breakdown).map(([tool, score]) => (
                    <div key={tool} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">{tool}</div>
                      <div className="text-xl font-bold text-gray-900">{score}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {calculatedSeoScore.suggestions && calculatedSeoScore.suggestions.length > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Top Improvement Suggestions:
                </h4>
                <ul className="space-y-2">
                  {calculatedSeoScore.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start space-x-2">
                      <span className="text-red-600 font-bold">{i + 1}.</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tool Reports */}
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
                      
                      {renderToolData(key, reportData)}
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