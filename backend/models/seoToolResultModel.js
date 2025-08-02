const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  toolName: String,
  result: mongoose.Schema.Types.Mixed,
  scannedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SeoToolResult', resultSchema);
