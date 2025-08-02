const axios = require('axios');
const cheerio = require('cheerio');

const runSchemaValidator = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const scripts = $('script[type="application/ld+json"]');
    const detectedSchemas = [];

    scripts.each((i, el) => {
      try {
        const parsed = JSON.parse($(el).html() || '');
        const types = Array.isArray(parsed) ? parsed.map(p => p['@type']) : [parsed['@type']];
        detectedSchemas.push(...types.filter(Boolean));
      } catch (err) {
        // Skip invalid JSON-LD
      }
    });

    return {
      success: true,
      schemaTypes: [...new Set(detectedSchemas)],
      found: detectedSchemas.length > 0,
      suggestions: detectedSchemas.length
        ? ['Schemas found. Ensure correctness via schema.org validator.']
        : ['No structured data detected. Consider adding JSON-LD for articles, products, FAQs.']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { runSchemaValidator };
