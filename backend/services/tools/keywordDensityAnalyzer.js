const axios = require('axios');
const cheerio = require('cheerio');

const cleanText = (html) => {
  const $ = cheerio.load(html);
  return $('body').text().replace(/\s+/g, ' ').toLowerCase();
};

const analyzeDensity = async (url, targetKeywords = []) => {
  try {
    const { data } = await axios.get(url);
    const pageText = cleanText(data);
    const words = pageText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const keywordStats = targetKeywords.map((kw) => {
      const count = words.filter((w) => w === kw.toLowerCase()).length;
      const density = ((count / wordCount) * 100).toFixed(2);
      return { keyword: kw, count, density: `${density}%` };
    });

    return {
      success: true,
      totalWords: wordCount,
      keywordStats,
      suggestions: keywordStats.map((k) =>
        parseFloat(k.density) < 1
          ? `Consider using "${k.keyword}" more often`
          : `Density for "${k.keyword}" is sufficient`
      )
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { analyzeDensity };
