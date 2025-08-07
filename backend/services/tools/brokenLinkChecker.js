const axios = require('axios');
const cheerio = require('cheerio');

// Link classification patterns
const LINK_CLASSIFICATIONS = {
  malware: {
    patterns: [
      /malware/i,
      /virus/i,
      /trojan/i,
      /spyware/i,
      /phishing/i,
      /scam/i,
      /fake/i,
      /suspicious/i,
      /dangerous/i,
      /infected/i
    ],
    description: 'Potentially malicious or suspicious links',
    severity: 'high',
    action: 'Remove immediately and scan for malware'
  },
  socialMedia: {
    patterns: [
      /facebook\.com/i,
      /twitter\.com/i,
      /instagram\.com/i,
      /linkedin\.com/i,
      /youtube\.com/i,
      /tiktok\.com/i,
      /pinterest\.com/i,
      /reddit\.com/i,
      /snapchat\.com/i,
      /whatsapp\.com/i
    ],
    description: 'Social media platform links',
    severity: 'medium',
    action: 'Update to current social media URLs'
  },
  externalResources: {
    patterns: [
      /\.pdf$/i,
      /\.doc$/i,
      /\.docx$/i,
      /\.xls$/i,
      /\.xlsx$/i,
      /\.zip$/i,
      /\.rar$/i,
      /\.mp4$/i,
      /\.mp3$/i,
      /\.jpg$/i,
      /\.png$/i,
      /\.gif$/i
    ],
    description: 'External file and media resources',
    severity: 'medium',
    action: 'Check if files still exist or update links'
  },
  affiliateMarketing: {
    patterns: [
      /affiliate/i,
      /commission/i,
      /partner/i,
      /referral/i,
      /tracking/i,
      /clickbank/i,
      /amazon\.com/i,
      /ebay\.com/i
    ],
    description: 'Affiliate marketing and referral links',
    severity: 'medium',
    action: 'Update affiliate links or remove if no longer relevant'
  },
  newsAndMedia: {
    patterns: [
      /news/i,
      /media/i,
      /press/i,
      /article/i,
      /blog/i,
      /journal/i,
      /magazine/i,
      /newspaper/i
    ],
    description: 'News, media, and content links',
    severity: 'low',
    action: 'Find alternative sources or archive links'
  },
  ecommerce: {
    patterns: [
      /shop/i,
      /store/i,
      /buy/i,
      /cart/i,
      /checkout/i,
      /product/i,
      /amazon/i,
      /ebay/i,
      /etsy/i,
      /shopify/i
    ],
    description: 'E-commerce and shopping links',
    severity: 'medium',
    action: 'Update product links or remove discontinued items'
  },
  government: {
    patterns: [
      /\.gov/i,
      /government/i,
      /official/i,
      /authority/i,
      /department/i,
      /ministry/i
    ],
    description: 'Government and official authority links',
    severity: 'high',
    action: 'Find updated government URLs or official alternatives'
  },
  educational: {
    patterns: [
      /\.edu/i,
      /university/i,
      /college/i,
      /school/i,
      /academy/i,
      /institute/i,
      /education/i,
      /research/i,
      /study/i
    ],
    description: 'Educational and research institution links',
    severity: 'medium',
    action: 'Update educational links or find alternative sources'
  },
  technology: {
    patterns: [
      /tech/i,
      /software/i,
      /app/i,
      /api/i,
      /github\.com/i,
      /stackoverflow\.com/i,
      /developer/i,
      /programming/i,
      /code/i
    ],
    description: 'Technology and development links',
    severity: 'medium',
    action: 'Update tech links or find current alternatives'
  },
  financial: {
    patterns: [
      /bank/i,
      /finance/i,
      /payment/i,
      /credit/i,
      /loan/i,
      /insurance/i,
      /investment/i,
      /money/i,
      /paypal/i,
      /stripe/i
    ],
    description: 'Financial and payment service links',
    severity: 'high',
    action: 'Update financial links or remove if services changed'
  },
  healthcare: {
    patterns: [
      /health/i,
      /medical/i,
      /doctor/i,
      /hospital/i,
      /clinic/i,
      /pharmacy/i,
      /medicine/i,
      /treatment/i,
      /care/i
    ],
    description: 'Healthcare and medical links',
    severity: 'high',
    action: 'Update healthcare links or find current medical resources'
  }
};

// Function to classify a link
const classifyLink = (url) => {
  const urlLower = url.toLowerCase();
  
  for (const [category, config] of Object.entries(LINK_CLASSIFICATIONS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(urlLower)) {
        return {
          category,
          description: config.description,
          severity: config.severity,
          action: config.action
        };
      }
    }
  }
  
  // Default classification for unclassified links
  return {
    category: 'general',
    description: 'General website links',
    severity: 'low',
    action: 'Check if website is still active or update URL'
  };
};

