const mongoose = require('mongoose');
const User = require('../models/userModel');
const Directory = require('../models/directoryModel');
const PricingPlan = require('../models/pricingPlanModel');

// Sample directories data
const sampleDirectories = [
  {
    name: 'Blahoo',
    domain: 'www.blahoo.net',
    description: 'Web directory for business listings',
    category: 'business',
    country: 'Global',
    classification: 'Business',
    pageRank: 3,
    daScore: 45,
    spamScore: 2,
    isPremium: false,
    requiresApproval: true,
    submissionUrl: 'https://www.blahoo.net/submit',
    contactEmail: 'admin@blahoo.net',
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
    status: 'active'
  },
  {
    name: 'Caida',
    domain: 'caida.eu',
    description: 'European directory for local businesses',
    category: 'business',
    country: 'Germany',
    classification: 'Business',
    pageRank: 4,
    daScore: 52,
    spamScore: 1,
    isPremium: false,
    requiresApproval: true,
    submissionUrl: 'https://caida.eu/submit.php',
    contactEmail: 'submit@caida.eu',
    submissionGuidelines: 'European businesses only',
    requiredFields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'url', type: 'url', required: true },
      { name: 'country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands'] }
    ],
    freeUserLimit: 0,
    starterUserLimit: 3,
    proUserLimit: 15,
    businessUserLimit: 40,
    enterpriseUserLimit: -1,
    priority: 15,
    status: 'active'
  },
  {
    name: 'SEO Deep Links',
    domain: 'www.seodeeplinks.net',
    description: 'SEO-focused directory for better rankings',
    category: 'technology',
    country: 'Global',
    classification: 'SEO',
    pageRank: 5,
    daScore: 65,
    spamScore: 1,
    isPremium: true,
    requiresApproval: true,
    submissionUrl: 'https://www.seodeeplinks.net/submit',
    contactEmail: 'seo@seodeeplinks.net',
    submissionGuidelines: 'High-quality websites only',
    requiredFields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'url', type: 'url', required: true },
      { name: 'keywords', type: 'text', required: false }
    ],
    freeUserLimit: 0,
    starterUserLimit: 2,
    proUserLimit: 10,
    businessUserLimit: 25,
    enterpriseUserLimit: -1,
    priority: 20,
    status: 'active'
  }
];

// Sample pricing plans data
const samplePricingPlans = [
  {
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      { name: '5 Projects', description: 'Create up to 5 projects' },
      { name: '50 Submissions/month', description: 'Submit to 50 directories per month' },
      { name: 'Basic SEO Tools', description: 'Access to basic SEO analysis tools' },
      { name: 'Email Support', description: 'Email support during business hours' }
    ],
    limits: {
      projects: 5,
      submissions: 50,
      seoTools: 3,
      bookmarklets: 1
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1
  },
  {
    name: 'Starter',
    price: 9.99,
    billingCycle: 'monthly',
    features: [
      { name: '25 Projects', description: 'Create up to 25 projects' },
      { name: '200 Submissions/month', description: 'Submit to 200 directories per month' },
      { name: 'All SEO Tools', description: 'Access to all SEO analysis tools' },
      { name: 'Priority Support', description: 'Priority email and chat support' },
      { name: 'Advanced Analytics', description: 'Advanced reporting and analytics' }
    ],
    limits: {
      projects: 25,
      submissions: 200,
      seoTools: 15,
      bookmarklets: 5
    },
    isActive: true,
    isPopular: false,
    sortOrder: 2
  },
  {
    name: 'Pro',
    price: 39.99,
    billingCycle: 'monthly',
    features: [
      { name: '100 Projects', description: 'Create up to 100 projects' },
      { name: '1000 Submissions/month', description: 'Submit to 1000 directories per month' },
      { name: 'All SEO Tools', description: 'Access to all SEO analysis tools' },
      { name: '24/7 Support', description: '24/7 priority support' },
      { name: 'White-label Reports', description: 'Custom branded reports' },
      { name: 'API Access', description: 'Full API access for integrations' }
    ],
    limits: {
      projects: 100,
      submissions: 1000,
      seoTools: 15,
      bookmarklets: 20
    },
    isActive: true,
    isPopular: true,
    sortOrder: 3
  },
  {
    name: 'Business',
    price: 89.99,
    billingCycle: 'monthly',
    features: [
      { name: 'Unlimited Projects', description: 'Create unlimited projects' },
      { name: 'Unlimited Submissions', description: 'Submit to unlimited directories' },
      { name: 'All SEO Tools', description: 'Access to all SEO analysis tools' },
      { name: 'Dedicated Support', description: 'Dedicated account manager' },
      { name: 'Custom Integrations', description: 'Custom integrations and API access' },
      { name: 'Team Management', description: 'Full team management features' }
    ],
    limits: {
      projects: -1,
      submissions: -1,
      seoTools: 15,
      bookmarklets: -1
    },
    isActive: true,
    isPopular: false,
    sortOrder: 4
  }
];

async function populateSampleData() {
  try {
    console.log('🚀 Starting database population...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Create a system admin user for createdBy field
    console.log('👤 Creating system admin user...');
    let adminUser = await User.findOne({ email: 'system@opptym.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'system_admin',
        email: 'system@opptym.com',
        password: 'system_password_2024',
        firstName: 'System',
        lastName: 'Admin',
        isAdmin: true,
        subscription: 'enterprise',
        status: 'active'
      });
      await adminUser.save();
    }
    console.log('✅ System admin user ready');
    
    // Clear existing sample data
    console.log('🧹 Clearing existing sample data...');
    await Directory.deleteMany({ name: { $in: sampleDirectories.map(d => d.name) } });
    await PricingPlan.deleteMany({ name: { $in: samplePricingPlans.map(p => p.name) } });
    console.log('✅ Cleared existing sample data');
    
    // Insert sample directories
    console.log('📁 Inserting sample directories...');
    const directoriesWithCreator = sampleDirectories.map(dir => ({
      ...dir,
      createdBy: adminUser._id
    }));
    const directories = await Directory.insertMany(directoriesWithCreator);
    console.log(`✅ Inserted ${directories.length} directories`);
    
    // Insert sample pricing plans
    console.log('💰 Inserting sample pricing plans...');
    const pricingPlans = await PricingPlan.insertMany(samplePricingPlans);
    console.log(`✅ Inserted ${pricingPlans.length} pricing plans`);
    
    console.log('🎉 Database population completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Directories: ${directories.length}`);
    console.log(`   - Pricing Plans: ${pricingPlans.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

// Run the script
populateSampleData();
