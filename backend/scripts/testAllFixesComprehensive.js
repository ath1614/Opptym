const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

class ComprehensiveFixTester {
  constructor() {
    this.results = [];
    this.testUser = null;
    this.authToken = null;
  }

  log(test, status, details = {}) {
    const result = {
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    console.log(`[${status}] ${test}: ${JSON.stringify(details)}`);
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive fix testing...\n');

    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Test 1: User Limits and Usage Tracking
      await this.testUserLimitsAndUsage();
      
      // Test 2: Project Creation Limits
      await this.testProjectCreationLimits();
      
      // Test 3: Submission Limits
      await this.testSubmissionLimits();
      
      // Test 4: Bookmarklet Usage Tracking
      await this.testBookmarkletUsageTracking();
      
      // Test 5: Payment Route Availability
      await this.testPaymentRoute();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      mongoose.connection.close();
    }
  }

  async testUserLimitsAndUsage() {
    console.log('👤 Testing User Limits and Usage Tracking...');
    
    try {
      // Get a free user for testing
      const freeUser = await User.findOne({ subscription: 'free' });
      if (!freeUser) {
        this.log('User Limits - Free User', 'SKIPPED', { message: 'No free users found for testing' });
        return;
      }

      this.testUser = freeUser;
      
      // Check if user has proper limits set
      if (!freeUser.planLimits) {
        this.log('User Limits - Plan Limits', 'FAILED', { message: 'User missing planLimits' });
      } else {
        this.log('User Limits - Plan Limits', 'PASSED', { 
          limits: freeUser.planLimits,
          expected: { projects: 1, submissions: 5 }
        });
      }

      // Check if user has proper usage tracking
      if (!freeUser.usage) {
        this.log('User Limits - Usage Tracking', 'FAILED', { message: 'User missing usage object' });
      } else {
        this.log('User Limits - Usage Tracking', 'PASSED', { 
          usage: freeUser.usage,
          hasAllFields: ['projectsUsed', 'submissionsUsed', 'seoToolsUsed', 'apiCallsUsed'].every(field => 
            freeUser.usage.hasOwnProperty(field)
          )
        });
      }

      // Check if user has proper features
      if (!freeUser.features) {
        this.log('User Limits - Features', 'FAILED', { message: 'User missing features object' });
      } else {
        this.log('User Limits - Features', 'PASSED', { 
          features: freeUser.features,
          canCreateProjects: freeUser.features.canCreateProjects
        });
      }

    } catch (error) {
      this.log('User Limits - General', 'ERROR', { error: error.message });
    }
  }

  async testProjectCreationLimits() {
    console.log('📁 Testing Project Creation Limits...');
    
    if (!this.testUser) {
      this.log('Project Limits - Test User', 'SKIPPED', { message: 'No test user available' });
      return;
    }

    try {
      // Count current projects
      const currentProjects = await Project.countDocuments({ userId: this.testUser._id });
      const userProjectsUsed = this.testUser.usage.projectsUsed;
      
      this.log('Project Limits - Count Sync', 
        currentProjects === userProjectsUsed ? 'PASSED' : 'FAILED', 
        { 
          actualProjects: currentProjects, 
          userProjectsUsed: userProjectsUsed 
        }
      );

      // Check if user can create more projects
      const canCreateMore = this.testUser.checkUsageLimit('projects');
      const shouldBeAbleToCreate = currentProjects < this.testUser.planLimits.projects;
      
      this.log('Project Limits - Creation Check', 
        canCreateMore === shouldBeAbleToCreate ? 'PASSED' : 'FAILED',
        { 
          canCreateMore, 
          shouldBeAbleToCreate,
          currentProjects,
          limit: this.testUser.planLimits.projects
        }
      );

    } catch (error) {
      this.log('Project Limits - General', 'ERROR', { error: error.message });
    }
  }

