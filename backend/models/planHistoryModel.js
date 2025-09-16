const mongoose = require('mongoose');

const planHistorySchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PricingPlan',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'activated', 'deactivated', 'feature_added', 'feature_removed', 'price_changed', 'rollback']
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String
  },
  version: {
    type: Number,
    required: true
  },
  isRollbackable: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
planHistorySchema.index({ planId: 1, version: 1 });
planHistorySchema.index({ planId: 1, timestamp: -1 });
planHistorySchema.index({ changedBy: 1 });
planHistorySchema.index({ action: 1 });
planHistorySchema.index({ timestamp: -1 });

module.exports = mongoose.model('PlanHistory', planHistorySchema);
