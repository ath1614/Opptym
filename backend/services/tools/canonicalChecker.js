const axios = require('axios');
const cheerio = require('cheerio');

const runCanonicalAudit = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const canonicalHref = $('link[rel="canonical"]').attr('href');
    const issues = [];

    if (!canonicalHref) {
      issues.push('Missing canonical tag');
    } else if (!canonicalHref.includes(url)) {
      issues.push(`Canonical tag points to different URL: ${canonicalHref}`);
    }

    return {
      success: true,
      canonicalUrl: canonicalHref || 'Not found',
      issues,
      suggestions: issues.length
        ? ['Use canonical tags that match page intent and domain structure.']
        : ['Canonical tag is valid and matches page URL.']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { runCanonicalAudit };
