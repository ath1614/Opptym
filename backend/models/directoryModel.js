const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  // Basic Info
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  domain: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['business', 'technology', 'health', 'education', 'finance', 'entertainment', 'sports', 'travel', 'food', 'lifestyle', 'other']
  },
  
  // SEO Metrics
  pageRank: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10
  },
  daScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  spamScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 17
  },
  
  // Status & Access
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'rejected'], 
    default: 'active' 
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  requiresApproval: { 
    type: Boolean, 
    default: true 
  },
  
  // Submission Requirements
  submissionUrl: { 
    type: String, 
    required: true 
  },
  contactEmail: { 
    type: String 
  },
  submissionGuidelines: { 
    type: String 
  },
  requiredFields: [{
    name: String,
    type: { type: String, enum: ['text', 'email', 'url', 'textarea', 'select'] },
    required: Boolean,
    options: [String] // For select fields
  }],
  
  // Usage Tracking
  totalSubmissions: { 
    type: Number, 
    default: 0 
  },
  successfulSubmissions: { 
    type: Number, 
    default: 0 
  },
  rejectionRate: { 
    type: Number, 
    default: 0 
  },
  
  // Subscription Limits
  freeUserLimit: { 
    type: Number, 
    default: 0 
  },
  starterUserLimit: { 
    type: Number, 
    default: 5 
  },
  proUserLimit: { 
    type: Number, 
    default: 20 
  },
  businessUserLimit: { 
    type: Number, 
    default: 50 
  },
  enterpriseUserLimit: { 
    type: Number, 
    default: -1 // Unlimited
  },
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware
directorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for success rate
directorySchema.virtual('successRate').get(function() {
  if (this.totalSubmissions === 0) return 0;
  return Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
});

// Method to check if user can submit based on subscription
directorySchema.methods.canUserSubmit = function(userSubscription) {
  const limits = {
    free: this.freeUserLimit,
    starter: this.starterUserLimit,
    pro: this.proUserLimit,
    business: this.businessUserLimit,
    enterprise: this.enterpriseUserLimit
  };
  
  const limit = limits[userSubscription] || 0;
  return limit === -1 || this.totalSubmissions < limit;
};

// Method to increment submission count
directorySchema.methods.incrementSubmission = function(successful = false) {
  this.totalSubmissions += 1;
  if (successful) {
    this.successfulSubmissions += 1;
  }
  this.rejectionRate = this.totalSubmissions > 0 
    ? Math.round(((this.totalSubmissions - this.successfulSubmissions) / this.totalSubmissions) * 100)
    : 0;
  return this.save();
};

module.exports = mongoose.model('Directory', directorySchema); 