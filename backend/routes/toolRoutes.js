const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { canUseSeoTools } = require('../middleware/subscriptionMiddleware');
const { checkTrialStatus, checkUsageLimit } = require('../middleware/trialMiddleware');
const {
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
} = require('../controllers/toolController');

const router = express.Router();

// 🔐 Protect all tool routes
router.use(protect);

// 🔒 Check trial status and SEO tools access for all routes
router.use(checkTrialStatus);
router.use(canUseSeoTools);

// === Tool Execution Routes ===
// All tools require usage limit check for SEO tools
router.post('/:projectId/run-meta', checkUsageLimit('seoTools'), runMetaTagAnalyzer);
router.post('/:projectId/run-keyword-density', checkUsageLimit('seoTools'), runKeywordDensityAnalyzer);
router.post('/:projectId/run-broken-links', checkUsageLimit('seoTools'), runBrokenLinkChecker);
router.post('/:projectId/run-sitemap-robots', checkUsageLimit('seoTools'), runSitemapRobotsChecker);
router.post('/:projectId/run-backlinks', checkUsageLimit('seoTools'), runBacklinkScanner);
router.post('/:projectId/run-keyword-tracker', checkUsageLimit('seoTools'), runKeywordTracker);
router.post('/:projectId/run-speed', checkUsageLimit('seoTools'), runPageSpeedAnalyzer);
router.post('/:projectId/run-mobile-audit', checkUsageLimit('seoTools'), runMobileAuditChecker);
router.post('/:projectId/run-competitors', checkUsageLimit('seoTools'), runCompetitorAnalyzer);
router.post('/:projectId/run-technical-audit', checkUsageLimit('seoTools'), runTechnicalSeoAuditor);
router.post('/:projectId/run-schema', checkUsageLimit('seoTools'), runSchemaValidatorTool);
router.post('/:projectId/run-alt-text', checkUsageLimit('seoTools'), runAltTextChecker);
router.post('/:projectId/run-canonical', checkUsageLimit('seoTools'), runCanonicalChecker);
router.post('/:projectId/run-seo-score', checkUsageLimit('seoTools'), runSeoScoreCalculator);
router.post('/:projectId/run-keyword-research', checkUsageLimit('seoTools'), runKeywordResearcher);

module.exports = router;