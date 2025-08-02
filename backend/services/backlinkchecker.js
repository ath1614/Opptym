const axios = require('axios');
const cheerio = require('cheerio');

const backlinkChecker = async (url) => {
  const searchURL = `https://www.google.com/search?q=link:${url}`;
  const res = await axios.get(searchURL);
  const $ = cheerio.load(res.data);

  const links = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href?.includes('http') && !href.includes(url)) links.push(href);
  });

  return links;
};

module.exports = backlinkChecker;
