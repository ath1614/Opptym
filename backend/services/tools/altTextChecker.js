const axios = require('axios');
const cheerio = require('cheerio');

const runAltTextAudit = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const images = $('img');
    const total = images.length;
    const withoutAlt = [];

    images.each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      if (!alt || alt.trim().length === 0) {
        withoutAlt.push(src || '(no src)');
      }
    });

    // Determine alt text quality
    const altTextQuality = withoutAlt.length === 0 ? 'Good' : 
                           withoutAlt.length <= total * 0.2 ? 'Fair' : 'Poor';

    return {
      success: true,
      audit: {
        totalImages: total,
        missingAltCount: withoutAlt.length,
        imagesMissingAlt: withoutAlt,
        altTextQuality: altTextQuality
      },
      suggestions: withoutAlt.length
        ? ['Add descriptive alt attributes to all images for accessibility and SEO.']
        : ['All images have valid alt tags. Good job!']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { runAltTextAudit };
