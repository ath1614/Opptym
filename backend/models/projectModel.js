const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  submissionType: {
    type: String,
    enum: [
      'directory', 'article', 'bookmark', 'classified', 'forum',
      'social', 'local', 'citation', 'web2', 'qa'
    ],
    required: true
  },
  submittedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 🧠 Basic Info
  title: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String },
  email: { type: String },
  name: { type: String },
  companyName: { type: String },
  businessPhone: { type: String },
  whatsapp: { type: String },
  description: { type: String },
  keywords: [String],
  targetKeywords: [String],

  // 📍 Address Info
  buildingName: { type: String },
  address1: { type: String },
  address2: { type: String },
  address3: { type: String },
  district: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },

  // 📝 Article / Press Release
  articleTitle: { type: String },
  articleContent: { type: String },
  authorName: { type: String },
  authorBio: { type: String },
  tags: [String],

  // 🛒 Classified Submission
  productName: { type: String },
  price: { type: String },
  condition: { type: String },
  productImageUrl: { type: String },

  // 🌐 Social / Online Presence
  facebook: { type: String },
  twitter: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  youtube: { type: String },

  // ⚙️ Optional SEO Enrichment
  businessHours: { type: String },
  establishedYear: { type: String },
  logoUrl: { type: String },
  sitemapUrl: { type: String },
  robotsTxtUrl: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },

  // 📊 SEO Tool Reports
  metaTagReport: { type: Object },
  keywordDensityReport: { type: Object },
  backlinkReport: { type: Object },
  brokenLinksReport: { type: Object },
  sitemapReport: { type: Object },
  robotsReport: { type: Object },
  keywordTrackerReport: { type: Object },
  pageSpeedReport: { type: Object },
  schemaReport: { type: Object },
  altTextReport: { type: Object },
  canonicalReport: { type: Object },
  mobileAuditReport: { type: Object },
  competitorReport: { type: Object },
  technicalAuditReport: { type: Object },

  seoScore: {
    total: { type: Number },
    breakdown: {
      meta: Number,
      keywords: Number,
      backlinks: Number,
      brokenLinks: Number,
      sitemap: Number,
      robots: Number,
      speed: Number,
      mobile: Number,
      altText: Number,
      canonical: Number,
      schema: Number,
      competitors: Number,
      technical: Number
    },
    suggestions: [String]
  },

  submissions: [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
