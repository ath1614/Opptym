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
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await analyzeDensity(project.url, project.targetKeywords || []);
  project.keywordDensityReport = report;
  await project.save();

  res.json(report);
};

const runBrokenLinkChecker = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await checkBrokenLinks(project.url);
  project.brokenLinksReport = report;
  await project.save();

  res.json(report);
};

const runSitemapRobotsChecker = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const sitemapReport = await checkSitemap(project.sitemapUrl);
  const robotsReport = await checkRobots(project.robotsTxtUrl);

  project.sitemapReport = sitemapReport;
  project.robotsReport = robotsReport;
  await project.save();

  res.json({ sitemapReport, robotsReport });
};

const runBacklinkScanner = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await extractBacklinks(project.url);
  project.backlinkReport = report;
  await project.save();

  res.json(report);
};

const runKeywordTracker = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const domain = new URL(project.url).hostname;
  const report = await checkKeywordRank(domain, project.targetKeywords || []);

  project.keywordTrackerReport = report;
  await project.save();

  res.json(report);
};

const runPageSpeedAnalyzer = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await analyzePageSpeed(project.url);
  project.pageSpeedReport = report;
  await project.save();

  res.json(report);
};

const runMobileAuditChecker = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await runMobileAudit(project.url);
  project.mobileAuditReport = report;
  await project.save();

  res.json(report);
};

const runCompetitorAnalyzer = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const domain = new URL(project.url).hostname;
  const keywords = project.targetKeywords || [];

  const report = await analyzeCompetitors(domain, keywords);
  project.competitorReport = report;
  await project.save();

  res.json(report);
};

const runTechnicalSeoAuditor = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await runTechnicalAudit(project.url);
  project.technicalAuditReport = report;
  await project.save();

  res.json(report);
};

const runSchemaValidatorTool = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await runSchemaValidator(project.url);
  project.schemaReport = report;
  await project.save();

  res.json(report);
};

const runAltTextChecker = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await runAltTextAudit(project.url);
  project.altTextReport = report;
  await project.save();

  res.json(report);
};

const runCanonicalChecker = async (req, res) => {
  const project = await getProjectOrFail(req.params.projectId, res);
  if (!project) return;

  const report = await runCanonicalAudit(project.url);
  project.canonicalReport = report;
  await project.save();

  res.json(report);
};

const runSeoScoreCalculator = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const scoreReport = computeSeoScore(project);
  project.seoScore = scoreReport;
  await project.save();

  res.json(scoreReport);
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