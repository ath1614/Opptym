const axios = require('axios');

const checkSitemap = async (sitemapUrl) => {
  try {
    const { data } = await axios.get(sitemapUrl);
    const count = (data.match(/<loc>/g) || []).length;
    return {
      success: true,
      message: `Sitemap found with ${count} pages.`,
      pageCount: count
    };
  } catch (err) {
    return { success: false, message: 'Sitemap inaccessible', error: err.message };
  }
};

const checkRobots = async (robotsUrl) => {
  try {
    const { data } = await axios.get(robotsUrl);
    const lines = data.split('\n');
    const rules = lines.filter(line =>
      line.startsWith('Disallow') || line.startsWith('Allow')
    );

    return {
      success: true,
      message: `Robots.txt has ${rules.length} crawl rules.`,
      rules
    };
  } catch (err) {
    return { success: false, message: 'Robots.txt not found', error: err.message };
  }
};

module.exports = { checkSitemap, checkRobots };
