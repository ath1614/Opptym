const axios = require('axios');
const cheerio = require('cheerio');

const runTechnicalAudit = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const issues = [];

    // 🔍 Meta checks
    if (!$('title').text()) issues.push('Missing <title> tag');
    if (!$('meta[name="description"]').attr('content')) issues.push('Missing meta description');

    // 🧱 H1 checks
    const h1Count = $('h1').length;
    if (h1Count === 0) issues.push('Missing <h1> heading');
    if (h1Count > 1) issues.push('Multiple <h1> headings detected');

    // 🔗 Internal links
    const internalLinks = $('a').filter((_, el) => {
      const href = $(el).attr('href');
      return href?.startsWith('/');
    }).length;
    if (internalLinks < 5) issues.push('Low number of internal links');

    // 🤖 Crawl directives
    const metaRobots = $('meta[name="robots"]').attr('content');
    if (metaRobots?.includes('noindex') || metaRobots?.includes('nofollow')) {
      issues.push(`Robots meta tag includes: ${metaRobots}`);
    }

    return {
      success: true,
      audit: {
        title: $('title').text() || 'N/A',
        metaDescription: $('meta[name="description"]').attr('content') || 'N/A',
        h1Count,
        internalLinks,
        robotsTag: metaRobots || 'N/A'
      },
      issues,
      suggestions: issues.length
        ? ['Resolve the following issues for improved technical SEO.']
        : ['No major technical SEO issues found.']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { runTechnicalAudit };
