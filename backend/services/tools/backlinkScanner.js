const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const extractBacklinks = async (targetUrl) => {
  try {
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);

    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const anchor = $(el).text().trim();
      if (href && href.startsWith('http')) {
        links.push({ href, anchor });
      }
    });

    const domain = new URL(targetUrl).hostname;
    const externalLinks = links.filter(link => !link.href.includes(domain));

    const grouped = externalLinks.reduce((acc, link) => {
      const host = new URL(link.href).hostname;
      acc[host] = acc[host] || [];
      acc[host].push(link.anchor || '(no text)');
      return acc;
    }, {});

    return {
      success: true,
      totalExternal: externalLinks.length,
      domainsLinkingIn: Object.keys(grouped).length,
      domains: grouped
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { extractBacklinks };
