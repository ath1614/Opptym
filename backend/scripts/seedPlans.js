const mongoose = require('mongoose');
const Plan = require('../models/planModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for plan seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed plans data
const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started with basic SEO tools',
    features: [
      'Basic SEO Tools',
      '1 Project',
      '5 Submissions/month',
      'Community Support',
      'Basic Analytics'
    ],
    price: {
      monthly: 0,
      yearly: 0
    },
    limits: {
      projects: 1,
      submissions: 5,
      tools: 10,
      apiCalls: 20
    },
    stripePriceIds: {
      monthly: null,
      yearly: null
    },
    trialDays: 7,
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    metadata: {
      color: 'gray',
      gradient: 'from-gray-400 to-gray-500',
      icon: 'star'
    }
  },
  {
    name: 'Test',
    description: 'Test payment functionality with ₹10',
    features: [
      'All Features',
      '1 SEO Project',
      'Test Payment',
      'Email Support',
      'Basic Analytics',
      'Payment Testing'
    ],
    price: {
      monthly: 10,
      yearly: 100
    },
    limits: {
      projects: 1,
      submissions: 10,
      tools: 10,
      apiCalls: 20
    },
    stripePriceIds: {
      monthly: 'price_test_10_rs',
      yearly: 'price_test_10_rs_yearly'
    },
    trialDays: 0,
    isActive: true,
    isPopular: false,
    sortOrder: 2,
    metadata: {
      color: 'orange',
      gradient: 'from-orange-400 to-red-500',
      icon: 'gift'
    }
  },
  {
    name: 'Starter',
    description: 'For growing businesses and individual marketers',
    features: [
      'Advanced SEO Tools',
      '5 Projects',
      '150 Submissions/month',
      'Priority Support',
      'Advanced Analytics',
      'Email Reports'
    ],
    price: {
      monthly: 999,
      yearly: 9990
    },
    limits: {
      projects: 5,
      submissions: 150,
      tools: 100,
      apiCalls: 500
    },
    stripePriceIds: {
      monthly: 'price_1Ro1LgCD7oezJBDYCEE71gAc',
      yearly: 'price_1Ro1LgCD7oezJBDYCEE71gAc'
    },
    trialDays: 14,
    isActive: true,
    isPopular: true,
    sortOrder: 3,
    metadata: {
      color: 'green',
      gradient: 'from-green-400 to-green-600',
      icon: 'zap'
    }
  },
  {
    name: 'Pro',
    description: 'For established businesses and agencies',
    features: [
      'All SEO Tools',
      '15 Projects',
      '750 Submissions/month',
      'Priority Support',
      'Advanced Analytics',
      'API Access',
      'White-label Reports'
    ],
    price: {
      monthly: 1999,
      yearly: 19990
    },
    limits: {
      projects: 15,
      submissions: 750,
      tools: 500,
      apiCalls: 2000
    },
    stripePriceIds: {
      monthly: 'price_1Ro1MYCD7oezJBDYgAXVoUw6',
      yearly: 'price_1Ro1RGCD7oezJBDY2yHsrEur'
    },
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 4,
    metadata: {
      color: 'blue',
      gradient: 'from-blue-400 to-blue-600',
      icon: 'trending-up'
    }
  },
  {
    name: 'Business',
    description: 'For large enterprises and multiple teams',
    features: [
      'Enterprise Features',
      '50 Projects',
      '1500 Submissions/month',
      'Dedicated Support',
      'Custom Analytics',
      'Full API Access',
      'Team Management',
      'Advanced Security'
    ],
    price: {
      monthly: 3999,
      yearly: 39990
    },
    limits: {
      projects: 50,
      submissions: 1500,
      tools: 1000,
      apiCalls: 5000
    },
    stripePriceIds: {
      monthly: 'price_1Ro1NQCD7oezJBDYE4IX9qPE',
      yearly: 'price_1Ro1TBCD7oezJBDYEEJGaA75'
    },
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 5,
    metadata: {
      color: 'purple',
      gradient: 'from-purple-400 to-purple-600',
      icon: 'crown'
    }
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    features: [
      'Custom Features',
      'Unlimited Projects',
      'Unlimited Submissions',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Options',
      'Custom Training'
    ],
    price: {
      monthly: 9999,
      yearly: 99990
    },
    limits: {
      projects: -1, // Unlimited
      submissions: -1, // Unlimited
      tools: -1, // Unlimited
      apiCalls: -1 // Unlimited
    },
    stripePriceIds: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    },
    trialDays: 30,
    isActive: true,
    isPopular: false,
    sortOrder: 6,
    metadata: {
      color: 'red',
      gradient: 'from-red-400 to-red-600',
      icon: 'shield'
    }
  }
];

// Seed function
const seedPlans = async () => {
  try {
    console.log('🌱 Starting plan seeding...');
    
    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️ Cleared existing plans');
    
    // Insert new plans
    const insertedPlans = await Plan.insertMany(plans);
    console.log(`✅ Successfully seeded ${insertedPlans.length} plans`);
    
    // Display seeded plans
    insertedPlans.forEach(plan => {
      console.log(`📋 ${plan.name}: ₹${plan.price.monthly}/month, ₹${plan.price.yearly}/year`);
    });
    
    console.log('🎉 Plan seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(() => {
    seedPlans();
  });
}

module.exports = { seedPlans };
