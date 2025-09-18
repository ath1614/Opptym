const axios = require('axios');
const cheerio = require('cheerio');

const runCanonicalAudit = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const canonicalHref = $('link[rel="canonical"]').attr('href');
    const issues = [];
    const recommendations = [];
    const pages = [];

    // Check for canonical tag
    if (!canonicalHref) {
      issues.push('Missing canonical tag');
      recommendations.push('Add a canonical tag to prevent duplicate content issues');
    } else {
      // Validate canonical URL format
      try {
        const canonicalUrl = new URL(canonicalHref);
        const currentUrl = new URL(url);
        
        // Check if canonical is self-referencing
        if (canonicalUrl.href === currentUrl.href) {
          recommendations.push('Canonical tag is self-referencing (best practice)');
        } else {
          issues.push(`Canonical tag points to different URL: ${canonicalHref}`);
          recommendations.push('Consider using self-referencing canonical tags unless consolidating duplicate content');
        }
        
        // Check protocol consistency
        if (canonicalUrl.protocol !== currentUrl.protocol) {
          issues.push(`Protocol mismatch: canonical uses ${canonicalUrl.protocol} while page uses ${currentUrl.protocol}`);
        }
        
        // Check domain consistency
        if (canonicalUrl.hostname !== currentUrl.hostname) {
          issues.push(`Domain mismatch: canonical points to ${canonicalUrl.hostname} while page is on ${currentUrl.hostname}`);
        }
        
      } catch (urlError) {
        issues.push(`Invalid canonical URL format: ${canonicalHref}`);
        recommendations.push('Ensure canonical URL is properly formatted');
      }
    }

    // Check for multiple canonical tags
    const canonicalTags = $('link[rel="canonical"]');
    if (canonicalTags.length > 1) {
      issues.push(`Multiple canonical tags found (${canonicalTags.length})`);
      recommendations.push('Remove duplicate canonical tags - only one should be present');
    }

    // Check for hreflang tags (related to canonical)
    const hreflangTags = $('link[rel="alternate"][hreflang]');
    if (hreflangTags.length > 0) {
      recommendations.push(`${hreflangTags.length} hreflang tags found - ensure they work with your canonical strategy`);
    }

    // Analyze page structure for potential duplicate content
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const headings = $('h1, h2, h3').length;
    
    pages.push({
      url: url,
      title: title || 'No title found',
      metaDescription: metaDescription || 'No meta description',
      headingCount: headings,
      canonicalUrl: canonicalHref || 'Not found',
      hasCanonical: !!canonicalHref,
      issues: issues.length,
      status: issues.length === 0 ? 'Good' : issues.length <= 2 ? 'Warning' : 'Critical'
    });

    // Generate comprehensive suggestions
    const suggestions = [
      ...recommendations,
      'Use absolute URLs in canonical tags',
      'Ensure canonical tags are in the <head> section',
      'Test canonical implementation with Google Search Console',
      'Monitor for duplicate content issues in search results'
    ];

    return {
      success: true,
      canonicalUrl: canonicalHref || 'Not found',
      hasCanonical: !!canonicalHref,
      isValid: issues.length === 0,
      isSelfReferencing: canonicalHref === url,
      issues,
      pages,
      audit: {
        totalPages: pages.length,
        pagesWithCanonical: pages.filter(p => p.hasCanonical).length,
        pagesWithoutCanonical: pages.filter(p => !p.hasCanonical).length,
        criticalIssues: issues.length,
        averageIssuesPerPage: issues.length / pages.length || 0
      },
      suggestions: suggestions.filter((s, index) => suggestions.indexOf(s) === index), // Remove duplicates
      message: issues.length === 0 ? 'Canonical implementation is optimal' : 'Canonical issues found that need attention'
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      message: 'Failed to analyze canonical tags'
    };
  }
};

module.exports = { runCanonicalAudit };
