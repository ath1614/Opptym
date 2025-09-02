/**
 * CSV Export Utility for SEO Tools
 * Provides consistent CSV export functionality across all tools
 */

export interface CSVExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  headers?: string[];
}

/**
 * Convert data to CSV format (RFC 4180 compliant)
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first data object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape and quote CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Create CSV header row
  const headerRow = csvHeaders.map(header => escapeCSVValue(header)).join(',');
  
  // Create CSV data rows
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeCSVValue(row[header])).join(',')
  );

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'export'): void {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV with automatic filename generation
 */
export function exportToCSV(
  data: any[], 
  toolName: string, 
  options: CSVExportOptions = {}
): void {
  const {
    filename,
    includeTimestamp = true,
    headers
  } = options;

  // Generate filename
  let finalFilename = filename || toolName;
  if (includeTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    finalFilename = `${finalFilename}_${timestamp}`;
  }

  // Convert data to CSV
  const csvContent = convertToCSV(data, headers);
  
  // Download file
  downloadCSV(csvContent, finalFilename);
}

/**
 * Tool-specific CSV export functions
 */

// Meta Tag Analyzer
export function exportMetaAnalysis(data: any[]): void {
  const headers = ['URL', 'Meta Title', 'Meta Description', 'Title Length', 'Description Length', 'Issues'];
  exportToCSV(data, 'meta_analysis', { headers });
}

// Keyword Density
export function exportKeywordDensity(data: any[]): void {
  const headers = ['Keyword', 'Count', 'Density (%)', 'Position', 'Context'];
  exportToCSV(data, 'keyword_density', { headers });
}

// Keyword Research
export function exportKeywordResearch(data: any[]): void {
  const headers = ['Keyword', 'Search Volume', 'Competition', 'CPC', 'Trend'];
  exportToCSV(data, 'keyword_research', { headers });
}

// Broken Links
export function exportBrokenLinks(data: any[]): void {
  const headers = ['URL', 'Status Code', 'Error Message', 'Page URL', 'Link Text'];
  exportToCSV(data, 'broken_links', { headers });
}

// Sitemap & Robots
export function exportSitemapRobots(data: any[]): void {
  const headers = ['Type', 'URL', 'Status', 'Issues', 'Last Checked'];
  exportToCSV(data, 'sitemap_robots', { headers });
}

// Backlinks
export function exportBacklinks(data: any[]): void {
  const headers = ['Source URL', 'Anchor Text', 'Domain Authority', 'Spam Score', 'First Seen'];
  exportToCSV(data, 'backlinks', { headers });
}

// Keyword Tracker
export function exportKeywordTracker(data: any[]): void {
  const headers = ['Keyword', 'Position', 'Previous Position', 'Change', 'Search Volume', 'Date'];
  exportToCSV(data, 'keyword_tracker', { headers });
}

// Page Speed
export function exportPageSpeed(data: any[]): void {
  const headers = ['URL', 'Performance Score', 'Largest Contentful Paint', 'First Input Delay', 'Cumulative Layout Shift'];
  exportToCSV(data, 'page_speed', { headers });
}

// Mobile Audit
export function exportMobileAudit(data: any[]): void {
  const headers = ['URL', 'Mobile Score', 'Viewport Issues', 'Touch Target Issues', 'Font Size Issues'];
  exportToCSV(data, 'mobile_audit', { headers });
}

// Competitor Analysis
export function exportCompetitorAnalysis(data: any[]): void {
  const headers = ['Competitor', 'Domain', 'Keywords', 'Traffic', 'Backlinks', 'Domain Authority'];
  exportToCSV(data, 'competitor_analysis', { headers });
}

// Technical Audit
export function exportTechnicalAudit(data: any[]): void {
  const headers = ['Issue', 'Severity', 'Description', 'Recommendation', 'URL'];
  exportToCSV(data, 'technical_audit', { headers });
}

// Schema Validator
export function exportSchemaValidation(data: any[]): void {
  const headers = ['Schema Type', 'URL', 'Validation Status', 'Errors', 'Warnings'];
  exportToCSV(data, 'schema_validation', { headers });
}

// Alt Text Checker
export function exportAltTextCheck(data: any[]): void {
  const headers = ['Image URL', 'Alt Text', 'Status', 'Recommendation', 'Page URL'];
  exportToCSV(data, 'alt_text_check', { headers });
}

// Canonical Checker
export function exportCanonicalCheck(data: any[]): void {
  const headers = ['URL', 'Canonical URL', 'Status', 'Issues', 'Recommendation'];
  exportToCSV(data, 'canonical_check', { headers });
}

/**
 * Generic CSV export for any tool data
 */
export function exportToolData(
  data: any[],
  toolName: string,
  customHeaders?: string[]
): void {
  if (customHeaders) {
    exportToCSV(data, toolName, { headers: customHeaders });
  } else {
    exportToCSV(data, toolName);
  }
}
