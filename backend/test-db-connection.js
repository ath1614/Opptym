import mongoose from 'mongoose';

// Connect to MongoDB
const mongoUri = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/opptym?retryWrites=true&w=majority&appName=opptym';

console.log('🔍 Connecting to MongoDB...');
await mongoose.connect(mongoUri);
console.log('✅ Connected to MongoDB');
console.log('🔍 Database name:', mongoose.connection.db.databaseName);

// Import Directory model
const Directory = mongoose.model('Directory', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  country: { type: String, default: 'Global' },
  classification: { type: String, default: 'Directory Submission' },
  isCustom: { type: Boolean, default: false },
  priority: { type: Number, default: 0, min: 0, max: 100 },
  pageRank: { type: Number, default: 0, min: 0, max: 10 },
  daScore: { type: Number, default: 0, min: 0, max: 100 },
  spamScore: { type: Number, default: 0, min: 0, max: 17 },
  submissionUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Count total directories
const totalCount = await Directory.countDocuments();
console.log('📊 Total directories in database:', totalCount);

// Count by classification
const classifications = await Directory.aggregate([
  { $group: { _id: '$classification', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

console.log('📂 Classifications:');
classifications.forEach(cat => {
  console.log(`   ${cat._id}: ${cat.count} directories`);
});

// Sample entries
const sampleEntries = await Directory.find().limit(5);
console.log('📋 Sample entries:');
sampleEntries.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.name} - ${entry.classification}`);
});

await mongoose.disconnect();
console.log('🔌 Disconnected from MongoDB');
