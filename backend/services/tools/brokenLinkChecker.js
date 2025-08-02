const axios = require('axios');
const cheerio = require('cheerio');

const checkBrokenLinks = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) links.push(href);
    });

    const results = await Promise.allSettled(
      links.map((link) =>
        axios.head(link, { timeout: 5000 }).then(() => ({ url: link, status: 'ok' }))
      )
    );

    const brokenLinks = results
      .map((res, i) => ({
        url: links[i],
        status: res.status === 'fulfilled' ? 'ok' : 'broken',
        error: res.status === 'rejected' ? res.reason.code || 'Error' : null,
      }))
      .filter((r) => r.status === 'broken');

    return {
      success: true,
      totalLinks: links.length,
      brokenCount: brokenLinks.length,
      brokenLinks,
      suggestions: brokenLinks.length
        ? ['Fix or remove broken links to improve crawlability.']
        : ['No broken links found.']
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { checkBrokenLinks };
