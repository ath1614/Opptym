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
        // Calculate penalty based on severity levels
        const highPriority = report.severityCounts?.high || 0;
        const mediumPriority = report.severityCounts?.medium || 0;
        const lowPriority = report.severityCounts?.low || 0;
        
        // High priority links (malware, financial, government) are more critical
        score -= highPriority * 3;
        score -= mediumPriority * 2;
        score -= lowPriority * 1;
        
        // Add specific suggestions based on categories
        if (highPriority > 0) {
          suggestions.push(`Fix ${highPriority} high-priority broken links (malware, financial, government)`);
        }
        if (mediumPriority > 0) {
          suggestions.push(`Update ${mediumPriority} medium-priority broken links`);
        }
        if (lowPriority > 0) {
          suggestions.push(`Review ${lowPriority} low-priority broken links`);
        }
        
        // Special warning for malware links
        if (report.categories?.malware && report.categories.malware.length > 0) {
          suggestions.push('🚨 MALWARE LINKS DETECTED - Immediate security review required');
        }
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title Length</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.titleLength || 0} chars</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description Length</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.descriptionLength || 0} chars</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords Found</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.keywords?.length || 0}</div>
              </div>
            </div>
            {reportData.suggestions && reportData.suggestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Suggestions:</div>
                <div className="space-y-1">
                  {reportData.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start space-x-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}.</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'keywordDensityReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Words</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.totalWords?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords Analyzed</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.keywordStats?.length || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Density</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.keywordStats?.length > 0 
                    ? `${(reportData.keywordStats.reduce((sum: number, kw: any) => 
                        sum + parseFloat(kw.density.replace('%', '')), 0) / reportData.keywordStats.length).toFixed(2)}%`
                    : '0%'}
                </div>
              </div>
            </div>
            {reportData.keywordStats && reportData.keywordStats.length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyword Analysis:</div>
                <div className="space-y-2">
                  {reportData.keywordStats.slice(0, 5).map((kw: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-800 dark:text-white">{kw.keyword}</span>
                      <span className="text-gray-600 dark:text-gray-400">{kw.density} ({kw.count} times)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'backlinkReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Backlinks</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.totalExternal || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unique Domains</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.domainsLinkingIn || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Links/Domain</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.domainsLinkingIn > 0 ? Math.round((reportData.totalExternal || 0) / reportData.domainsLinkingIn) : 0}
                </div>
              </div>
            </div>
            {reportData.domains && Object.keys(reportData.domains).length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Linking Domains:</div>
                <div className="space-y-1">
                  {Object.entries(reportData.domains).slice(0, 5).map(([domain, anchors]: [string, any], index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-800 dark:text-white">{domain}</span>
                      <span className="text-gray-600 dark:text-gray-400">{Array.isArray(anchors) ? anchors.length : 0} links</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'brokenLinksReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Links</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.totalLinks || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broken Links</div>
                <div className="text-lg font-bold text-red-600">{reportData.brokenCount || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Score</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.overallHealthScore || (reportData.totalLinks > 0 
                    ? `${Math.round(((reportData.totalLinks - (reportData.brokenCount || 0)) / reportData.totalLinks) * 100)}%`
                    : 'N/A')}
                </div>
              </div>
            </div>
            
            {/* Severity Breakdown */}
            {reportData.severityCounts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 mb-1">High Priority</div>
                  <div className="text-lg font-bold text-red-600">{reportData.severityCounts.high || 0}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Medium Priority</div>
                  <div className="text-lg font-bold text-yellow-600">{reportData.severityCounts.medium || 0}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-800 mb-1">Low Priority</div>
                  <div className="text-lg font-bold text-blue-600">{reportData.severityCounts.low || 0}</div>
                </div>
              </div>
            )}
            
            {/* Categories Breakdown */}
            {reportData.categories && Object.keys(reportData.categories).length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 mb-3">Broken Links by Category:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(reportData.categories).map(([category, links]: [string, any]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          category === 'malware' ? 'bg-red-500' :
                          category === 'financial' || category === 'government' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></span>
                        <span className="text-sm font-medium text-gray-800 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{links.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Detailed Broken Links */}
            {reportData.brokenLinks && reportData.brokenLinks.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Detailed Analysis:</div>
                {reportData.brokenLinks.slice(0, 5).map((link: any, index: number) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-800 truncate">{link.url}</div>
                        <div className="text-xs text-red-600 mt-1">
                          {link.text && link.text !== 'No text' ? `"${link.text}"` : 'No link text'}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        link.priority === 'high' ? 'bg-red-200 text-red-800' :
                        link.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {link.priority} priority
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="text-xs font-medium text-gray-800 capitalize">
                          {link.classification?.category?.replace(/([A-Z])/g, ' $1').trim() || 'General'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Severity:</span>
                        <span className={`text-xs font-medium ${
                          link.classification?.severity === 'high' ? 'text-red-600' :
                          link.classification?.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {link.classification?.severity || 'low'}
                        </span>
                      </div>
                      
                      {link.recommendations && link.recommendations.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Recommendations:</div>
                          <ul className="space-y-1">
                            {link.recommendations.slice(0, 2).map((rec: string, recIndex: number) => (
                              <li key={recIndex} className="text-xs text-red-700 flex items-start space-x-1">
                                <span className="text-red-600">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {reportData.brokenLinks.length > 5 && (
                  <div className="text-sm text-gray-600 text-center">
                    ... and {reportData.brokenLinks.length - 5} more broken links
                  </div>
                )}
              </div>
            )}
            
            {/* Overall Recommendations */}
            {reportData.recommendations && reportData.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-2">Overall Recommendations:</div>
                <ul className="space-y-2">
                  {reportData.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'sitemapReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sitemap Status</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.sitemapStatus || 'Not Found'}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Robots Status</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.robotsStatus || 'Not Found'}</div>
              </div>
            </div>
            {reportData.crawlRules && reportData.crawlRules.length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crawl Rules:</div>
                <div className="space-y-1">
                  {reportData.crawlRules.slice(0, 5).map((rule: string, index: number) => (
                    <div key={index} className="text-sm text-gray-700">{rule}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'robotsReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Robots.txt Status</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.robotsStatus || 'Not Found'}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crawl Rules</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.crawlRules?.length || 0}</div>
              </div>
            </div>
          </div>
        );

      case 'keywordTrackerReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords Tracked</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.results?.length || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords Found</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.results?.filter((r: any) => r.found).length || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Success Rate</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.results?.length > 0 
                    ? `${Math.round((reportData.results.filter((r: any) => r.found).length / reportData.results.length) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>
            {reportData.results && reportData.results.length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyword Rankings:</div>
                <div className="space-y-2">
                  {reportData.results.slice(0, 5).map((result: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-800 dark:text-white">{result.keyword}</span>
                      <span className={`font-bold ${result.found ? 'text-green-600' : 'text-red-600'}`}>
                        {result.found ? `Position ${result.position}` : 'Not in top 10'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'pageSpeedReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Performance Score</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.score || 0}/100</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Contentful Paint</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.metrics?.firstContentfulPaint || 0}ms</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Largest Contentful Paint</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.metrics?.largestContentfulPaint || 0}ms</div>
              </div>
            </div>
            {reportData.metrics?.cumulativeLayoutShift && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cumulative Layout Shift</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.metrics.cumulativeLayoutShift.toFixed(3)}</div>
              </div>
            )}
          </div>
        );

      case 'mobileAuditReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Friendly</div>
                <div className={`text-lg font-bold ${reportData.audit?.isMobileFriendly ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.audit?.isMobileFriendly ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Viewport Meta</div>
                <div className={`text-lg font-bold ${reportData.audit?.hasViewportMeta ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.audit?.hasViewportMeta ? 'Present' : 'Missing'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Small Tap Targets</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.audit?.smallTapTargets || 0}</div>
              </div>
            </div>
          </div>
        );

      case 'competitorReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords Analyzed</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.results?.length || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Competitors</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.results?.reduce((acc: number, result: any) => acc + (result.competitors?.length || 0), 0) || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Competitors/Keyword</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.results?.length > 0 
                    ? Math.round(reportData.results.reduce((acc: number, result: any) => acc + (result.competitors?.length || 0), 0) / reportData.results.length)
                    : 0}
                </div>
              </div>
            </div>
          </div>
        );

      case 'technicalAuditReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title Present</div>
                <div className={`text-lg font-bold ${reportData.audit?.title ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.audit?.title ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</div>
                <div className={`text-lg font-bold ${reportData.audit?.metaDescription ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.audit?.metaDescription ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">H1 Count</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.audit?.h1Count || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Links</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.audit?.internalLinks || 0}</div>
              </div>
            </div>
            {reportData.issues && reportData.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800 mb-2">Technical Issues Found:</div>
                <div className="space-y-1">
                  {reportData.issues.slice(0, 3).map((issue: string, index: number) => (
                    <div key={index} className="text-sm text-red-700">{issue}</div>
                  ))}
                  {reportData.issues.length > 3 && (
                    <div className="text-sm text-red-600">
                      ... and {reportData.issues.length - 3} more issues
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'schemaReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schema Found</div>
                <div className={`text-lg font-bold ${reportData.found ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.found ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schema Types</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.schemaTypes?.length || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Validation Errors</div>
                <div className="text-lg font-bold text-red-600">{reportData.errors?.length || 0}</div>
              </div>
            </div>
            {reportData.schemaTypes && reportData.schemaTypes.length > 0 && (
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema Types Found:</div>
                <div className="space-y-1">
                  {reportData.schemaTypes.map((type: string, index: number) => (
                    <div key={index} className="text-sm text-gray-700">{type}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'altTextReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Images</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.audit?.totalImages || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Missing Alt Text</div>
                <div className="text-lg font-bold text-red-600">{reportData.audit?.missingAltCount || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coverage</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.audit?.totalImages > 0 
                    ? `${Math.round(((reportData.audit.totalImages - (reportData.audit.missingAltCount || 0)) / reportData.audit.totalImages) * 100)}%`
                    : 'N/A'}
                </div>
              </div>
            </div>
            {reportData.audit?.imagesMissingAlt && reportData.audit.imagesMissingAlt.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800 mb-2">Images Missing Alt Text:</div>
                <div className="space-y-1">
                  {reportData.audit.imagesMissingAlt.slice(0, 3).map((image: string, index: number) => (
                    <div key={index} className="text-sm text-red-700">{image}</div>
                  ))}
                  {reportData.audit.imagesMissingAlt.length > 3 && (
                    <div className="text-sm text-red-600">
                      ... and {reportData.audit.imagesMissingAlt.length - 3} more images
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'canonicalReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canonical Present</div>
                <div className={`text-lg font-bold ${reportData.canonicalUrl !== 'Not found' ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.canonicalUrl !== 'Not found' ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issues Found</div>
                <div className="text-lg font-bold text-red-600">{reportData.issues?.length || 0}</div>
              </div>
            </div>
            {reportData.issues && reportData.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800 mb-2">Canonical Issues:</div>
                <div className="space-y-1">
                  {reportData.issues.map((issue: string, index: number) => (
                    <div key={index} className="text-sm text-red-700">{issue}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'keywordResearcherReport':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Keywords</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.analysis?.totalKeywords || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Search Volume</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.analysis?.avgSearchVolume?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Competition</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{reportData.analysis?.avgCompetition || 0}</div>
              </div>
            </div>
            {reportData.recommendations && reportData.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800 mb-2">Recommendations:</div>
                <div className="space-y-1">
                  {reportData.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <div key={index} className="text-sm text-blue-700">{rec}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-primary-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Results:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {reportData && typeof reportData === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(reportData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{project.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{project.url}</p>
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

        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.submissions?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{project.submissions?.filter(s => s.submissionType === 'Success').length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{project.submissions?.filter(s => s.submissionType === 'Pending').length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{project.submissions && project.submissions.length > 0 ? `${Math.round((project.submissions.filter(s => s.submissionType === 'Success').length / project.submissions.length) * 100)}%` : '0%'}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div ref={reportRef}>
          {/* Project Information */}
          <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Project Information</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Basic project details and metadata</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">URL:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{project.url}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{project.category || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Target Keywords:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {project.targetKeywords?.join(', ') || 'Not specified'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Meta Title:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {project.metaTitle || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Keywords:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {project.keywords?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sitemap:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {project.sitemapUrl || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Score */}
          <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">SEO Performance Score</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall performance and optimization score</p>
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
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{score}/10</div>
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
            <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">SEO Tool Reports</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{usedTools.length} tool(s) analyzed</p>
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
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{config.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
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
            <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Submissions</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.submissions.length} submission(s) logged</p>
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
            <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-12 text-center">
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