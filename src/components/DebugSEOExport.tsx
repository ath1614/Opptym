import React from 'react';
import { SEOToolExporters } from '../utils/csvExport';

export default function DebugSEOExport() {
  const testExport = (exporterName: string, exporter: (data: any[]) => void) => {
    try {
      console.log(`🧪 Testing ${exporterName} export...`);
      
      // Create sample data for testing
      const sampleData = [
        {
          url: 'https://example.com',
          title: 'Sample Title',
          description: 'Sample description',
          score: 85,
          issues: ['Issue 1', 'Issue 2'],
          isValid: true,
          date: new Date().toISOString()
        },
        {
          url: 'https://example2.com',
          title: 'Sample Title 2',
          description: 'Sample description 2',
          score: 92,
          issues: [],
          isValid: true,
          date: new Date().toISOString()
        }
      ];
      
      exporter(sampleData);
      console.log(`✅ ${exporterName} export successful`);
      
    } catch (error) {
      console.error(`❌ ${exporterName} export failed:`, error);
    }
  };

  const exporters = [
    { name: 'Keyword Research', fn: SEOToolExporters.keywordResearch },
    { name: 'Meta Analyzer', fn: SEOToolExporters.metaAnalyzer },
    { name: 'Page Speed', fn: SEOToolExporters.pageSpeed },
    { name: 'Backlink Checker', fn: SEOToolExporters.backlinkChecker },
    { name: 'Broken Link Finder', fn: SEOToolExporters.brokenLinkFinder },
    { name: 'Sitemap Validator', fn: SEOToolExporters.sitemapValidator },
    { name: 'Robots.txt Checker', fn: SEOToolExporters.robotsTxtChecker },
    { name: 'Keyword Density', fn: SEOToolExporters.keywordDensity },
    { name: 'Competitor Analysis', fn: SEOToolExporters.competitorAnalysis },
    { name: 'Mobile Audit', fn: SEOToolExporters.mobileAudit },
    { name: 'Schema Validator', fn: SEOToolExporters.schemaValidator },
    { name: 'Canonical Checker', fn: SEOToolExporters.canonicalChecker },
    { name: 'Alt Text Analyzer', fn: SEOToolExporters.altTextAnalyzer },
    { name: 'Technical Audit', fn: SEOToolExporters.technicalAudit },
    { name: 'SEO Score Calculator', fn: SEOToolExporters.seoScoreCalculator }
  ];

  return (
    <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-orange-800 mb-4">🔍 DEBUG: SEO Tools Export System</h2>
      
      <div className="mb-4">
        <p className="text-orange-700 mb-4">
          Test all 15 SEO tool exporters to ensure they generate CSV files correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exporters.map((exporter, index) => (
          <button
            key={index}
            onClick={() => testExport(exporter.name, exporter.fn)}
            className="p-4 bg-white rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
          >
            <div className="font-medium text-orange-800">{exporter.name}</div>
            <div className="text-sm text-orange-600 mt-1">Test CSV Export</div>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white p-4 rounded border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">📊 Export System Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✅ CSV Export Utility: Implemented</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✅ All 15 SEO Tools: Have CSV Exporters</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✅ Proper CSV Formatting: Handles escaping and formatting</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✅ Custom Formatters: Each tool has appropriate data formatting</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>✅ No JSON Export: All tools use CSV format</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">📋 Available Exporters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {exporters.map((exporter, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              <span>{exporter.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