// Function to analyze link health
const analyzeLinkHealth = (url, status, error) => {
  const classification = classifyLink(url);
  
  let healthScore = 100;
  let priority = 'low';
  let recommendations = [];
  
  // Adjust health score based on classification severity
  switch (classification.severity) {
    case 'high':
      healthScore -= 40;
      priority = 'high';
      break;
    case 'medium':
      healthScore -= 20;
      priority = 'medium';
      break;
    case 'low':
      healthScore -= 10;
      priority = 'low';
      break;
  }
  
  // Add specific recommendations based on category
  switch (classification.category) {
    case 'malware':
      recommendations.push('Immediately remove this link');
      recommendations.push('Scan your website for malware');
      recommendations.push('Check if your site has been compromised');
      break;
    case 'socialMedia':
      recommendations.push('Update to current social media URLs');
      recommendations.push('Check if social media accounts are still active');
      recommendations.push('Consider removing outdated social links');
      break;
    case 'externalResources':
      recommendations.push('Check if files still exist on external servers');
      recommendations.push('Consider hosting files locally');
      recommendations.push('Update file links or remove if no longer needed');
      break;
    case 'affiliateMarketing':
      recommendations.push('Update affiliate links to current programs');
      recommendations.push('Check if affiliate programs are still active');
      recommendations.push('Remove outdated affiliate links');
      break;
    case 'government':
      recommendations.push('Find updated government URLs');
      recommendations.push('Check official government websites');
      recommendations.push('Consider archiving important government links');
      break;
    case 'financial':
      recommendations.push('Update payment service links');
      recommendations.push('Check if financial services are still available');
      recommendations.push('Remove outdated payment links');
      break;
    default:
      recommendations.push(classification.action);
      recommendations.push('Check if the website is still active');
      recommendations.push('Find alternative sources if needed');
  }
  
  return {
    classification,
    healthScore,
    priority,
    recommendations
  };
};

const checkBrokenLinks = async (url) => {
  try {
    console.log(`🔍 Checking broken links for: ${url}`);
    
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)'
      }
    });
    
    const $ = cheerio.load(data);
    const links = [];
    
    // Extract all external links
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (href && href.startsWith('http') && !href.includes(url.replace(/^https?:\/\//, ''))) {
        links.push({
          url: href,
          text: text || 'No text',
          element: $(el).prop('outerHTML')
        });
      }
    });
    
    console.log(`📊 Found ${links.length} external links to check`);
    
    // Check each link with timeout and retry logic
    const results = await Promise.allSettled(
      links.map(async (link) => {
        try {
          const response = await axios.head(link.url, { 
            timeout: 8000,
            maxRedirects: 5,
            validateStatus: (status) => status < 400
          });
          
          return {
            url: link.url,
            text: link.text,
            status: 'ok',
            statusCode: response.status,
            error: null
          };
        } catch (error) {
          return {
            url: link.url,
            text: link.text,
            status: 'broken',
            statusCode: error.response?.status || null,
            error: error.code || error.message
          };
        }
      })
    );
    
    // Process results and classify broken links
    const brokenLinks = [];
    const workingLinks = [];
    
    results.forEach((result, index) => {
      const linkData = result.value;
      
      if (linkData.status === 'broken') {
        const healthAnalysis = analyzeLinkHealth(linkData.url, linkData.status, linkData.error);
        
        brokenLinks.push({
          url: linkData.url,
          text: linkData.text,
          statusCode: linkData.statusCode,
          error: linkData.error,
          ...healthAnalysis
        });
      } else {
        workingLinks.push(linkData);
      }
    });
    
    // Calculate overall statistics
    const totalLinks = links.length;
    const brokenCount = brokenLinks.length;
    const workingCount = workingLinks.length;
    
    // Categorize broken links
    const categories = {};
    const severityCounts = { high: 0, medium: 0, low: 0 };
    
    brokenLinks.forEach(link => {
      const category = link.classification.category;
      const severity = link.classification.severity;
      
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(link);
      
      severityCounts[severity]++;
    });
    
    // Generate overall recommendations
    const recommendations = [];
    
    if (severityCounts.high > 0) {
      recommendations.push(`🚨 ${severityCounts.high} high-priority broken links need immediate attention`);
    }
    
    if (severityCounts.medium > 0) {
      recommendations.push(`⚠️ ${severityCounts.medium} medium-priority links should be updated soon`);
    }
    
    if (severityCounts.low > 0) {
      recommendations.push(`ℹ️ ${severityCounts.low} low-priority links can be addressed later`);
    }
    
    if (categories.malware && categories.malware.length > 0) {
      recommendations.push('🛡️ Malware links detected - immediate security review required');
    }
    
    if (categories.financial && categories.financial.length > 0) {
      recommendations.push('💰 Financial links need updating to prevent user confusion');
    }
    
    if (categories.government && categories.government.length > 0) {
      recommendations.push('🏛️ Government links should be updated for accuracy');
    }
    
    // Calculate overall health score
    const overallHealthScore = totalLinks > 0 
      ? Math.round(((workingCount / totalLinks) * 100) - (severityCounts.high * 10) - (severityCounts.medium * 5))
      : 100;
    
    const result = {
      success: true,
      totalLinks,
      workingCount,
      brokenCount,
      brokenLinks,
      categories,
      severityCounts,
      overallHealthScore: Math.max(0, overallHealthScore),
      recommendations,
      summary: {
        totalChecked: totalLinks,
        working: workingCount,
        broken: brokenCount,
        healthScore: Math.max(0, overallHealthScore),
        highPriority: severityCounts.high,
        mediumPriority: severityCounts.medium,
        lowPriority: severityCounts.low
      }
    };
    
    console.log(`✅ Broken link analysis complete: ${brokenCount}/${totalLinks} broken links found`);
    console.log(`📊 Health Score: ${result.overallHealthScore}/100`);
    
    return result;
    
  } catch (err) {
    console.error('❌ Broken link checker error:', err.message);
    return { 
      success: false, 
      error: err.message,
      recommendations: ['Unable to analyze links due to technical error']
    };
  }
};

module.exports = { checkBrokenLinks };
