const mongoose = require('mongoose');
const Directory = require('../models/directoryModel');
require('dotenv').config();

const SYSTEM_USER_ID = new mongoose.Types.ObjectId();

// All classifications from submission dashboard
const allClassifications = {
  'Article Submission': [
    { name: 'Medium', url: 'https://medium.com/', description: 'Popular blogging platform' },
    { name: 'Sooper Articles', url: 'https://www.sooperarticles.com/', description: 'Article submission directory' },
    { name: 'Amazines', url: 'https://www.amazines.com/', description: 'Article publishing platform' },
    { name: 'Niadd', url: 'https://www.niadd.com', description: 'Article directory' },
    { name: 'Tumblr', url: 'https://www.tumblr.com', description: 'Microblogging platform' },
    { name: 'Just Paste It', url: 'https://justpaste.it', description: 'Quick content sharing' },
    { name: 'Anotepad', url: 'https://anotepad.com', description: 'Note sharing platform' },
    { name: 'Patreon', url: 'https://www.patreon.com', description: 'Creator platform' },
    { name: 'Click4r', url: 'https://click4r.com', description: 'Content sharing platform' },
    { name: 'Diigo', url: 'https://www.diigo.com', description: 'Social bookmarking and annotation' }
  ],
  'Web2.0': [
    { name: 'WordPress', url: 'https://wordpress.com/', description: 'Popular CMS platform' },
    { name: 'Blogger', url: 'https://www.blogger.com/', description: 'Google\'s blogging platform' },
    { name: 'Evernote', url: 'https://evernote.com/', description: 'Note-taking platform' },
    { name: 'Weebly', url: 'https://www.weebly.com/in', description: 'Website builder' },
    { name: 'Yola', url: 'https://www.yola.com/', description: 'Website builder' },
    { name: 'Google Sites', url: 'https://sites.google.com/', description: 'Google website builder' },
    { name: 'Strikingly', url: 'https://www.strikingly.com/', description: 'Single-page website builder' },
    { name: 'Wikidot', url: 'http://www.wikidot.com/', description: 'Wiki platform' },
    { name: 'Scoop It', url: 'https://www.scoop.it/', description: 'Content curation platform' },
    { name: 'PBase', url: 'https://pbase.com/', description: 'Photo sharing platform' }
  ],
  'Social': [
    { name: 'Bookmarking Info', url: 'https://bookmarking.info/', description: 'Social bookmarking platform' },
    { name: 'Deals Classified', url: 'https://dealsclassified.online', description: 'Classified ads platform' },
    { name: 'City Classified', url: 'https://www.cityclassified.online', description: 'City classified ads' },
    { name: 'Bollywood Pasta', url: 'https://bollywoodpasta.com/', description: 'Entertainment platform' },
    { name: 'PR Bookmarking Club', url: 'https://prbookmarking.club', description: 'PR bookmarking service' },
    { name: 'Go Articles Info', url: 'https://www.goarticles.info/', description: 'Article bookmarking' },
    { name: 'SEO Khazana Tools', url: 'https://seokhazanatools.com', description: 'SEO tools platform' },
    { name: 'Samay Sawara', url: 'https://samaysawara.in', description: 'Content sharing platform' },
    { name: 'Local Bollywood Pasta', url: 'https://local.bollywoodpasta.com', description: 'Local entertainment' },
    { name: 'Samay Traffic', url: 'https://samaytraffic.samaysawara.in', description: 'Traffic generation' }
  ],
  'Local': [
    { name: 'True Local', url: 'https://www.truelocal.com.au/', description: 'Australian local business' },
    { name: '2 Find Local', url: 'https://www.2findlocal.com/', description: 'Local business finder' },
    { name: 'Start Local', url: 'https://www.startlocal.com.au/', description: 'Australian local business' },
    { name: 'Local Search', url: 'https://www.localsearch.com.au/', description: 'Australian local search' },
    { name: 'Local AU Directory', url: 'https://www.local.com.au/directory', description: 'Australian local directory' },
    { name: 'Local Business Guide', url: 'https://www.localbusinessguide.com.au/', description: 'Australian business guide' },
    { name: 'Look Local', url: 'https://www.looklocal.net.au/', description: 'Australian local directory' }
  ],
  'Classified': [
    { name: 'The West Classifieds', url: 'https://www.thewestclassifieds.com.au/', description: 'Western Australian classifieds' },
    { name: 'AU Free Ads', url: 'http://www.aufreeads.com/', description: 'Australian free ads' },
    { name: 'Locanto Australia', url: 'https://www.locanto.com.au/', description: 'Australian classifieds' },
    { name: 'Gumtree Australia', url: 'https://www.gumtree.com.au/', description: 'Australian classifieds' },
    { name: 'Hotfrog Australia', url: 'https://www.hotfrog.com.au/', description: 'Australian business directory' },
    { name: 'Just Landed Classifieds', url: 'https://classifieds.justlanded.com/', description: 'International classifieds' },
    { name: 'Post My Ads', url: 'https://www.postmyads.com.au/', description: 'Australian ad posting' },
    { name: 'Global Free Classified Ads', url: 'https://au.global-free-classified-ads.com/', description: 'Global free classifieds' },
    { name: 'AU Classifieds', url: 'https://www.auclassifieds.com.au/', description: 'Australian classifieds' },
    { name: 'Chaos Ads', url: 'https://www.chaosads.com/', description: 'Classified ads platform' }
  ],
  'Q&A': [
    { name: 'Quora', url: 'https://www.quora.com/', description: 'Question and answer platform' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions/ask', description: 'Developer Q&A platform' },
    { name: 'Reddit Ask', url: 'https://www.reddit.com/r/AskReddit/', description: 'Community discussion platform' },
    { name: 'SuperUser', url: 'https://superuser.com/questions/ask', description: 'Tech support Q&A' },
    { name: 'Answerbag', url: 'https://www.answerbag.com/', description: 'General Q&A platform' }
  ],
  'Press Release': [
    { name: 'PR Log', url: 'https://www.prlog.org/', description: 'Free press release distribution' },
    { name: '1888 Press Release', url: 'https://www.1888pressrelease.com/', description: 'Press release service' },
    { name: 'Press Box', url: 'https://www.pressbox.com/', description: 'Press release platform' },
    { name: '24-7 Press Release', url: 'https://www.24-7pressrelease.com/', description: '24/7 press release service' },
    { name: 'PR Newswire', url: 'https://www.prnewswire.com/', description: 'Leading press release service' },
    { name: 'Real Time Press Release', url: 'https://realtimepressrelease.com/', description: 'Real-time press releases' },
    { name: 'PRBD', url: 'http://www.prbd.net/', description: 'Press release platform' },
    { name: 'PR Fire UK', url: 'https://www.prfire.co.uk/', description: 'UK press release service' },
    { name: 'PR Urgent', url: 'https://www.prurgent.com/', description: 'Urgent press release service' },
    { name: 'Express Press Release', url: 'https://express-press-release.net/', description: 'Express press release' }
  ]
};

async function migrateAllClassifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let totalMigrated = 0;
    
    for (const [classification, sites] of Object.entries(allClassifications)) {
      console.log(`\n📝 Processing classification: ${classification} (${sites.length} sites)`);
      
      for (const site of sites) {
        try {
          const existingDirectory = await Directory.findOne({ name: site.name });
          if (existingDirectory) {
            console.log(`⚠️ Directory "${site.name}" already exists, skipping...`);
            continue;
          }

          const domain = new URL(site.url).hostname;
          
          const directory = new Directory({
            name: site.name,
            domain: domain,
            description: site.description,
            category: 'business',
            country: 'Global',
            classification: classification,
            pageRank: 4,
            daScore: 50,
            spamScore: 2,
            isPremium: false,
            requiresApproval: true,
            submissionUrl: site.url,
            contactEmail: `admin@${domain}`,
            submissionGuidelines: 'Please provide accurate business information',
            requiredFields: [
              { name: 'title', type: 'text', required: true },
              { name: 'description', type: 'textarea', required: true },
              { name: 'url', type: 'url', required: true }
            ],
            freeUserLimit: 0,
            starterUserLimit: 5,
            proUserLimit: 20,
            businessUserLimit: 50,
            enterpriseUserLimit: -1,
            priority: 10,
            status: 'active',
            isCustom: false,
            createdBy: SYSTEM_USER_ID
          });

          await directory.save();
          console.log(`✅ Migrated: ${site.name} (${classification})`);
          totalMigrated++;
          
        } catch (error) {
          console.error(`❌ Failed to migrate ${site.name}:`, error.message);
        }
      }
    }

    const classifications = await Directory.distinct('classification');
    console.log('\n📊 Final classifications:', classifications);
    
    const countByClassification = await Directory.aggregate([
      { $group: { _id: '$classification', count: { $sum: 1 } } }
    ]);
    console.log('📊 Count by classification:', countByClassification);

    console.log(`\n🎉 Successfully migrated ${totalMigrated} directories across ${Object.keys(allClassifications).length} classifications`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

migrateAllClassifications();
