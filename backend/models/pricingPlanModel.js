const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'lifetime'],
    default: 'monthly'
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    projects: {
      type: Number,
      default: 1
    },
    submissions: {
      type: Number,
      default: 10
    },
    teamMembers: {
      type: Number,
      default: 1
    },
    automationRuns: {
      type: Number,
      default: 50
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    customIntegrations: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  stripePriceId: {
    type: String,
    default: null
  },
  stripeProductId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
pricingPlanSchema.index({ isActive: 1, sortOrder: 1 });
pricingPlanSchema.index({ name: 1 });

// Virtual for formatted price
pricingPlanSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for annual price (if monthly)
pricingPlanSchema.virtual('annualPrice').get(function() {
  if (this.billingCycle === 'monthly') {
    return this.price * 12;
  }
  return this.price;
});

// Method to check if plan has a specific feature
pricingPlanSchema.methods.hasFeature = function(featureName) {
  const feature = this.features.find(f => f.name === featureName);
  return feature ? feature.included : false;
};

// Method to get feature limit
pricingPlanSchema.methods.getLimit = function(limitName) {
  return this.limits[limitName] || 0;
};

// Method to check if user can perform action based on limits
pricingPlanSchema.methods.canPerformAction = function(action, currentUsage = 0) {
  const limit = this.getLimit(action);
  return limit === -1 || currentUsage < limit; // -1 means unlimited
};

// Static method to get active plans
pricingPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
};

// Static method to get plan by name
pricingPlanSchema.statics.getPlanByName = function(name) {
  return this.findOne({ name, isActive: true });
};

// Pre-save middleware to ensure unique name
pricingPlanSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingPlan = await this.constructor.findOne({ 
      name: this.name, 
      _id: { $ne: this._id } 
    });
    if (existingPlan) {
      throw new Error('Plan with this name already exists');
    }
  }
  next();
});

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);
