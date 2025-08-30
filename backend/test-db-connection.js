const mongoose = require('mongoose');
const PricingPlan = require('./models/pricingPlanModel');
const Directory = require('./models/directoryModel');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Database Connection...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', mongoose.connection.db.databaseName);
    
    // Check pricing plans
    console.log('\n📊 Checking Pricing Plans...');
    const pricingPlans = await PricingPlan.find({});
    console.log(`Found ${pricingPlans.length} pricing plans:`);
    pricingPlans.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price}`);
    });
    
    // Check directories
    console.log('\n📁 Checking Directories...');
    const directories = await Directory.find({});
    console.log(`Found ${directories.length} directories:`);
    directories.forEach(dir => {
      console.log(`  - ${dir.name}: ${dir.domain}`);
    });
    
    // Check collections
    console.log('\n🗂️ Checking Collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
