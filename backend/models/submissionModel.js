const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: function() {
      return this.submissionType !== 'bookmarklet';
    }
  },
  submissionType: {
    type: String,
    enum: [
      'directory', 'article', 'bookmark', 'classified',
      'forum', 'social', 'local', 'citation', 'web2', 'qa', 'bookmarklet'
    ],
    required: true,
  },
  siteName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  statusUpdatedAt: { type: Date },
  statusNotes: { type: String },
  metadata: {
    url: String,
    fieldsFilled: Number,
    filledFields: [Object],
    timestamp: String,
    source: String,
    token: String,
    userPlan: String,
    usageCount: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
