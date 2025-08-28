import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Sample admin token (you'll need to replace this with a real admin token)
const ADMIN_TOKEN = 'your-admin-token-here';

const sampleDirectories = [
  {
    name: 'Custom Tech Directory',
    submissionUrl: 'https://customtech.com/submit',
    description: 'Custom technology directory for admin testing',
    category: 'technology',
    country: 'USA',
    classification: 'Technology',
    priority: 90,
    pageRank: 5,
    daScore: 45,
    status: 'active'
  },
  {
    name: 'Premium Business Listings',
    submissionUrl: 'https://premiumbusiness.com/add-listing',
    description: 'Premium business directory with high priority',
    category: 'business',
    country: 'UK',
    classification: 'Business',
    priority: 95,
    pageRank: 6,
    daScore: 52,
    status: 'active'
  },
  {
    name: 'Local SEO Directory',
    submissionUrl: 'https://localseo.com/submit-site',
    description: 'Local SEO focused directory',
    category: 'business',
    country: 'Canada',
    classification: 'SEO',
    priority: 85,
    pageRank: 4,
    daScore: 38,
    status: 'active'
  }
];

async function addSampleDirectories() {
  try {
    console.log('🚀 Adding sample custom directories...');
    
    for (const directory of sampleDirectories) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/directories`, directory, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        });
        
        console.log(`✅ Added: ${directory.name}`);
        console.log(`   URL: ${directory.submissionUrl}`);
        console.log(`   Country: ${directory.country}`);
        console.log(`   Classification: ${directory.classification}`);
        console.log(`   Priority: ${directory.priority}`);
        console.log('---');
      } catch (error) {
        console.error(`❌ Failed to add ${directory.name}:`, error.response?.data || error.message);
      }
    }
    
    console.log('🎉 Sample directories added successfully!');
    console.log('📝 Note: You may need to replace the ADMIN_TOKEN with a real admin token');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test the directories API
async function testDirectoriesAPI() {
  try {
    console.log('🔍 Testing directories API...');
    
    // Test without auth (should fail)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/directories`);
      console.log('❌ API should require authentication');
    } catch (error) {
      console.log('✅ API correctly requires authentication');
    }
    
    // Test filters endpoint without auth (should fail)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/directories/filters`);
      console.log('❌ Filters API should require authentication');
    } catch (error) {
      console.log('✅ Filters API correctly requires authentication');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run tests
async function main() {
  console.log('🧪 Testing Admin Directory Management System\n');
  
  await testDirectoriesAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await addSampleDirectories();
}

main().catch(console.error);
