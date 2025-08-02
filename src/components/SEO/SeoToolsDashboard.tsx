import React, { useState } from 'react';
import MetaAnalyzer from './MetaAnalyzer';
import KeywordDensityTool from './KeywordDensityTool';
import BrokenLinkTool from './BrokenLinkTool';
import SitemapRobotsTool from './SitemapRobotsTool';
import ToolCard from './ToolCard';
import MobileAuditTool from './MobileAuditTool';
import TechnicalAuditTool from './TechnicalAuditTool';
import SchemaValidatorTool from './SchemaValidatorTool';
import AltTextTool from './AltTextTool';
import CanonicalTool from './CanonicalTool';
import {
  FileText, Search, Link, BarChart, BookOpen,
  Zap,
  Smartphone,
  Globe,
  Bug,
  Code,
  Image,
  Link2
} from 'lucide-react';
import BacklinkTool from './BacklinkTool';
import KeywordTrackerTool from './KeywordTrackerTool';
import PageSpeedTool from './PageSpeedTool';
import CompetitorTool from './CompetitorTool';
const tools = [
  {
    key: 'meta',
    name: 'Meta Tag Analyzer',
    description: 'Analyze your site’s meta title and description.',
    icon: <FileText className="w-5 h-5 text-purple-600" />
  },
  {
    key: 'keyword-density',
    name: 'Keyword Density Checker',
    description: 'Evaluate keyword usage and relevance.',
    icon: <Search className="w-5 h-5 text-green-600" />
  },
  {
    key: 'broken-links',
    name: 'Broken Link Scanner',
    description: 'Identify dead outbound links on your site.',
    icon: <Link className="w-5 h-5 text-red-600" />
  },
  {
    key: 'sitemap-robots',
    name: 'Sitemap & Robots Checker',
    description: 'Parse crawl rules and sitemap status',
    icon: <BookOpen className="w-5 h-5 text-indigo-600" />
  },
  {
    key: 'backlinks',
    name: 'Backlink Scanner',
    description: 'Check external domains linking to your page.',
    icon: <Link className="w-5 h-5 text-blue-600" />
  },
  {
    key: 'keyword-tracker',
    name: 'Keyword Tracker',
    description: 'Check where your domain ranks for keywords',
    icon: <Search className="w-5 h-5 text-teal-600" />
  },
  {
    key: 'page-speed',
    name: 'Page Speed Analyzer',
    description: 'Evaluate loading performance and timing metrics',
    icon: <Zap className="w-5 h-5 text-yellow-600" />
  },
  {
    key: 'mobile-audit',
    name: 'Mobile Checker',
    description: 'Check responsive design and tap usability',
    icon: <Smartphone className="w-5 h-5 text-pink-600" />
  },
  {
    key: 'competitor',
    name: 'Competitor Analyzer',
    description: 'Scrape competitors from SERP based on your keywords',
    icon: <Globe className="w-5 h-5 text-cyan-600" />
  },
  {
    key: 'technical-audit',
    name: 'Technical SEO Auditor',
    description: 'Check for common page-level SEO issues',
    icon: <Bug className="w-5 h-5 text-gray-700" />
  },
  {
    key: 'schema',
    name: 'Schema Validator',
    description: 'Check structured data for rich result compatibility',
    icon: <Code className="w-5 h-5 text-purple-700" />
  },
  {
    key: 'alt-text',
    name: 'Alt Text Checker',
    description: 'Find images without descriptive alt attributes',
    icon: <Image className="w-5 h-5 text-orange-600" />
  },
  {
    key: 'canonical',
    name: 'Canonical Checker',
    description: 'Validate canonical URLs and avoid duplicates',
    icon: <Link2 className="w-5 h-5 text-lime-600" />
  }
];

const SEOToolsDashboard = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleBack = () => setSelectedTool(null);

  return (
    <div className="p-6 space-y-6">
      {!selectedTool ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900">SEO Tools</h2>
          <p className="text-gray-600">Run diagnostics or view saved reports</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.key}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                onClick={() => setSelectedTool(tool.key)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className="text-sm text-blue-600 underline hover:text-blue-800 mb-4"
          >
            ← Back to Tools
          </button>

          {selectedTool === 'meta' && <MetaAnalyzer />}
          {selectedTool === 'keyword-density' && <KeywordDensityTool />}
          {selectedTool === 'broken-links' && <BrokenLinkTool />}
          {selectedTool === 'sitemap-robots' && <SitemapRobotsTool />}
          {selectedTool === 'backlinks' && <BacklinkTool />}
          {selectedTool === 'keyword-tracker' && <KeywordTrackerTool />}
          {selectedTool === 'page-speed' && <PageSpeedTool />}
          {selectedTool === 'mobile-audit' && <MobileAuditTool />}
          {selectedTool === 'competitor' && <CompetitorTool />}
          {selectedTool === 'technical-audit' && <TechnicalAuditTool />}
          {selectedTool === 'schema' && <SchemaValidatorTool />}
          {selectedTool === 'alt-text' && <AltTextTool />}
          {selectedTool === 'canonical' && <CanonicalTool />}

        </>
      )}
    </div>
  );
};

export default SEOToolsDashboard;
