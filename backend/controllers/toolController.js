const axios = require('axios');
const cheerio = require('cheerio');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

const { analyzeMetaTags } = require('../services/tools/metaTagAnalyzer');
const { analyzeDensity } = require('../services/tools/keywordDensityAnalyzer');
const { checkBrokenLinks } = require('../services/tools/brokenLinkChecker');
const { checkSitemap, checkRobots } = require('../services/tools/sitemapRobotsChecker');
const { extractBacklinks } = require('../services/tools/backlinkScanner');
const { checkKeywordRank } = require('../services/tools/keywordRankChecker');
const { analyzePageSpeed } = require('../services/tools/pageSpeedAnalyzer');
const { runMobileAudit } = require('../services/tools/mobileAuditChecker');
const { analyzeCompetitors } = require('../services/tools/competitorAnalyzer');
const { runTechnicalAudit } = require('../services/tools/technicalSeoAuditor');
const { runSchemaValidator } = require('../services/tools/schemaValidator');
const { runAltTextAudit } = require('../services/tools/altTextChecker');
const { runCanonicalAudit } = require('../services/tools/canonicalChecker');
const { computeSeoScore } = require('../services/tools/seoScorer');

// Utility: check user permissions for SEO tools
const checkSeoToolPermission = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.hasPermission('canUseSeoTools')) {
    return res.status(403).json({ 
      error: 'SEO tools access not included in your subscription',
      subscription: user.subscription,
      upgradeRequired: true
    });
  }

  // Check usage limit for SEO tools
  if (!user.checkUsageLimit('seoTools')) {
    const limits = user.subscriptionLimits;
    return res.status(403).json({ 
      error: 'SEO tools usage limit exceeded',
      limit: limits.seoTools || 0,
      current: user.currentUsage.seoToolsUsed,
      subscription: user.subscription
    });
  }

  return user;
};

// Utility: fetch project and validate
const getProjectOrFail = async (projectId, res) => {
  const project = await Project.findById(projectId);
  if (!project || !project.url) {
    res.status(404).json({ error: 'Invalid project or URL' });
    return null;
  }
  return project;
};

// === Individual Tool Handlers ===

const runMetaTagAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const { data } = await axios.get(project.url);
    const $ = cheerio.load(data);

    const metaTitle = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywordsRaw = $('meta[name="keywords"]').attr('content') || '';
    const metaKeywords = metaKeywordsRaw.split(',').map(k => k.trim()).filter(k => k);

    const analysisReport = analyzeMetaTags({ metaTitle, metaDescription, keywords: metaKeywords });

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(analysisReport);
  } catch (err) {
    console.error('Meta tag analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze meta tags' });
  }
};

const runKeywordDensityAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await analyzeDensity(project.url, project.targetKeywords || []);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Keyword density analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze keyword density' });
  }
};

const runBrokenLinkChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await checkBrokenLinks(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Broken link checker error:', err.message);
    res.status(500).json({ error: 'Failed to check broken links' });
  }
};

const runSitemapRobotsChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const sitemapReport = await checkSitemap(project.sitemapUrl || `${project.url}/sitemap.xml`);
    const robotsReport = await checkRobots(project.robotsTxtUrl || `${project.url}/robots.txt`);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json({ sitemapReport, robotsReport });
  } catch (err) {
    console.error('Sitemap/Robots checker error:', err.message);
    res.status(500).json({ error: 'Failed to check sitemap and robots' });
  }
};

const runBacklinkScanner = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await extractBacklinks(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Backlink scanner error:', err.message);
    res.status(500).json({ error: 'Failed to scan backlinks' });
  }
};

const runKeywordTracker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const domain = new URL(project.url).hostname;
    const report = await checkKeywordRank(domain, project.targetKeywords || []);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Keyword tracker error:', err.message);
    res.status(500).json({ error: 'Failed to track keywords' });
  }
};

const runPageSpeedAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await analyzePageSpeed(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Page speed analyzer error:', err.message);
    res.status(500).json({ error: 'Failed to analyze page speed' });
  }
};

const runMobileAuditChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await runMobileAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Mobile audit error:', err.message);
    res.status(500).json({ error: 'Failed to run mobile audit' });
  }
};

const runCompetitorAnalyzer = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const domain = new URL(project.url).hostname;
    const keywords = project.targetKeywords || [];

    const report = await analyzeCompetitors(domain, keywords);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Competitor analyzer error:', err.message);
    res.status(500).json({ error: 'Failed to analyze competitors' });
  }
};

const runTechnicalSeoAuditor = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await runTechnicalAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Technical SEO audit error:', err.message);
    res.status(500).json({ error: 'Failed to run technical audit' });
  }
};

const runSchemaValidatorTool = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await runSchemaValidator(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Schema validator error:', err.message);
    res.status(500).json({ error: 'Failed to validate schema' });
  }
};

const runAltTextChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await runAltTextAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Alt text checker error:', err.message);
    res.status(500).json({ error: 'Failed to check alt text' });
  }
};

const runCanonicalChecker = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await runCanonicalAudit(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('Canonical checker error:', err.message);
    res.status(500).json({ error: 'Failed to check canonical URLs' });
  }
};

const runSeoScoreCalculator = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check user permissions for SEO tools
    const user = await checkSeoToolPermission(req, res);
    if (!user) return;

    const project = await getProjectOrFail(projectId, res);
    if (!project) return;

    const report = await computeSeoScore(project.url);

    // Increment usage
    await user.incrementUsage('seoTools');

    res.json(report);
  } catch (err) {
    console.error('SEO score calculator error:', err.message);
    res.status(500).json({ error: 'Failed to calculate SEO score' });
  }
};

// === Export All Handlers ===
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
  runSeoScoreCalculator
};