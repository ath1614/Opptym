const mongoose = require('mongoose');

const reportTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['users', 'projects', 'submissions', 'directories', 'analytics', 'custom'],
    default: 'custom'
  },
  fields: [{
    type: String,
    required: true
  }],
  filters: [{
    field: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'contains', 'greater_than', 'less_than', 'between', 'in']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }],
  chartType: {
    type: String,
    required: true,
    enum: ['bar', 'pie', 'line', 'table'],
    default: 'table'
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
reportTemplateSchema.index({ category: 1, isActive: 1 });
reportTemplateSchema.index({ createdBy: 1 });
reportTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);
