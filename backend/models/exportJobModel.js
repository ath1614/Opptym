const mongoose = require('mongoose');

const exportJobSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['users', 'projects', 'submissions', 'directories', 'analytics', 'all']
  },
  format: {
    type: String,
    required: true,
    enum: ['csv', 'json', 'excel', 'pdf']
  },
  fields: [{
    type: String,
    required: true
  }],
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  },
  downloadUrl: {
    type: String
  },
  error: {
    type: String
  },
  fileSize: {
    type: Number
  },
  recordCount: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for better query performance
exportJobSchema.index({ createdBy: 1, status: 1 });
exportJobSchema.index({ createdAt: -1 });
exportJobSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('ExportJob', exportJobSchema);
