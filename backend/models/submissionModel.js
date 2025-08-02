const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  submissionType: {
    type: String,
    enum: [
      'directory', 'article', 'bookmark', 'classified',
      'forum', 'social', 'local', 'citation', 'web2', 'qa'
    ],
    required: true,
  },
  siteName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
