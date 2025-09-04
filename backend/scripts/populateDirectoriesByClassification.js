const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

const directoriesByClassification = {
  directory: [
    {
      name: 'Google My Business',
      domain: 'business.google.com',
      description: 'Google\'s business directory and local search platform',
      classification: 'Business',
      category: 'business',
      country: 'Global',
      pageRank: 9,
      daScore: 95,
      status: 'active',
      priority: 10,
      isCustom: false,
      submissionUrl: 'https://business.google.com/create'
    },
    {
      name: 'Yelp',
      domain: 'yelp.com',
      description: 'Popular business review and directory platform',
      classification: 'Business',
      category: 'business',
      country: 'Global',
      pageRank: 8,
      daScore: 92,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://biz.yelp.com/signup'
    },
    {
      name: 'Yellow Pages',
      domain: 'yellowpages.com',
      description: 'Traditional business directory with online presence',
      classification: 'Business',
      category: 'business',
      country: 'Global',
      pageRank: 7,
      daScore: 88,
      status: 'active',
      priority: 8,
      isCustom: false,
      submissionUrl: 'https://www.yellowpages.com/add'
    },
    {
      name: 'Foursquare',
      domain: 'foursquare.com',
      description: 'Location-based social platform for businesses',
      classification: 'Business',
      category: 'business',
      country: 'Global',
      pageRank: 6,
      daScore: 85,
      status: 'active',
      priority: 7,
      isCustom: false,
      submissionUrl: 'https://foursquare.com/add'
    }
  ],
  article: [
    {
      name: 'Medium',
      domain: 'medium.com',
      description: 'Popular publishing platform for articles and stories',
      classification: 'Article Submission',
      category: 'other',
      country: 'Global',
      pageRank: 8,
      daScore: 90,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://medium.com/new-story'
    },
    {
      name: 'LinkedIn Articles',
      domain: 'linkedin.com',
      description: 'Professional article publishing on LinkedIn',
      classification: 'Article Submission',
      category: 'business',
      country: 'Global',
      pageRank: 9,
      daScore: 95,
      status: 'active',
      priority: 10,
      isCustom: false,
      submissionUrl: 'https://www.linkedin.com/post/new/'
    },
    {
      name: 'HubPages',
      domain: 'hubpages.com',
      description: 'Article publishing platform with revenue sharing',
      classification: 'Article Submission',
      category: 'other',
      country: 'Global',
      pageRank: 6,
      daScore: 80,
      status: 'active',
      priority: 6,
      isCustom: false,
      submissionUrl: 'https://hubpages.com/join'
    }
  ],
  press: [
    {
      name: 'PR Newswire',
      domain: 'prnewswire.com',
      description: 'Leading press release distribution service',
      classification: 'Press Release',
      category: 'business',
      country: 'Global',
      pageRank: 8,
      daScore: 88,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://www.prnewswire.com/'
    },
    {
      name: 'Business Wire',
      domain: 'businesswire.com',
      description: 'Global press release distribution platform',
      classification: 'Press Release',
      category: 'business',
      country: 'Global',
      pageRank: 7,
      daScore: 85,
      status: 'active',
      priority: 8,
      isCustom: false,
      submissionUrl: 'https://www.businesswire.com/portal/site/home/'
    },
    {
      name: 'PRWeb',
      domain: 'prweb.com',
      description: 'Online press release distribution service',
      classification: 'Press Release',
      category: 'business',
      country: 'Global',
      pageRank: 6,
      daScore: 82,
      status: 'active',
      priority: 7,
      isCustom: false,
      submissionUrl: 'https://www.prweb.com/'
    }
  ],
  australia: [
    {
      name: 'TrueLocal',
      domain: 'truelocal.com.au',
      description: 'Australian local business directory',
      classification: 'Local',
      category: 'business',
      country: 'Australia',
      pageRank: 6,
      daScore: 75,
      status: 'active',
      priority: 8,
      isCustom: false,
      submissionUrl: 'https://www.truelocal.com.au/add-business'
    },
    {
      name: 'Hotfrog Australia',
      domain: 'hotfrog.com.au',
      description: 'Australian business directory and marketplace',
      classification: 'Business',
      category: 'business',
      country: 'Australia',
      pageRank: 5,
      daScore: 70,
      status: 'active',
      priority: 7,
      isCustom: false,
      submissionUrl: 'https://www.hotfrog.com.au/add-business'
    }
  ],
  classified: [
    {
      name: 'Craigslist',
      domain: 'craigslist.org',
      description: 'Popular classified advertisements website',
      classification: 'Classified',
      category: 'other',
      country: 'Global',
      pageRank: 8,
      daScore: 90,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://post.craigslist.org/'
    },
    {
      name: 'Gumtree',
      domain: 'gumtree.com',
      description: 'Online classified ads and marketplace',
      classification: 'Classified',
      category: 'other',
      country: 'Global',
      pageRank: 7,
      daScore: 85,
      status: 'active',
      priority: 8,
      isCustom: false,
      submissionUrl: 'https://www.gumtree.com/post'
    }
  ],
  qa: [
    {
      name: 'Quora',
      domain: 'quora.com',
      description: 'Question and answer platform',
      classification: 'Q&A',
      category: 'other',
      country: 'Global',
      pageRank: 8,
      daScore: 92,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://www.quora.com/'
    },
    {
      name: 'Stack Overflow',
      domain: 'stackoverflow.com',
      description: 'Programming Q&A community',
      classification: 'Q&A',
      category: 'technology',
      country: 'Global',
      pageRank: 9,
      daScore: 95,
      status: 'active',
      priority: 10,
      isCustom: false,
      submissionUrl: 'https://stackoverflow.com/questions/ask'
    }
  ],
  social: [
    {
      name: 'Facebook Business',
      domain: 'facebook.com',
      description: 'Facebook business pages and listings',
      classification: 'Social',
      category: 'other',
      country: 'Global',
      pageRank: 9,
      daScore: 98,
      status: 'active',
      priority: 10,
      isCustom: false,
      submissionUrl: 'https://www.facebook.com/pages/create'
    },
    {
      name: 'Instagram Business',
      domain: 'instagram.com',
      description: 'Instagram business profiles and listings',
      classification: 'Social',
      category: 'other',
      country: 'Global',
      pageRank: 8,
      daScore: 95,
      status: 'active',
      priority: 9,
      isCustom: false,
      submissionUrl: 'https://business.instagram.com/'
    }
  ],
  local: [
    {
      name: 'Local.com',
      domain: 'local.com',
      description: 'Local business directory and search',
      classification: 'Local',
      category: 'business',
      country: 'Global',
      pageRank: 6,
      daScore: 80,
      status: 'active',
      priority: 7,
      isCustom: false,
      submissionUrl: 'https://www.local.com/add-business'
    },
    {
      name: 'Manta',
      domain: 'manta.com',
      description: 'Small business directory and networking',
      classification: 'Local',
      category: 'business',
      country: 'Global',
      pageRank: 5,
      daScore: 75,
      status: 'active',
      priority: 6,
      isCustom: false,
      submissionUrl: 'https://www.manta.com/add'
    }
  ]
};

