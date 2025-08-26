import React, { useEffect, useState } from 'react';
import { getProjects, runBrokenLinkChecker } from '../../lib/api';
import ResultsDisplay from './ResultsDisplay';
import { 
  Link, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  ExternalLink, 
  RefreshCw, 
  XCircle,
  Shield,
  DollarSign,
  Building,
  GraduationCap,
  Code,
  Heart,
  ShoppingCart,
  FileText,
  Users,
  Globe,
  Zap,
  AlertCircle
} from 'lucide-react';

type Project = {
  _id: string;
  title: string;
};

const BrokenLinkTool = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [totalLinks, setTotalLinks] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleRunAnalyzer = async () => {
    if (!selectedProjectId) {
      alert('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    setScanComplete(false);
    setBrokenLinks([]);
    setTotalLinks(0);

    try {
      const res = await runBrokenLinkChecker(selectedProjectId);
      setReport(res);
      setTotalLinks(res.totalLinks || 0);
      setBrokenLinks(res.brokenLinks || []);
      setScanComplete(true);
    } catch (err) {
      setError('Analyzer failed to run. Please try again.');
      console.error('Analyzer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (!report) return [];
    
    // Extract enhanced data from backend response
    const totalLinks = report.totalLinks || 0;
    const brokenCount = report.brokenCount || 0;
    const workingCount = report.workingCount || (totalLinks - brokenCount);
    const healthScore = report.overallHealthScore || (totalLinks > 0 ? Math.round(((workingCount / totalLinks) * 100)) : 100);
    
    return [
      {
        label: 'Total Links',
        value: totalLinks,
        status: 'good' as const,
        icon: <Link className="w-4 h-4" />
      },
      {
        label: 'Broken Links',
        value: brokenCount,
        status: (brokenCount === 0 ? 'good' : 'error') as 'good' | 'error',
        icon: <XCircle className="w-4 h-4" />
      },
      {
        label: 'Health Score',
        value: `${healthScore}/100`,
        status: (healthScore >= 90 ? 'good' : healthScore >= 70 ? 'warning' : 'error') as 'good' | 'warning' | 'error',
        icon: <Shield className="w-4 h-4" />
      }
    ];
  };

  const getDetails = () => {
    if (!report) return [];
    
    // Extract enhanced data from backend response
    const totalLinks = report.totalLinks || 0;
    const brokenCount = report.brokenCount || 0;
    const workingCount = report.workingCount || (totalLinks - brokenCount);
    const healthScore = report.overallHealthScore || (totalLinks > 0 ? Math.round(((workingCount / totalLinks) * 100)) : 100);
    const severityCounts = report.severityCounts || { high: 0, medium: 0, low: 0 };
    const categories = report.categories || {};
    
    const details = [
      {
        label: 'Total External Links',
        value: totalLinks,
        status: 'good' as const
      },
      {
        label: 'Working Links',
        value: workingCount,
        status: 'good' as const
      },
      {
        label: 'Broken Links Found',
        value: brokenCount,
        status: (brokenCount === 0 ? 'good' : 'error') as 'good' | 'error'
      },
      {
        label: 'Overall Health Score',
        value: `${healthScore}/100`,
        status: (healthScore >= 90 ? 'good' : healthScore >= 70 ? 'warning' : 'error') as 'good' | 'warning' | 'error'
      },
      {
        label: 'High Priority Issues',
        value: severityCounts.high,
        status: (severityCounts.high === 0 ? 'good' : 'error') as 'good' | 'error'
      },
      {
        label: 'Medium Priority Issues',
        value: severityCounts.medium,
        status: (severityCounts.medium === 0 ? 'good' : 'warning') as 'good' | 'warning'
      },
      {
        label: 'Low Priority Issues',
        value: severityCounts.low,
        status: (severityCounts.low === 0 ? 'good' : 'warning') as 'good' | 'warning'
      }
    ];

    // Add category breakdown
    Object.entries(categories).forEach(([category, links]: [string, any]) => {
      details.push({
        label: `${category.charAt(0).toUpperCase() + category.slice(1)} Links`,
        value: Array.isArray(links) ? links.length : 0,
        status: 'warning' as const
      });
    });

    return details;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'malware':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'financial':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'government':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'educational':
        return <GraduationCap className="w-4 h-4 text-green-600" />;
      case 'technology':
        return <Code className="w-4 h-4 text-purple-600" />;
      case 'healthcare':
        return <Heart className="w-4 h-4 text-pink-600" />;
      case 'ecommerce':
        return <ShoppingCart className="w-4 h-4 text-orange-600" />;
      case 'socialMedia':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'externalResources':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'affiliateMarketing':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'newsAndMedia':
        return <Globe className="w-4 h-4 text-blue-600" />;
      default:
        return <Link className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'malware':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'financial':
      case 'government':
      case 'healthcare':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'ecommerce':
      case 'affiliateMarketing':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'technology':
      case 'educational':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'socialMedia':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getImprovementGuide = () => {
    if (!report) return [];

    const guides = [];
    const brokenLinksCount = report.brokenLinks?.length || 0;
    const severityCounts = report.severityCounts || { high: 0, medium: 0, low: 0 };
    const categories = report.categories || {};

    if (brokenLinksCount > 0) {
      // High priority guide
      if (severityCounts.high > 0) {
        guides.push({
          title: '🚨 High Priority Security Issues',
          description: 'Address these critical issues immediately to protect your site and users.',
          icon: <Shield className="w-4 h-4" />,
          steps: [
            'Remove any malware or suspicious links immediately',
            'Update financial and payment service links',
            'Verify government and official authority links',
            'Scan your website for security vulnerabilities',
            'Update healthcare and medical information links'
          ]
        });
      }

      // Medium priority guide
      if (severityCounts.medium > 0) {
        guides.push({
          title: '⚠️ Medium Priority Updates',
          description: 'Update these links to maintain site quality and user experience.',
          icon: <RefreshCw className="w-4 h-4" />,
          steps: [
            'Update social media platform links',
            'Check and update e-commerce product links',
            'Verify educational and research institution links',
            'Update technology and development resource links',
            'Review affiliate marketing links for relevance'
          ]
        });
      }

      // Category-specific guides
      if (categories.malware && categories.malware.length > 0) {
        guides.push({
          title: '🛡️ Malware Link Removal',
          description: 'Critical security action required for detected malware links.',
          icon: <Shield className="w-4 h-4" />,
          steps: [
            'Immediately remove all malware-related links',
            'Scan your entire website for malware',
            'Check if your site has been compromised',
            'Update all security plugins and software',
            'Monitor for suspicious activity'
          ]
        });
      }

      if (categories.financial && categories.financial.length > 0) {
        guides.push({
          title: '💰 Financial Link Updates',
          description: 'Update financial links to prevent user confusion and maintain trust.',
          icon: <DollarSign className="w-4 h-4" />,
          steps: [
            'Update payment service links (PayPal, Stripe, etc.)',
            'Verify banking and financial institution links',
            'Check if financial services are still available',
            'Remove outdated payment processing links',
            'Update affiliate program links'
          ]
        });
      }

      if (categories.government && categories.government.length > 0) {
        guides.push({
          title: '🏛️ Government Link Verification',
          description: 'Ensure government links are current and accurate.',
          icon: <Building className="w-4 h-4" />,
          steps: [
            'Find updated government URLs',
            'Check official government websites',
            'Archive important government information',
            'Update regulatory and compliance links',
            'Verify official authority sources'
          ]
        });
      }

      // General broken link guide
      guides.push({
        title: '🔧 General Broken Link Fixes',
        description: 'Standard procedures for fixing broken links.',
        icon: <Wrench className="w-4 h-4" />,
        steps: [
          'Check if linked pages have moved to new URLs',
          'Update links to point to correct destinations',
          'Remove links to permanently deleted pages',
          'Replace broken links with relevant alternatives',
          'Set up 301 redirects for moved pages'
        ]
      });
    } else {
      guides.push({
        title: '✅ Excellent Link Health',
        description: 'Great! No broken links found. Keep up the good work.',
        icon: <CheckCircle className="w-4 h-4" />,
        steps: [
          'Continue regular link audits (quarterly)',
          'Monitor external sites you link to',
          'Use link monitoring tools for proactive detection',
          'Maintain clean internal linking structure',
          'Keep content updated and relevant'
        ]
      });
    }

    // Prevention guide
    guides.push({
      title: '🛡️ Prevent Future Broken Links',
      description: 'Implement strategies to prevent broken links from occurring.',
      icon: <Zap className="w-4 h-4" />,
      steps: [
        'Set up automated link monitoring',
        'Regularly audit external links (monthly)',
        'Build relationships with sites you link to',
        'Create stable internal link structures',
        'Use descriptive anchor text for better management'
      ]
    });

    return guides;
  };

  // Enhanced suggestions based on classification
  const getEnhancedSuggestions = () => {
    if (!report) return [];

    const suggestions = [];
    const severityCounts = report.severityCounts || { high: 0, medium: 0, low: 0 };
    const categories = report.categories || {};

    if (severityCounts.high > 0) {
      suggestions.push(`🚨 ${severityCounts.high} high-priority broken links need immediate attention`);
    }

    if (severityCounts.medium > 0) {
      suggestions.push(`⚠️ ${severityCounts.medium} medium-priority links should be updated soon`);
    }

    if (severityCounts.low > 0) {
      suggestions.push(`ℹ️ ${severityCounts.low} low-priority links can be addressed later`);
    }

    if (categories.malware && categories.malware.length > 0) {
      suggestions.push('🛡️ Malware links detected - immediate security review required');
    }

    if (categories.financial && categories.financial.length > 0) {
      suggestions.push('💰 Financial links need updating to prevent user confusion');
    }

    if (categories.government && categories.government.length > 0) {
      suggestions.push('🏛️ Government links should be updated for accuracy');
    }

    if (categories.healthcare && categories.healthcare.length > 0) {
      suggestions.push('🏥 Healthcare links need verification for medical accuracy');
    }

    if (categories.ecommerce && categories.ecommerce.length > 0) {
      suggestions.push('🛒 E-commerce links should be updated to maintain sales');
    }

    return suggestions;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Enhanced Broken Link Scanner</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Advanced broken link analysis with malware detection, classification, and priority-based recommendations.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-primary-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Choose a project to analyze</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAnalyzer}
            disabled={loading || !selectedProjectId}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !selectedProjectId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-700'
                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scanning with Enhanced Analysis...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Run Enhanced Broken Link Scan</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Enhanced Results Display */}
          <ResultsDisplay
            title="Enhanced Broken Link Analysis Results"
            success={report.success}
            data={report}
            suggestions={getEnhancedSuggestions()}
            icon={<Shield className="w-6 h-6 text-red-600" />}
            metrics={getMetrics()}
            details={getDetails()}
            improvementGuide={getImprovementGuide()}
          />

          {/* Category Breakdown */}
          {report.categories && Object.keys(report.categories).length > 0 && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Broken Links by Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.categories).map(([category, links]: [string, any]) => (
                  <div key={category} className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium capitalize dark:text-gray-300">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold dark:text-gray-300">{Array.isArray(links) ? links.length : 0}</div>
                    <div className="text-sm opacity-75 dark:text-gray-400">broken links</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Severity Breakdown */}
          {report.severityCounts && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Priority Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-300">High Priority</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{report.severityCounts.high || 0}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Security & Critical Issues</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">Medium Priority</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{report.severityCounts.medium || 0}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Business & User Experience</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">Low Priority</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.severityCounts.low || 0}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">General & Content Links</div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Broken Links */}
          {report.brokenLinks && report.brokenLinks.length > 0 && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Analysis</h4>
              <div className="space-y-4">
                {report.brokenLinks.slice(0, 8).map((link: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white truncate">{link.url}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {link.text && link.text !== 'No text' ? `"${link.text}"` : 'No link text'}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        link.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        link.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {link.priority} priority
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="ml-2 font-medium capitalize dark:text-gray-300">
                          {link.classification?.category?.replace(/([A-Z])/g, ' $1').trim() || 'General'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Severity:</span>
                        <span className={`ml-2 font-medium ${
                          link.classification?.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                          link.classification?.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {link.classification?.severity || 'low'}
                        </span>
                      </div>
                    </div>
                    
                    {link.recommendations && link.recommendations.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommendations:</div>
                        <ul className="space-y-1">
                          {link.recommendations.slice(0, 2).map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                              <span className="text-gray-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {report.brokenLinks.length > 8 && (
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    ... and {report.brokenLinks.length - 8} more broken links
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          {brokenLinks.length > 0 && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Broken Links Found</h3>
              <div className="space-y-3">
                {brokenLinks.map((link, index) => (
                  <div key={index} className="border border-red-200 dark:border-red-700 rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{link.url}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Status: {link.status}</p>
                      </div>
                      <button
                        onClick={() => window.open(link.url, '_blank')}
                        className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                      >
                        Check
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          {scanComplete && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scan Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalLinks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{brokenLinks.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Broken Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalLinks - brokenLinks.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Working Links</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium dark:text-red-400">Error: {error}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrokenLinkTool;
