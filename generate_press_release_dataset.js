import fs from 'fs';

// Press Release data from user
const pressReleasePlatforms = [
  'https://www.prlog.org/',
  'https://www.1888pressrelease.com/',
  'https://www.pressbox.com/',
  'https://www.24-7pressrelease.com/',
  'https://www.prnewswire.com/',
  'https://realtimepressrelease.com/',
  'http://www.prbd.net/',
  'https://www.prfire.co.uk/',
  'https://www.prurgent.com/',
  'https://express-press-release.net/',
  'http://prsync.com/',
  'https://www.forpressrelease.com/',
  'http://www.prweb.com/',
  'https://www.prwires.com/',
  'https://www.24newswire.com/'
];

// Generate dataset
const directories = [];

pressReleasePlatforms.forEach((url, index) => {
  const domain = new URL(url).hostname;
  const name = domain.replace('www.', '').split('.')[0];
  
  // Assign priority based on platform reputation
  let priority = Math.floor(Math.random() * 100);
  if (name.includes('prnewswire') || name.includes('prweb') || name.includes('prlog')) {
    priority = Math.floor(Math.random() * 20) + 80; // High priority for major platforms
  } else if (name.includes('press') || name.includes('pr')) {
    priority = Math.floor(Math.random() * 30) + 50; // Medium-high priority
  }
  
  directories.push({
    classification: "Press Release",
    name: `${name.charAt(0).toUpperCase() + name.slice(1)} Press Release ${index + 1}`,
    url: url,
    domain: domain,
    category: "business",
    country: "Global",
    pageRank: Math.floor(Math.random() * 6) + 1,
    daScore: Math.floor(Math.random() * 50) + 10,
    spamScore: Math.floor(Math.random() * 17),
    priority: priority,
    isCustom: false,
    description: `Professional press release submission platform for ${name} - Press Release classification`
  });
});

// Write to JSON file
fs.writeFileSync('press_release_classification.json', JSON.stringify(directories, null, 2));

console.log(`✅ Generated ${directories.length} Press Release entries`);
console.log('📁 Saved to: press_release_classification.json');
