const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

const socialDirectories = [
  { name: 'Facebook Social', domain: 'facebook.com', submissionUrl: 'https://www.facebook.com/pages/create' },
  { name: 'Instagram Social', domain: 'instagram.com', submissionUrl: 'https://business.instagram.com' },
  { name: 'Twitter Social', domain: 'twitter.com', submissionUrl: 'https://business.twitter.com' },
  { name: 'LinkedIn Social', domain: 'linkedin.com', submissionUrl: 'https://www.linkedin.com/company' },
  { name: 'Pinterest Social', domain: 'pinterest.com', submissionUrl: 'https://business.pinterest.com' },
  { name: 'TikTok Social', domain: 'tiktok.com', submissionUrl: 'https://business.tiktok.com' },
  { name: 'Snapchat Social', domain: 'snapchat.com', submissionUrl: 'https://business.snapchat.com' },
  { name: 'YouTube Social', domain: 'youtube.com', submissionUrl: 'https://www.youtube.com/channel' },
  { name: 'Reddit Social', domain: 'reddit.com', submissionUrl: 'https://www.reddit.com/r/redditads' },
  { name: 'Tumblr Social', domain: 'tumblr.com', submissionUrl: 'https://www.tumblr.com' },
  { name: 'Flickr Social', domain: 'flickr.com', submissionUrl: 'https://www.flickr.com' },
  { name: 'Vimeo Social', domain: 'vimeo.com', submissionUrl: 'https://vimeo.com' },
  { name: 'Dailymotion Social', domain: 'dailymotion.com', submissionUrl: 'https://www.dailymotion.com' },
  { name: 'Twitch Social', domain: 'twitch.tv', submissionUrl: 'https://www.twitch.tv' },
  { name: 'Discord Social', domain: 'discord.com', submissionUrl: 'https://discord.com' },
  { name: 'Telegram Social', domain: 'telegram.org', submissionUrl: 'https://telegram.org' },
  { name: 'WhatsApp Social', domain: 'whatsapp.com', submissionUrl: 'https://www.whatsapp.com/business' },
  { name: 'Signal Social', domain: 'signal.org', submissionUrl: 'https://signal.org' },
  { name: 'Viber Social', domain: 'viber.com', submissionUrl: 'https://www.viber.com' },
  { name: 'WeChat Social', domain: 'wechat.com', submissionUrl: 'https://www.wechat.com' }
];

async function addSocialDirectories() {
  try {
    console.log('🚀 Adding Social directories...\n');
    
    // Get admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    const directoriesWithMetadata = socialDirectories.map((dir, index) => ({
      name: dir.name,
      domain: dir.domain,
      description: `${dir.name} - Professional social media platform`,
      classification: 'Social',
      category: 'other',
      country: 'Global',
      pageRank: Math.floor(Math.random() * 5) + 5, // 5-10
      daScore: Math.floor(Math.random() * 30) + 70, // 70-100
      status: 'active',
      priority: Math.floor(Math.random() * 10) + 1, // 1-10
      isCustom: false,
      submissionUrl: dir.submissionUrl,
      createdBy: adminUser._id
    }));
    
    const inserted = await Directory.insertMany(directoriesWithMetadata);
    console.log(`✅ Inserted ${inserted.length} Social directories`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSocialDirectories();
