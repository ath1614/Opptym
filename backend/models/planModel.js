const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  price: {
    monthly: {
      type: Number,
      required: true,
      min: 0
    },
    yearly: {
      type: Number,
      required: true,
      min: 0
    }
  },
  limits: {
    projects: {
      type: Number,
      required: true,
      min: -1  // -1 means unlimited
    },
    submissions: {
      type: Number,
      required: true,
      min: -1  // -1 means unlimited
    },
    tools: {
      type: Number,
      required: true,
      min: -1  // -1 means unlimited
    },
    apiCalls: {
      type: Number,
      required: true,
      min: -1  // -1 means unlimited
    }
  },
  stripePriceIds: {
    monthly: {
      type: String,
      trim: true
    },
    yearly: {
      type: String,
      trim: true
    }
  },
  trialDays: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    color: {
      type: String,
      default: 'blue'
    },
    gradient: {
      type: String,
      default: 'from-blue-500 to-blue-600'
    },
    icon: {
      type: String,
      default: 'star'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
planSchema.index({ isActive: 1, sortOrder: 1 });
planSchema.index({ name: 1 });

// Virtual for formatted monthly price
planSchema.virtual('formattedMonthlyPrice').get(function() {
  return this.price.monthly === 0 ? 'Free' : `₹${this.price.monthly}`;
});

// Virtual for formatted yearly price
planSchema.virtual('formattedYearlyPrice').get(function() {
  return this.price.yearly === 0 ? 'Free' : `₹${this.price.yearly}`;
});

// Virtual for yearly savings
planSchema.virtual('yearlySavings').get(function() {
  if (this.price.monthly === 0 || this.price.yearly === 0) return 0;
  const monthlyTotal = this.price.monthly * 12;
  return Math.round(((monthlyTotal - this.price.yearly) / monthlyTotal) * 100);
});

// Method to check if plan is free
planSchema.methods.isFree = function() {
  return this.price.monthly === 0 && this.price.yearly === 0;
};

// Method to get price for billing cycle
planSchema.methods.getPrice = function(billingCycle) {
  return billingCycle === 'yearly' ? this.price.yearly : this.price.monthly;
};

// Method to get Stripe price ID for billing cycle
planSchema.methods.getStripePriceId = function(billingCycle) {
  return billingCycle === 'yearly' ? this.stripePriceIds.yearly : this.stripePriceIds.monthly;
};

// Static method to get active plans
planSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get plan by name
planSchema.statics.getPlanByName = function(name) {
  return this.findOne({ name, isActive: true });
};

// Static method to get free plan
planSchema.statics.getFreePlan = function() {
  return this.findOne({ 'price.monthly': 0, 'price.yearly': 0, isActive: true });
};

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