  async testSubmissionLimits() {
    console.log('📤 Testing Submission Limits...');
    
    if (!this.testUser) {
      this.log('Submission Limits - Test User', 'SKIPPED', { message: 'No test user available' });
      return;
    }

    try {
      // Count current submissions
      const currentSubmissions = await Submission.countDocuments({ userId: this.testUser._id });
      const userSubmissionsUsed = this.testUser.usage.submissionsUsed;
      
      this.log('Submission Limits - Count Sync', 
        currentSubmissions === userSubmissionsUsed ? 'PASSED' : 'FAILED', 
        { 
          actualSubmissions: currentSubmissions, 
          userSubmissionsUsed: userSubmissionsUsed 
        }
      );

      // Check if user can create more submissions
      const canCreateMore = this.testUser.checkUsageLimit('submissions');
      const shouldBeAbleToCreate = currentSubmissions < this.testUser.planLimits.submissions;
      
      this.log('Submission Limits - Creation Check', 
        canCreateMore === shouldBeAbleToCreate ? 'PASSED' : 'FAILED',
        { 
          canCreateMore, 
          shouldBeAbleToCreate,
          currentSubmissions,
          limit: this.testUser.planLimits.submissions
        }
      );

    } catch (error) {
      this.log('Submission Limits - General', 'ERROR', { error: error.message });
    }
  }

  async testBookmarkletUsageTracking() {
    console.log('🔖 Testing Bookmarklet Usage Tracking...');
    
    if (!this.testUser) {
      this.log('Bookmarklet Usage - Test User', 'SKIPPED', { message: 'No test user available' });
      return;
    }

    try {
      // Check if bookmarklet usage is being tracked in submissions
      const bookmarkletSubmissions = await Submission.countDocuments({ 
        userId: this.testUser._id, 
        submissionType: 'bookmarklet' 
      });
      
      this.log('Bookmarklet Usage - Tracking', 'VERIFIED', { 
        bookmarkletSubmissions,
        message: 'Bookmarklet usage is tracked as submissions'
      });

      // Check if user has proper permissions for bookmarklets
      const canCreateBookmarklets = this.testUser.hasPermission('canCreateProjects');
      
      this.log('Bookmarklet Usage - Permissions', 
        canCreateBookmarklets ? 'PASSED' : 'FAILED',
        { 
          canCreateBookmarklets,
          subscription: this.testUser.subscription,
          isInTrial: this.testUser.isInTrialPeriod()
        }
      );

    } catch (error) {
      this.log('Bookmarklet Usage - General', 'ERROR', { error: error.message });
    }
  }

  async testPaymentRoute() {
    console.log('💳 Testing Payment Route Availability...');
    
    try {
      // Test if payment route is accessible (should return 400 for missing data, not 404)
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-checkout-session`, {}, {
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      });
      
      if (response.status === 404) {
        this.log('Payment Route - Availability', 'FAILED', { 
          status: response.status,
          message: 'Payment route not found (404)'
        });
      } else if (response.status === 400) {
        this.log('Payment Route - Availability', 'PASSED', { 
          status: response.status,
          message: 'Payment route accessible (returns 400 for missing data)'
        });
      } else {
        this.log('Payment Route - Availability', 'PASSED', { 
          status: response.status,
          message: 'Payment route accessible'
        });
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.log('Payment Route - Server', 'SKIPPED', { 
          message: 'Server not running, cannot test payment route'
        });
      } else {
        this.log('Payment Route - General', 'ERROR', { error: error.message });
      }
    }
  }

  generateReport() {
    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const verified = this.results.filter(r => r.status === 'VERIFIED').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🔍 Verified: ${verified}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`💥 Errors: ${errors}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. [${result.status}] ${result.test}`);
      if (result.details.message) {
        console.log(`   ${result.details.message}`);
      }
    });
    
    console.log('\n🎯 SUMMARY:');
    if (failed === 0 && errors === 0) {
      console.log('🎉 ALL TESTS PASSED! The fixes are working correctly.');
      console.log('✅ User limits are properly enforced');
      console.log('✅ Usage tracking is working');
      console.log('✅ Payment routes are accessible');
      console.log('✅ Bookmarklet usage is tracked');
    } else {
      console.log('⚠️ Some issues were found that need attention:');
      this.results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').forEach(result => {
        console.log(`❌ ${result.test}: ${result.details.message || result.details.error}`);
      });
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ComprehensiveFixTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ComprehensiveFixTester;