async function populateDirectories() {
  try {
    console.log('🚀 Starting directory population by classification...\n');
    
    // Get system admin user for createdBy field
    let adminUser = await User.findOne({ email: 'system@opptym.com' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    
    // Clear existing directories
    console.log('🧹 Clearing existing directories...');
    await Directory.deleteMany({});
    console.log('✅ Cleared existing directories\n');
    
    let totalInserted = 0;
    
    // Insert directories by classification
    for (const [classification, directories] of Object.entries(directoriesByClassification)) {
      console.log(`📁 Inserting ${directories.length} directories for classification: ${classification}`);
      
      const directoriesWithCreator = directories.map(dir => ({
        ...dir,
        createdBy: adminUser._id
      }));
      
      const inserted = await Directory.insertMany(directoriesWithCreator);
      totalInserted += inserted.length;
      
      console.log(`✅ Inserted ${inserted.length} directories for ${classification}`);
    }
    
    console.log(`\n🎉 Directory population completed successfully!`);
    console.log(`📊 Total directories inserted: ${totalInserted}`);
    
    // Show summary by classification
    console.log('\n📋 Summary by Classification:');
    console.log('============================');
    for (const [classification, directories] of Object.entries(directoriesByClassification)) {
      console.log(`${classification}: ${directories.length} directories`);
    }
    
  } catch (error) {
    console.error('❌ Error populating directories:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Populate directories
populateDirectories();
