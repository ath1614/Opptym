/**
 * Shared CSV Export Utility for SEO Tools
 * This utility can be used across all 14 SEO tools to export results in CSV format
 */

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  includeTimestamp?: boolean;
  customFormatters?: Record<string, (value: any) => string>;
}

/**
 * Convert data to CSV format and trigger download
 */
export function exportToCSV(
  data: any[], 
  options: CSVExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const {
    filename = 'seo-tool-export',
    headers,
    includeTimestamp = true,
    customFormatters = {}
  } = options;

  try {
    const csvContent = convertToCSV(data, headers, customFormatters);
    
    const timestamp = includeTimestamp 
      ? new Date().toISOString().split('T')[0] 
      : '';
    
    const finalFilename = timestamp 
      ? `${filename}-${timestamp}.csv`
      : `${filename}.csv`;

    downloadCSV(csvContent, finalFilename);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(
  data: any[], 
  customHeaders?: string[], 
  formatters: Record<string, (value: any) => string> = {}
): string {
  if (data.length === 0) return '';

  // Determine headers
  const headers = customHeaders || Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.map(escapeCSVValue).join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Apply custom formatter if available
      if (formatters[header]) {
        value = formatters[header](value);
      } else {
        // Default formatting
        value = formatValue(value);
      }
      
      return escapeCSVValue(value);
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Format value for CSV export
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return String(value);
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
}

/**
 * Trigger file download
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export SEO Tool specific data formats
 */
export const SEOToolExporters = {
  /**
   * Export Keyword Research results
   */
  keywordResearch: (data: any[]) => {
    const formatters = {
      searchVolume: (value: number) => value?.toLocaleString() || '0',
      difficulty: (value: number) => `${value}%`,
      cpc: (value: number) => `$${value?.toFixed(2) || '0.00'}`,
      trends: (value: any[]) => value?.map(t => `${t.month}: ${t.volume}`).join('; ') || ''
    };

    exportToCSV(data, {
      filename: 'keyword-research',
      customFormatters: formatters,
      headers: ['keyword', 'searchVolume', 'difficulty', 'cpc', 'competition', 'trends']
    });
  },

  /**
   * Export Meta Tag Analyzer results
   */
  metaAnalyzer: (data: any[]) => {
    const formatters = {
      isOptimized: (value: boolean) => value ? 'Optimized' : 'Needs Improvement',
      length: (value: number) => `${value} characters`
    };

    exportToCSV(data, {
      filename: 'meta-analysis',
      customFormatters: formatters,
      headers: ['page', 'title', 'titleLength', 'description', 'descriptionLength', 'isOptimized', 'suggestions']
    });
  },

  /**
   * Export Page Speed results
   */
  pageSpeed: (data: any[]) => {
    const formatters = {
      score: (value: number) => `${value}/100`,
      loadTime: (value: number) => `${value?.toFixed(2)}s`,
      metrics: (value: any) => Object.entries(value || {}).map(([k, v]) => `${k}: ${v}`).join('; ')
    };

    exportToCSV(data, {
      filename: 'page-speed-analysis',
      customFormatters: formatters,
      headers: ['url', 'score', 'loadTime', 'fcp', 'lcp', 'cls', 'fid', 'recommendations']
    });
  },

  /**
   * Export Backlink Checker results
   */
  backlinkChecker: (data: any[]) => {
    const formatters = {
      domainAuthority: (value: number) => `${value}/100`,
      isDoFollow: (value: boolean) => value ? 'DoFollow' : 'NoFollow',
      anchorText: (value: string) => value || 'No Anchor Text'
    };

    exportToCSV(data, {
      filename: 'backlink-analysis',
      customFormatters: formatters,
      headers: ['sourceUrl', 'targetUrl', 'anchorText', 'domainAuthority', 'isDoFollow', 'dateFound', 'status']
    });
  },

  /**
   * Export Broken Link Finder results
   */
  brokenLinkFinder: (data: any[]) => {
    exportToCSV(data, {
      filename: 'broken-links',
      headers: ['url', 'sourceUrl', 'linkText', 'statusCode', 'errorType', 'lastChecked']
    });
  },

  /**
   * Export Sitemap Validator results
   */
  sitemapValidator: (data: any[]) => {
    const formatters = {
      isValid: (value: boolean) => value ? 'Valid' : 'Invalid',
      lastModified: (value: string) => value ? new Date(value).toLocaleDateString() : 'Unknown'
    };

    exportToCSV(data, {
      filename: 'sitemap-validation',
      customFormatters: formatters,
      headers: ['url', 'isValid', 'lastModified', 'priority', 'changeFreq', 'issues']
    });
  },

  /**
   * Export Robots.txt Checker results
   */
  robotsTxtChecker: (data: any[]) => {
    exportToCSV(data, {
      filename: 'robots-txt-analysis',
      headers: ['url', 'hasRobotsTxt', 'userAgents', 'disallowed', 'allowed', 'sitemaps', 'issues']
    });
  },

  /**
   * Export Keyword Density results
   */
  keywordDensity: (data: any[]) => {
    const formatters = {
      density: (value: number) => `${value?.toFixed(2)}%`,
      count: (value: number) => value?.toString() || '0'
    };

    exportToCSV(data, {
      filename: 'keyword-density',
      customFormatters: formatters,
      headers: ['keyword', 'count', 'density', 'isOverOptimized', 'recommendations']
    });
  },

  /**
   * Export Competitor Analysis results
   */
  competitorAnalysis: (data: any[]) => {
    const formatters = {
      organicKeywords: (value: number) => value?.toLocaleString() || '0',
      organicTraffic: (value: number) => value?.toLocaleString() || '0',
      domainAuthority: (value: number) => `${value}/100`
    };

    exportToCSV(data, {
      filename: 'competitor-analysis',
      customFormatters: formatters,
      headers: ['domain', 'organicKeywords', 'organicTraffic', 'domainAuthority', 'topKeywords', 'gapKeywords']
    });
  },

  /**
   * Export Mobile Audit results
   */
  mobileAudit: (data: any[]) => {
    const formatters = {
      isMobileFriendly: (value: boolean) => value ? 'Mobile Friendly' : 'Not Mobile Friendly',
      score: (value: number) => `${value}/100`
    };

    exportToCSV(data, {
      filename: 'mobile-audit',
      customFormatters: formatters,
      headers: ['url', 'isMobileFriendly', 'score', 'viewport', 'textSize', 'touchElements', 'issues']
    });
  },

  /**
   * Export Schema Validator results
   */
  schemaValidator: (data: any[]) => {
    const formatters = {
      isValid: (value: boolean) => value ? 'Valid' : 'Invalid',
      schemas: (value: any[]) => value?.map(s => s.type).join('; ') || 'None'
    };

    exportToCSV(data, {
      filename: 'schema-validation',
      customFormatters: formatters,
      headers: ['url', 'isValid', 'schemas', 'errors', 'warnings', 'recommendations']
    });
  },

  /**
   * Export Canonical URL Checker results
   */
  canonicalChecker: (data: any[]) => {
    const formatters = {
      hasCanonical: (value: boolean) => value ? 'Has Canonical' : 'No Canonical',
      isValid: (value: boolean) => value ? 'Valid' : 'Invalid'
    };

    exportToCSV(data, {
      filename: 'canonical-analysis',
      customFormatters: formatters,
      headers: ['url', 'canonicalUrl', 'hasCanonical', 'isValid', 'issues', 'recommendations']
    });
  },

  /**
   * Export Alt Text Analyzer results
   */
  altTextAnalyzer: (data: any[]) => {
    const formatters = {
      hasAltText: (value: boolean) => value ? 'Has Alt Text' : 'Missing Alt Text',
      isOptimized: (value: boolean) => value ? 'Optimized' : 'Needs Improvement'
    };

    exportToCSV(data, {
      filename: 'alt-text-analysis',
      customFormatters: formatters,
      headers: ['url', 'imageUrl', 'altText', 'hasAltText', 'isOptimized', 'suggestions']
    });
  },

  /**
   * Export Technical Audit results
   */
  technicalAudit: (data: any[]) => {
    const formatters = {
      score: (value: number) => `${value}/100`,
      issues: (value: any[]) => value?.length?.toString() || '0'
    };

    exportToCSV(data, {
      filename: 'technical-audit',
      customFormatters: formatters,
      headers: ['url', 'score', 'issues', 'criticalIssues', 'warnings', 'suggestions', 'auditDate']
    });
  },

  /**
   * Export SEO Score Calculator results
   */
  seoScoreCalculator: (data: any[]) => {
    const formatters = {
      overallScore: (value: number) => `${value}/100`,
      onPageScore: (value: number) => `${value}/100`,
      technicalScore: (value: number) => `${value}/100`,
      contentScore: (value: number) => `${value}/100`
    };

    exportToCSV(data, {
      filename: 'seo-score-report',
      customFormatters: formatters,
      headers: ['url', 'overallScore', 'onPageScore', 'technicalScore', 'contentScore', 'strengths', 'improvements']
    });
  }
};

/**
 * Create Google Sheets compatible CSV
 */
export function exportToGoogleSheets(data: any[], options: CSVExportOptions = {}): void {
  // Google Sheets specific formatting
  const sheetsOptions = {
    ...options,
    filename: options.filename || 'google-sheets-export',
    customFormatters: {
      ...options.customFormatters,
      // Add any Google Sheets specific formatters here
    }
  };

  exportToCSV(data, sheetsOptions);
}
