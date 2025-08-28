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
  country: { 
    type: String, 
    default: 'Global',
    enum: ['Global', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Singapore', 'South Korea', 'China', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Ethiopia', 'Uganda', 'Tanzania', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'Congo', 'Cameroon', 'Gabon', 'Chad', 'Niger', 'Mali', 'Burkina Faso', 'Senegal', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast', 'Togo', 'Benin', 'Central African Republic', 'Equatorial Guinea', 'Sao Tome and Principe', 'Cape Verde', 'Mauritania', 'Gambia', 'Guinea-Bissau', 'Comoros', 'Seychelles', 'Mauritius', 'Madagascar', 'Malawi', 'Lesotho', 'Eswatini', 'Other']
  },
  classification: { 
    type: String, 
    default: 'General',
    enum: ['General', 'Business', 'Technology', 'Health', 'Education', 'Finance', 'Entertainment', 'Sports', 'Travel', 'Food', 'Lifestyle', 'News', 'Shopping', 'Real Estate', 'Automotive', 'Fashion', 'Beauty', 'Home & Garden', 'Pets', 'Books', 'Music', 'Movies', 'Gaming', 'Software', 'Web Development', 'Marketing', 'SEO', 'Design', 'Photography', 'Video', 'Podcasting', 'Blogging', 'Social Media', 'E-commerce', 'B2B', 'B2C', 'Non-profit', 'Government', 'Legal', 'Medical', 'Dental', 'Veterinary', 'Fitness', 'Yoga', 'Meditation', 'Cooking', 'Recipes', 'Restaurants', 'Hotels', 'Vacation', 'Adventure', 'Outdoor', 'Fishing', 'Hunting', 'Gardening', 'DIY', 'Crafts', 'Art', 'Photography', 'Videography', 'Music Production', 'Writing', 'Translation', 'Consulting', 'Coaching', 'Training', 'Tutoring', 'Other']
  },
  isCustom: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
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