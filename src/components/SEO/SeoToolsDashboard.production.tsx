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
import KeywordResearcherTool from './KeywordResearcherTool';
import {
  FileText, Search, Link, BarChart, BookOpen,
  Zap,
  Smartphone,
  Globe,
  Bug,
  Code,
  Image,
  Link2,
  TrendingUp,
  ArrowLeft,
  Grid
} from 'lucide-react';
import BacklinkTool from './BacklinkTool';
import KeywordTrackerTool from './KeywordTrackerTool';
import PageSpeedTool from './PageSpeedTool';
import CompetitorTool from './CompetitorTool';

const tools = [
  {
    key: 'meta',
    name: 'Meta Tag Analyzer',
    description: 'Analyze your site\'s meta title and description.',
    icon: <FileText className="w-5 h-5 text-purple-600" />
  },
  {
    key: 'keyword-density',
    name: 'Keyword Density Checker',
    description: 'Evaluate keyword usage and relevance.',
    icon: <Search className="w-5 h-5 text-green-600" />
  },
  {
    key: 'keyword-research',
    name: 'Keyword Researcher',
    description: 'Discover new keywords with search volume and competition data.',
    icon: <TrendingUp className="w-5 h-5 text-emerald-600" />
  },
  {
    key: 'broken-links',
    name: 'Broken Link Checker',
    description: 'Find and fix broken internal and external links.',
    icon: <Link className="w-5 h-5 text-red-600" />
  },
  {
    key: 'sitemap-robots',
    name: 'Sitemap & Robots.txt',
    description: 'Analyze your sitemap and robots.txt file.',
    icon: <BookOpen className="w-5 h-5 text-blue-600" />
  },
  {
    key: 'mobile-audit',
    name: 'Mobile Audit',
    description: 'Check mobile-friendliness and responsive design.',
    icon: <Smartphone className="w-5 h-5 text-indigo-600" />
  },
  {
    key: 'technical-audit',
    name: 'Technical SEO Audit',
    description: 'Comprehensive technical SEO analysis.',
    icon: <Code className="w-5 h-5 text-gray-700" />
  },
  {
    key: 'schema-validator',
    name: 'Schema Validator',
    description: 'Validate structured data markup.',
    icon: <BarChart className="w-5 h-5 text-yellow-600" />
  },
  {
    key: 'alt-text',
    name: 'Alt Text Checker',
    description: 'Check image alt text for SEO optimization.',
    icon: <Image className="w-5 h-5 text-pink-600" />
  },
  {
    key: 'canonical',
    name: 'Canonical URL Checker',
    description: 'Analyze canonical URL implementation.',
    icon: <Link2 className="w-5 h-5 text-cyan-600" />
  },
  {
    key: 'backlink',
    name: 'Backlink Analyzer',
    description: 'Analyze your backlink profile and quality.',
    icon: <Globe className="w-5 h-5 text-orange-600" />
  },
  {
    key: 'keyword-tracker',
    name: 'Keyword Tracker',
    description: 'Track keyword rankings over time.',
    icon: <TrendingUp className="w-5 h-5 text-teal-600" />
  },
  {
    key: 'page-speed',
    name: 'Page Speed Analyzer',
    description: 'Analyze page loading speed and performance.',
    icon: <Zap className="w-5 h-5 text-yellow-500" />
  },
  {
    key: 'competitor',
    name: 'Competitor Analyzer',
    description: 'Analyze competitor SEO strategies.',
    icon: <Search className="w-5 h-5 text-purple-500" />
  }
];

export default function SeoToolsDashboard() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToolSelect = (toolKey: string) => {
    setIsLoading(true);
    setSelectedTool(toolKey);
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
    setIsLoading(false);
  };

  const renderTool = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Zap className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Tool...</h2>
            <p className="text-gray-600 dark:text-gray-400">Preparing your SEO analysis</p>
          </div>
        </div>
      );
    }

    switch (selectedTool) {
      case 'meta':
        return <MetaAnalyzer />;
      case 'keyword-density':
        return <KeywordDensityTool />;
      case 'keyword-research':
        return <KeywordResearcherTool />;
      case 'broken-links':
        return <BrokenLinkTool />;
      case 'sitemap-robots':
        return <SitemapRobotsTool />;
      case 'mobile-audit':
        return <MobileAuditTool />;
      case 'technical-audit':
        return <TechnicalAuditTool />;
      case 'schema-validator':
        return <SchemaValidatorTool />;
      case 'alt-text':
        return <AltTextTool />;
      case 'canonical':
        return <CanonicalTool />;
      case 'backlink':
        return <BacklinkTool />;
      case 'keyword-tracker':
        return <KeywordTrackerTool />;
      case 'page-speed':
        return <PageSpeedTool />;
      case 'competitor':
        return <CompetitorTool />;
      default:
        return null;
    }
  };

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900">
        {/* Header with back button */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToTools}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Tools</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tools.find(tool => tool.key === selectedTool)?.name}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Tool content */}
        <div className="relative z-0">
          {renderTool()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800 dark:to-accent-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-700 dark:to-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-glass border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
                SEO Tools Dashboard
              </h1>
              <p className="text-primary-600 text-sm">Professional SEO analysis and optimization tools</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <ToolCard
              key={tool.key}
              tool={tool}
              onClick={() => handleToolSelect(tool.key)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-semibold text-primary-800 mb-6">Why Use Our SEO Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-glow">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Improve Rankings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimize your site for better search engine rankings</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-glow">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Fast Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get instant insights with our powerful analysis tools</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-glow">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive reports with actionable recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
