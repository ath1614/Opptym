const axios = require('axios');
const cheerio = require('cheerio');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

const { analyzeMetaTags } = require('../services/tools/metaTagAnalyzer');
const { analyzeDensity } = require('../services/tools/keywordDensityAnalyzer');
const { checkBrokenLinks } = require('../services/tools/brokenLinkChecker');
const { checkSitemap, checkRobots } = require('../services/tools/sitemapRobotsChecker');
const { extractBacklinks } = require('../services/tools/backlinkScanner');
const checkKeywordRank = require('../services/tools/keywordRankChecker');
const analyzePageSpeed = require('../services/tools/pageSpeedAnalyzer');
const runMobileAudit = require('../services/tools/mobileAuditChecker');
const analyzeCompetitors = require('../services/tools/competitorAnalyzer');
const { runTechnicalAudit } = require('../services/tools/technicalSeoAuditor');
const { runSchemaValidator } = require('../services/tools/schemaValidator');
const { runAltTextAudit } = require('../services/tools/altTextChecker');
const { runCanonicalAudit } = require('../services/tools/canonicalChecker');
const { computeSeoScore } = require('../services/tools/seoScorer');
const keywordResearcher = require('../services/tools/keywordResearcher');

// Check SEO tool permission
const checkSeoToolPermission = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return null;
    }

    if (!user.hasPermission('canUseSeoTools')) {
      res.status(403).json({ error: 'SEO tools not available in your plan' });
      return null;
    }

    return user;
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
    return null;
  }
};

// Get project or fail
const getProjectOrFail = async (projectId, res) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return null;
    }
    return project;
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
    return null;
  }
};

// Meta Tag Analyzer
const runMetaTagAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running meta tag analysis for project:', project.title);

    const report = analyzeMetaTags(project);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Meta tag analysis completed');
    res.json(report);
  } catch (err) {
    console.error('Meta tag analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze meta tags' });
  }
};

// Keyword Density Analyzer
const runKeywordDensityAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running keyword density analysis for project:', project.title);

    const report = await analyzeDensity(project.url, project.targetKeywords || []);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Keyword density analysis completed');
    res.json(report);
  } catch (err) {
    console.error('Keyword density analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze keyword density' });
  }
};

// Broken Link Checker
const runBrokenLinkChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running broken link check for project:', project.title);

    const report = await checkBrokenLinks(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Broken link check completed');
    res.json(report);
  } catch (err) {
    console.error('Broken link checker error:', err.message);
    res.status(500).json({ error: 'Failed to check broken links' });
  }
};

// Sitemap & Robots Checker
const runSitemapRobotsChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running sitemap & robots check for project:', project.title);

    const sitemapUrl = project.sitemapUrl || `${project.url}/sitemap.xml`;
    const robotsUrl = project.robotsTxtUrl || `${project.url}/robots.txt`;

    const report = {
      sitemap: await checkSitemap(sitemapUrl),
      robots: await checkRobots(robotsUrl)
    };

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Sitemap & robots check completed');
    res.json(report);
  } catch (err) {
    console.error('Sitemap & robots checker error:', err.message);
    res.status(500).json({ error: 'Failed to check sitemap & robots' });
  }
};

// Backlink Scanner
const runBacklinkScanner = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running backlink scan for project:', project.title);

    const report = await extractBacklinks(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Backlink scan completed');
    res.json(report);
  } catch (err) {
    console.error('Backlink scanner error:', err.message);
    res.status(500).json({ error: 'Failed to scan backlinks' });
  }
};

// Keyword Tracker
const runKeywordTracker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running keyword tracking for project:', project.title);

    // For mock implementation, pass projectId and first keyword
    const firstKeyword = project.targetKeywords?.[0] || 'example';
    const report = await checkKeywordRank(projectId, firstKeyword);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Keyword tracking completed');
    res.json(report);
  } catch (err) {
    console.error('Keyword tracker error:', err.message);
    res.status(500).json({ error: 'Failed to track keywords' });
  }
};

