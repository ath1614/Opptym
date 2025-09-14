const supportedPlatforms = {
  facebook: {
    patterns: [
      /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+$/i,
      /^https?:\/\/(www\.)?fb\.com\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'Facebook'
  },
  twitter: {
    patterns: [
      /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/i,
      /^https?:\/\/(www\.)?x\.com\/[a-zA-Z0-9_]+$/i
    ],
    name: 'Twitter/X'
  },
  instagram: {
    patterns: [
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'Instagram'
  },
  linkedin: {
    patterns: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9._-]+$/i,
      /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'LinkedIn'
  },
  youtube: {
    patterns: [
      /^https?:\/\/(www\.)?youtube\.com\/channel\/[a-zA-Z0-9_-]+$/i,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9_-]+$/i,
      /^https?:\/\/(www\.)?youtube\.com\/user\/[a-zA-Z0-9_-]+$/i,
      /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+$/i
    ],
    name: 'YouTube'
  },
  tiktok: {
    patterns: [
      /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+$/i
    ],
    name: 'TikTok'
  },
  pinterest: {
    patterns: [
      /^https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'Pinterest'
  },
  reddit: {
    patterns: [
      /^https?:\/\/(www\.)?reddit\.com\/user\/[a-zA-Z0-9._-]+$/i,
      /^https?:\/\/(www\.)?reddit\.com\/r\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'Reddit'
  },
  snapchat: {
    patterns: [
      /^https?:\/\/(www\.)?snapchat\.com\/add\/[a-zA-Z0-9._-]+$/i
    ],
    name: 'Snapchat'
  },
  whatsapp: {
    patterns: [
      /^https?:\/\/(www\.)?wa\.me\/[0-9+]+$/i,
      /^https?:\/\/(www\.)?whatsapp\.com\/send\?phone=[0-9+]+$/i
    ],
    name: 'WhatsApp'
  }
};

/**
 * Validates a social media link
 * @param {string} platform - The platform name (facebook, twitter, etc.)
 * @param {string} url - The URL to validate
 * @returns {Object} - Validation result with isValid, error, and platform info
 */
function validateSocialMediaLink(platform, url) {
  console.log(`🔍 DEBUG: Validating ${platform} link: ${url}`);
  
  // Check if platform is supported
  if (!supportedPlatforms[platform]) {
    console.log(`❌ DEBUG: Unsupported platform: ${platform}`);
    return {
      isValid: false,
      error: 'invalid social media link',
      platform: platform,
      supportedPlatforms: Object.keys(supportedPlatforms)
    };
  }
  
  // Check if URL is provided
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    console.log(`✅ DEBUG: Empty URL for platform: ${platform} - allowing empty`);
    return {
      isValid: true,
      error: null,
      platform: platform,
      platformName: supportedPlatforms[platform].name,
      url: ''
    };
  }
  
  let processedUrl = url.trim();
  const platformConfig = supportedPlatforms[platform];
  
  // Auto-add https:// if missing
  if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
    processedUrl = 'https://' + processedUrl;
    console.log(`🔧 DEBUG: Auto-added https:// to ${platform} URL: ${processedUrl}`);
  }
  
  // Check if URL matches any of the platform patterns
  const isValidUrl = platformConfig.patterns.some(pattern => pattern.test(processedUrl));
  
  if (!isValidUrl) {
    console.log(`❌ DEBUG: Invalid URL format for ${platform}: ${processedUrl}`);
    return {
      isValid: false,
      error: 'invalid social media link',
      platform: platform,
      expectedFormat: `Valid ${platformConfig.name} URL format required`
    };
  }
  
  console.log(`✅ DEBUG: Valid ${platform} link: ${processedUrl}`);
  return {
    isValid: true,
    error: null,
    platform: platform,
    platformName: platformConfig.name,
    url: processedUrl
  };
}

/**
 * Validates all social media links in a project data object
 * @param {Object} projectData - Project data containing social media links
 * @returns {Object} - Validation result with isValid, errors, and validated data
 */
function validateAllSocialMediaLinks(projectData) {
  const socialMediaFields = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'reddit', 'snapchat', 'whatsapp'];
  const errors = [];
  const validatedData = { ...projectData };
  
  console.log(`🔍 DEBUG: Validating social media links for project: ${projectData.title || 'Unknown'}`);
  
  for (const field of socialMediaFields) {
    // Only validate if the field has a non-empty value
    if (projectData[field] && typeof projectData[field] === 'string' && projectData[field].trim().length > 0) {
      const validation = validateSocialMediaLink(field, projectData[field]);
      
      if (!validation.isValid) {
        errors.push({
          field: field,
          error: validation.error,
          platform: validation.platform,
          expectedFormat: validation.expectedFormat
        });
        console.log(`❌ DEBUG: ${field} validation failed: ${validation.error}`);
      } else {
        validatedData[field] = validation.url;
        console.log(`✅ DEBUG: ${field} validation passed`);
      }
    } else {
      // Field is empty, null, undefined, or just whitespace - set to empty string
      validatedData[field] = '';
      console.log(`✅ DEBUG: ${field} is empty - skipping validation`);
    }
  }
  
  const result = {
    isValid: errors.length === 0,
    errors: errors,
    validatedData: validatedData
  };
  
  console.log(`📊 DEBUG: Social media validation result: ${result.isValid ? 'PASSED' : 'FAILED'} (${errors.length} errors)`);
  
  return result;
}

module.exports = {
  validateSocialMediaLink,
  validateAllSocialMediaLinks,
  supportedPlatforms
};
