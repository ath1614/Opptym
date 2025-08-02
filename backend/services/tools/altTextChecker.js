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

    return {
      success: true,
      totalImages: total,
      missingAltCount: withoutAlt.length,
      imagesMissingAlt: withoutAlt,
      suggestions: withoutAlt.length
        ? ['Add descriptive alt attributes to all images for accessibility and SEO.']
        : ['All images have valid alt tags. Good job!']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { runAltTextAudit };
