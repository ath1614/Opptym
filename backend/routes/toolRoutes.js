const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { canUseSeoTools } = require('../middleware/subscriptionMiddleware');
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
  runSeoScoreCalculator
} = require('../controllers/toolController');

const router = express.Router();

// 🔐 Protect all tool routes
router.use(protect);

// 🔒 Check SEO tools access for all routes
router.use(canUseSeoTools);

// === Tool Execution Routes ===
router.post('/:projectId/run-meta', runMetaTagAnalyzer);
router.post('/:projectId/run-keyword-density', runKeywordDensityAnalyzer);
router.post('/:projectId/run-broken-links', runBrokenLinkChecker);
router.post('/:projectId/run-sitemap-robots', runSitemapRobotsChecker);
router.post('/:projectId/run-backlinks', runBacklinkScanner);
router.post('/:projectId/run-keyword-tracker', runKeywordTracker);
router.post('/:projectId/run-speed', runPageSpeedAnalyzer);
router.post('/:projectId/run-mobile-audit', runMobileAuditChecker);
router.post('/:projectId/run-competitors', runCompetitorAnalyzer);
router.post('/:projectId/run-technical-audit', runTechnicalSeoAuditor);
router.post('/:projectId/run-schema', runSchemaValidatorTool);
router.post('/:projectId/run-alt-text', runAltTextChecker);
router.post('/:projectId/run-canonical', runCanonicalChecker);
router.post('/:projectId/run-seo-score', runSeoScoreCalculator);

module.exports = router;