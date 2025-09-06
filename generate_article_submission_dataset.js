import fs from 'fs';

// Article Submission data from user
const articlePlatforms = [
  'https://medium.com/',
  'https://www.sooperarticles.com/',
  'https://www.amazines.com/',
  'https://www.niadd.com',
  'https://www.tumblr.com',
  'https://justpaste.it',
  'https://anotepad.com',
  'https://www.patreon.com',
  'https://click4r.com',
  'https://www.diigo.com',
  'https://www.apsense.com/',
  'https://www.selfgrowth.com/',
  'http://www.jumparticles.com/',
  'http://www.articlegeek.com/',
  'https://www.articletrunk.com/',
  'https://www.thefreelibrary.com/',
  'https://articlebiz.com/',
  'https://www.123articleonline.com/',
  'http://www.a1articles.com/',
  'http://www.articledoctor.com/',
  'https://www.otherarticles.com/',
  'http://www.howtoadvice.com/',
  'http://www.webmasterslibrary.com/',
  'https://uploadarticle.com/',
  'https://articlesneed.com/',
  'http://actuafreearticles.com/',
  'https://www.articlecede.com/',
  'https://go2article.com/',
  'http://articlesss.com/',
  'https://articlesbase.com/',
  'https://www.articlization.com/',
  'https://www.livejournal.com/',
  'https://www.warticles.com/',
  'https://www.netezinearticles.com/',
  'https://articlesforwebsite.com/',
  'https://articles.abilogic.com/',
  'http://www.articleslist.net/',
  'https://www.bloglovin.com/',
  'https://www.articlecube.com/',
  'https://www.promotionworld.com/',
  'http://www.articleseen.com/',
  'https://articleside.com/',
  'https://dzone.com/',
  'https://www.articlesubmission.co.in/',
  'https://www.highrankdirectory.com/',
  'https://www.marketinginternetdirectory.com/',
  'https://www.prolinkdirectory.com/',
  'https://www.sitepromotiondirectory.com/',
  'http://www.articlecatalog.com/'
];

// Instant approval platforms (subset)
const instantApproval = [
  'https://medium.com/',
  'https://www.amazines.com',
  'https://articleside.com/',
  'https://www.selfgrowth.com/',
  'https://articlebiz.com/',
  'https://www.tumblr.com/',
  'https://www.sooperarticles.com/',
  'https://www.niadd.com',
  'https://justpaste.it',
  'https://anotepad.com',
  'https://click4r.com',
  'https://www.diigo.com'
];

// Generate dataset
const directories = [];

articlePlatforms.forEach((url, index) => {
  const domain = new URL(url).hostname;
  const name = domain.replace('www.', '').split('.')[0];
  const isInstantApproval = instantApproval.includes(url);
  
  directories.push({
    classification: "Article Submission",
    name: `${name.charAt(0).toUpperCase() + name.slice(1)} Article Platform ${index + 1}`,
    url: url,
    domain: domain,
    category: "technology",
    country: "Global",
    pageRank: Math.floor(Math.random() * 6) + 1,
    daScore: Math.floor(Math.random() * 50) + 10,
    spamScore: Math.floor(Math.random() * 17),
    priority: isInstantApproval ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 100), // Higher priority for instant approval
    isCustom: false,
    description: `${isInstantApproval ? 'Instant approval' : 'Standard'} article submission platform for ${name} - Article Submission classification`
  });
});

// Write to JSON file
fs.writeFileSync('article_submission_classification.json', JSON.stringify(directories, null, 2));

console.log(`✅ Generated ${directories.length} Article Submission entries`);
console.log(`📊 Instant Approval: ${instantApproval.length} platforms`);
console.log('📁 Saved to: article_submission_classification.json');
