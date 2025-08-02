const axios = require('axios');
const cheerio = require('cheerio');

const keywordDensity = async (url) => {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const text = $('body').text().toLowerCase().replace(/\s+/g, ' ');
  const words = text.split(' ').filter(w => w.length > 3);
  const freq = {};

  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return top;
};

module.exports = keywordDensity;