// Page Speed Analyzer
const runPageSpeedAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running page speed analysis for project:', project.title);

    const report = await analyzePageSpeed(projectId);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Page speed analysis completed');
    res.json(report);
  } catch (err) {
    console.error('Page speed analyzer error:', err.message);
    res.status(500).json({ error: 'Failed to analyze page speed' });
  }
};

// Mobile Audit Checker
const runMobileAuditChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running mobile audit for project:', project.title);

    const report = await runMobileAudit(projectId);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Mobile audit completed');
    res.json(report);
  } catch (err) {
    console.error('Mobile audit error:', err.message);
    res.status(500).json({ error: 'Failed to run mobile audit' });
  }
};

// Competitor Analyzer
const runCompetitorAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running competitor analysis for project:', project.title);

    // For mock implementation, pass projectId and a sample competitor URL
    const competitorUrl = 'https://example-competitor.com';
    const report = await analyzeCompetitors(projectId, competitorUrl);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Competitor analysis completed');
    res.json(report);
  } catch (err) {
    console.error('Competitor analyzer error:', err.message);
    res.status(500).json({ error: 'Failed to analyze competitors' });
  }
};

// Technical SEO Auditor
const runTechnicalSeoAuditor = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running technical SEO audit for project:', project.title);

    const report = await runTechnicalAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Technical SEO audit completed');
    res.json(report);
  } catch (err) {
    console.error('Technical SEO auditor error:', err.message);
    res.status(500).json({ error: 'Failed to run technical SEO audit' });
  }
};

// Schema Validator
const runSchemaValidatorTool = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running schema validation for project:', project.title);

    const report = await runSchemaValidator(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Schema validation completed');
    res.json(report);
  } catch (err) {
    console.error('Schema validator error:', err.message);
    res.status(500).json({ error: 'Failed to validate schema' });
  }
};

// Alt Text Checker
const runAltTextChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running alt text audit for project:', project.title);

    const report = await runAltTextAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Alt text audit completed');
    res.json(report);
  } catch (err) {
    console.error('Alt text checker error:', err.message);
    res.status(500).json({ error: 'Failed to audit alt text' });
  }
};

// Canonical Checker
const runCanonicalChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running canonical audit for project:', project.title);

    const report = await runCanonicalAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Canonical audit completed');
    res.json(report);
  } catch (err) {
    console.error('Canonical checker error:', err.message);
    res.status(500).json({ error: 'Failed to audit canonical tags' });
  }
};

// SEO Score Calculator
const runSeoScoreCalculator = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running SEO score calculation for project:', project.title);

    const report = await computeSeoScore(project);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ SEO score calculation completed');
    res.json(report);
  } catch (err) {
    console.error('SEO score calculator error:', err.message);
    res.status(500).json({ error: 'Failed to calculate SEO score' });
  }
};

// Keyword Researcher
const runKeywordResearcher = async (req, res) => {
  const { projectId } = req.params;
  const { seedKeyword } = req.body;
  
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    console.log('🔍 Running keyword research for project:', project.title);

    // Use provided seed keyword or fallback to project keywords
    const keywordToResearch = seedKeyword || project.targetKeywords?.[0] || 'seo tools';
    
    const report = await keywordResearcher(keywordToResearch, projectId);

    // Increment usage
    await user.incrementUsage('seoTools');

    console.log('✅ Keyword research completed');
    res.json(report);
  } catch (err) {
    console.error('Keyword researcher error:', err.message);
    res.status(500).json({ error: 'Failed to research keywords' });
  }
};

module.exports = {
  runMetaTagAnalyzer,
  runKeywordDensityAnalyzer,
  runBrokenLinkChecker,
  runSitemapRobotsChecker,
  runBacklinkScanner,
  runKeywordTracker,
  runPageSpeedAnalyzer,
  runMobileAuditChecker,
  runCompetitorAnalyzer,
  runTechnicalSeoAuditor,
  runSchemaValidatorTool,
  runAltTextChecker,
  runCanonicalChecker,
  runSeoScoreCalculator,
  runKeywordResearcher
};