const computeSeoScore = (project) => {
    const score = {
      meta: project.metaTagReport?.valid ? 10 : 5,
      keywords: project.keywordDensityReport?.score || 7,
      backlinks: project.backlinkReport?.totalExternal > 50 ? 10 : 6,
      brokenLinks: project.brokenLinksReport?.brokenCount === 0 ? 10 : 5,
      sitemap: project.sitemapReport?.success ? 10 : 0,
      robots: project.robotsReport?.success ? 10 : 5,
      speed: parseInt(project.pageSpeedReport?.metrics?.loadTime) < 2000 ? 10 : 6,
      mobile: project.mobileAuditReport?.audit?.isMobileFriendly ? 10 : 5,
      altText: project.altTextReport?.missingAltCount === 0 ? 10 : 5,
      canonical:
        project.canonicalReport?.issues?.length === 0 && project.canonicalReport?.canonicalUrl.includes(project.url)
          ? 10
          : 5,
      schema: project.schemaReport?.found ? 10 : 5,
      competitors: project.competitorReport?.results?.length ? 10 : 5,
      technical: project.technicalAuditReport?.issues?.length === 0 ? 10 : 5
    };
  
    const total = Object.values(score).reduce((a, b) => a + b, 0);
  
    const suggestions = [];
    for (const [key, val] of Object.entries(score)) {
      if (val < 8) suggestions.push(`Improve ${key} area — score is ${val}/10`);
    }
  
    return { total, breakdown: score, suggestions };
  };
  
  module.exports = { computeSeoScore };
  