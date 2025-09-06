import fs from 'fs';

// Australia Classified List - 120+ platforms
const australiaClassifiedList = [
  "https://www.thewestclassifieds.com.au/",
  "http://www.aufreeads.com/",
  "https://www.locanto.com.au/",
  "https://www.gumtree.com.au/",
  "https://www.hotfrog.com.au/",
  "https://classifieds.justlanded.com/",
  "https://www.postmyads.com.au/",
  "https://au.global-free-classified-ads.com/",
  "https://www.auclassifieds.com.au/",
  "https://www.chaosads.com/",
  "https://www.cavalletti.com.au/",
  "https://www.buysearchsell.com.au/",
  "http://gopost.com.au/",
  "https://www.classifiedads.com/",
  "http://uycart.com/",
  "http://pixolinks.com/",
  "https://fdlclassifieds.com/",
  "https://postezads.com/",
  "https://instantadz.com/",
  "https://postquickads.com/",
  "https://classifieds4free.com/",
  "https://postsmartads.com/",
  "https://totads.com/",
  "https://pclassified.com/",
  "https://classifiedshome.com/",
  "https://classifiedslink.com/",
  "https://totalclassified.com/",
  "https://onebuysales.com/",
  "https://totalclassifieds.com/",
  "https://comadz.com/",
  "https://profreeads.com/",
  "http://postezad.com/",
  "http://www.adslov.com/",
  "http://www.petadshub.com/",
  "https://fwebdirectory.com/",
  "https://adshoo.com/",
  "http://ursads.com/",
  "https://www.adpost.com/au/",
  "https://tokyo.craigslist.org/",
  "http://unolist.com.au/",
  "https://www.businesslistings.net.au/",
  "https://truefinders.com.au/",
  "http://www.vkclassifieds.net.au/",
  "https://www.topfreeclassifieds.com/",
  "https://www.adeexaustralia.com/",
  "https://foldads.com/",
  "http://nextfreeads.com/",
  "http://freebestads.com/",
  "http://getadsonline.com/",
  "http://eonlineads.com/",
  "http://freewebads.biz/",
  "http://freewebads.us/",
  "http://postherefree.com/",
  "https://freeadshome.com/",
  "https://realfreeweb.com/",
  "https://freeclassipress.com/",
  "http://letspostfree.com/",
  "https://www.postallads4free.com/",
  "https://www.muamat.com/",
  "http://postezads.com/",
  "http://instantadz.com/",
  "http://postquickads.com/",
  "http://classified4u.biz/",
  "http://classifieds4free.biz/",
  "https://web-free-ads.com/0/-",
  "https://freead1.net/",
  "http://www.adlandpro.com/",
  "http://www.multidimensions.net/",
  "http://globalclassified.net/",
  "http://classifiedonlineads.net/",
  "http://ezclassifiedads.com/",
  "http://freeadsonline.biz/",
  "https://www.hotfreelist.com/",
  "https://www.freeclassifiedssites.com/",
  "https://www.australianplanet.com/",
  "http://citynews.com/",
  "http://www.australialisted.com/",
  "https://www.oodle.com/",
  "https://www.justlanded.com/",
  "https://www.topclassifieds.com/",
  "https://www.expatriates.com/",
  "https://www.chaosads-australia.com/",
  "https://au.sellbuystuffs.com/",
  "http://www.gofreeclassified.com/",
  "https://eventsking.com/",
  "http://www.gopost.com.au/",
  "https://www.kugli.com/",
  "http://mypetads.com/",
  "https://posthereads.com/",
  "http://classified4free.net/",
  "https://www.adslov.com/",
  "https://adslov.com/",
  "https://petadshub.com/",
  "https://ursads.com/",
  "https://nextfreeads.com/",
  "https://letspostfree.com/",
  "https://classified4u.biz/",
  "https://classified4free.net/",
  "https://freebestads.com/",
  "https://getadsonline.com/",
  "https://globalclassified.net/",
  "https://eonlineads.com/",
  "https://freewebads.biz/",
  "https://freewebads.us/",
  "https://mypetads.com/",
  "https://postherefree.com/",
  "https://classifiedonlineads.net/",
  "https://ezclassifiedads.com/",
  "https://freeadsonline.biz/",
  "https://classifieds4free.biz/",
  "https://www.wallclassifieds.com/",
  "http://www.aunetads.com/",
  "https://classifieds7.com.au/",
  "https://doublelist24.com/",
  "https://www.yourdomain.com/",
  "https://doclassifieds.com/",
  "https://premiumclassified.com/",
  "https://freesmartlist.com/",
  "https://smartadposting.com/",
  "https://smartfreeads.com/",
  "https://reclassifed.com/",
  "https://reclassifeds.com/",
  "https://freead1.com/",
  "https://freeads1.com/"
];

// Generate dataset
const directories = [];

australiaClassifiedList.forEach((url, index) => {
  // Extract domain name for the directory name
  const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  const name = domain.split('.')[0];
  
  // Assign priority based on platform type and popularity
  let priority = 50; // Default priority
  
  // High priority platforms (major classified sites)
  if (domain.includes('gumtree') || domain.includes('locanto') || domain.includes('hotfrog') || 
      domain.includes('classifiedads') || domain.includes('justlanded') || domain.includes('oodle')) {
    priority = 90;
  }
  // Medium-high priority (established platforms)
  else if (domain.includes('auclassifieds') || domain.includes('postmyads') || domain.includes('businesslistings') ||
           domain.includes('adeexaustralia') || domain.includes('australianplanet') || domain.includes('expatriates')) {
    priority = 75;
  }
  // Medium priority (free classified platforms)
  else if (domain.includes('free') || domain.includes('classified') || domain.includes('ads')) {
    priority = 60;
  }
  // Lower priority (smaller platforms)
  else {
    priority = 40;
  }
  
  directories.push({
    classification: "Classified",
    name: `${name.charAt(0).toUpperCase() + name.slice(1)} Classified ${index + 1}`,
    url: url,
    country: "Australia",
    priority: priority,
    category: "business",
    description: `Australian classified ads platform for business listings and advertisements`,
    domain: domain,
    submissionUrl: url,
    isCustom: false,
    pageRank: Math.floor(Math.random() * 5) + 1,
    daScore: Math.floor(Math.random() * 40) + 20,
    spamScore: Math.floor(Math.random() * 5),
    status: "active",
    isPremium: priority >= 75,
    requiresApproval: true,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    rejectionRate: 0,
    freeUserLimit: 0,
    starterUserLimit: 3,
    proUserLimit: 10,
    businessUserLimit: 25,
    enterpriseUserLimit: -1
  });
});

// Save to JSON file
const jsonContent = directories.map(dir => 
  JSON.stringify(dir)
).join('\n');

fs.writeFileSync('classified_classification.json', jsonContent);

console.log(`✅ Generated ${directories.length} Classified entries`);
console.log(`📁 Saved to: classified_classification.json`);
console.log(`🌍 Australia: ${directories.length} platforms`);
console.log(`⭐ High Priority platforms: ${directories.filter(d => d.priority >= 75).length}`);
console.log(`📊 Priority Distribution:`);
console.log(`   High (90+): ${directories.filter(d => d.priority >= 90).length}`);
console.log(`   Medium-High (75-89): ${directories.filter(d => d.priority >= 75 && d.priority < 90).length}`);
console.log(`   Medium (60-74): ${directories.filter(d => d.priority >= 60 && d.priority < 75).length}`);
console.log(`   Low (40-59): ${directories.filter(d => d.priority < 60).length}`);
