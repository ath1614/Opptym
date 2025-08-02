import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Globe,
  Star,
  ChevronDown,
  Download,
  Eye,
  Edit3,
  X,
  Plus,
  FileText,
  Megaphone,
  Bookmark,
  MessageSquare,
  Link2,
  PenTool,
  Users,
  Calendar,
  ExternalLink,
  Settings,
  History,
  Target,
  Zap
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  domain: string;
  category: string;
  pageRank: number;
  status: 'active' | 'inactive';
  submissionFee: 'free' | 'paid';
  description: string;
  requirements?: string[];
  estimatedTime?: string;
}

interface SubmissionType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  platforms: Platform[];
}

interface Submission {
  id: string;
  type: string;
  platform: string;
  project: string;
  status: 'pending' | 'completed' | 'failed';
  submittedAt: string;
  completedAt?: string;
  notes?: string;
}

const submissionTypes: SubmissionType[] = [
  {
    id: 'directory',
    name: 'Directory Submission',
    description: 'Submit your website to high-quality web directories for better visibility',
    icon: Globe,
    color: 'blue',
    platforms: [
      {
        id: 'dir1',
        name: 'Google My Business',
        domain: 'business.google.com',
        category: 'Business',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Primary business listing on Google',
        requirements: ['Business verification', 'Valid address'],
        estimatedTime: '2-3 days'
      },
      {
        id: 'dir2',
        name: 'Bing Places',
        domain: 'www.bingplaces.com',
        category: 'Business',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Microsoft Bing business directory',
        requirements: ['Business details', 'Contact info'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'dir3',
        name: 'Yahoo Local',
        domain: 'local.yahoo.com',
        category: 'Local',
        pageRank: 7,
        status: 'active',
        submissionFee: 'free',
        description: 'Yahoo local business directory',
        requirements: ['Business category', 'Description'],
        estimatedTime: '3-5 days'
      },
      {
        id: 'dir4',
        name: 'Foursquare',
        domain: 'foursquare.com',
        category: 'Local',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Location-based social networking',
        requirements: ['Location verification'],
        estimatedTime: '1-2 days'
      }
    ]
  },
  {
    id: 'classified',
    name: 'Classified Submission',
    description: 'Post your business in classified ad websites to reach targeted audiences',
    icon: FileText,
    color: 'green',
    platforms: [
      {
        id: 'cls1',
        name: 'Craigslist',
        domain: 'craigslist.org',
        category: 'General',
        pageRank: 9,
        status: 'active',
        submissionFee: 'paid',
        description: 'Popular classified advertisements website',
        requirements: ['Phone verification', 'Local posting'],
        estimatedTime: '1 day'
      },
      {
        id: 'cls2',
        name: 'Gumtree',
        domain: 'gumtree.com',
        category: 'General',
        pageRank: 7,
        status: 'active',
        submissionFee: 'free',
        description: 'UK-based classified ads platform',
        requirements: ['Account registration'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'cls3',
        name: 'OLX',
        domain: 'olx.com',
        category: 'General',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Global online marketplace',
        requirements: ['Mobile verification'],
        estimatedTime: '1 day'
      }
    ]
  },
  {
    id: 'press',
    name: 'Press Releases',
    description: 'Distribute press releases to news outlets and media platforms',
    icon: Megaphone,
    color: 'purple',
    platforms: [
      {
        id: 'pr1',
        name: 'PR Newswire',
        domain: 'prnewswire.com',
        category: 'News',
        pageRank: 9,
        status: 'active',
        submissionFee: 'paid',
        description: 'Leading press release distribution service',
        requirements: ['Professional content', 'Media contact'],
        estimatedTime: '1-3 days'
      },
      {
        id: 'pr2',
        name: 'Business Wire',
        domain: 'businesswire.com',
        category: 'Business',
        pageRank: 9,
        status: 'active',
        submissionFee: 'paid',
        description: 'Global news distribution platform',
        requirements: ['Company verification'],
        estimatedTime: '2-4 days'
      },
      {
        id: 'pr3',
        name: 'PRLog',
        domain: 'prlog.org',
        category: 'General',
        pageRank: 6,
        status: 'active',
        submissionFee: 'free',
        description: 'Free press release distribution',
        requirements: ['Account registration'],
        estimatedTime: '1 day'
      }
    ]
  },
  {
    id: 'article',
    name: 'Article Submission',
    description: 'Submit articles to article directories and content platforms',
    icon: PenTool,
    color: 'orange',
    platforms: [
      {
        id: 'art1',
        name: 'Medium',
        domain: 'medium.com',
        category: 'Content',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Popular publishing platform',
        requirements: ['Quality content', 'Author profile'],
        estimatedTime: '1 day'
      },
      {
        id: 'art2',
        name: 'LinkedIn Articles',
        domain: 'linkedin.com',
        category: 'Professional',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Professional networking platform',
        requirements: ['LinkedIn profile'],
        estimatedTime: '1 day'
      },
      {
        id: 'art3',
        name: 'EzineArticles',
        domain: 'ezinearticles.com',
        category: 'General',
        pageRank: 7,
        status: 'active',
        submissionFee: 'free',
        description: 'Article directory platform',
        requirements: ['Original content', 'Author bio'],
        estimatedTime: '3-7 days'
      }
    ]
  },
  {
    id: 'social',
    name: 'Social Bookmarking',
    description: 'Bookmark your content on social bookmarking sites',
    icon: Bookmark,
    color: 'pink',
    platforms: [
      {
        id: 'soc1',
        name: 'Reddit',
        domain: 'reddit.com',
        category: 'Social',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Popular social news aggregation',
        requirements: ['Active account', 'Community rules'],
        estimatedTime: '1 day'
      },
      {
        id: 'soc2',
        name: 'StumbleUpon',
        domain: 'stumbleupon.com',
        category: 'Discovery',
        pageRank: 8,
        status: 'inactive',
        submissionFee: 'free',
        description: 'Web discovery platform',
        requirements: ['Account registration'],
        estimatedTime: '1 day'
      },
      {
        id: 'soc3',
        name: 'Digg',
        domain: 'digg.com',
        category: 'News',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Social news website',
        requirements: ['Quality content'],
        estimatedTime: '1 day'
      }
    ]
  },
  {
    id: 'forum',
    name: 'Forum Posting',
    description: 'Participate in relevant forums and communities',
    icon: MessageSquare,
    color: 'indigo',
    platforms: [
      {
        id: 'for1',
        name: 'Stack Overflow',
        domain: 'stackoverflow.com',
        category: 'Technology',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Programming Q&A community',
        requirements: ['Technical expertise', 'Quality answers'],
        estimatedTime: '1 day'
      },
      {
        id: 'for2',
        name: 'Quora',
        domain: 'quora.com',
        category: 'General',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Question and answer platform',
        requirements: ['Helpful answers', 'Profile setup'],
        estimatedTime: '1 day'
      },
      {
        id: 'for3',
        name: 'Reddit Communities',
        domain: 'reddit.com',
        category: 'Various',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Niche community discussions',
        requirements: ['Community participation'],
        estimatedTime: '1-2 days'
      }
    ]
  },
  {
    id: 'web2',
    name: 'Web 2.0 Links',
    description: 'Create content on Web 2.0 platforms for backlinks',
    icon: Link2,
    color: 'teal',
    platforms: [
      {
        id: 'web1',
        name: 'WordPress.com',
        domain: 'wordpress.com',
        category: 'Blogging',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Popular blogging platform',
        requirements: ['Quality content', 'Regular posting'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'web2',
        name: 'Blogger',
        domain: 'blogger.com',
        category: 'Blogging',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Google\'s blogging platform',
        requirements: ['Google account'],
        estimatedTime: '1 day'
      },
      {
        id: 'web3',
        name: 'Tumblr',
        domain: 'tumblr.com',
        category: 'Microblogging',
        pageRank: 8,
        status: 'active',
        submissionFee: 'free',
        description: 'Microblogging platform',
        requirements: ['Creative content'],
        estimatedTime: '1 day'
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog Comments',
    description: 'Engage with relevant blogs through meaningful comments',
    icon: Users,
    color: 'yellow',
    platforms: [
      {
        id: 'blog1',
        name: 'TechCrunch',
        domain: 'techcrunch.com',
        category: 'Technology',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Leading technology blog',
        requirements: ['Relevant comments', 'No spam'],
        estimatedTime: '1 day'
      },
      {
        id: 'blog2',
        name: 'Mashable',
        domain: 'mashable.com',
        category: 'Digital Culture',
        pageRank: 9,
        status: 'active',
        submissionFee: 'free',
        description: 'Digital culture and tech blog',
        requirements: ['Thoughtful engagement'],
        estimatedTime: '1 day'
      },
      {
        id: 'blog3',
        name: 'Industry Blogs',
        domain: 'various',
        category: 'Industry Specific',
        pageRank: 7,
        status: 'active',
        submissionFee: 'free',
        description: 'Niche industry blogs',
        requirements: ['Industry knowledge'],
        estimatedTime: '1-2 days'
      }
    ]
  }
];

const recentSubmissions: Submission[] = [
  {
    id: '1',
    type: 'Directory Submission',
    platform: 'Google My Business',
    project: 'E-commerce Store',
    status: 'completed',
    submittedAt: '2024-01-20T10:30:00Z',
    completedAt: '2024-01-21T14:30:00Z',
    notes: 'Successfully verified and approved'
  },
  {
    id: '2',
    type: 'Article Submission',
    platform: 'Medium',
    project: 'Tech Blog',
    status: 'pending',
    submittedAt: '2024-01-20T09:15:00Z',
    notes: 'Under editorial review'
  },
  {
    id: '3',
    type: 'Social Bookmarking',
    platform: 'Reddit',
    project: 'Local Restaurant',
    status: 'failed',
    submittedAt: '2024-01-19T16:45:00Z',
    notes: 'Removed due to community guidelines'
  }
];

export default function DirectorySubmission() {
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const currentType = submissionTypes.find(type => type.id === activeTab);
  const currentPlatforms = currentType?.platforms || [];

  const filteredPlatforms = currentPlatforms.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         platform.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           platform.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(currentPlatforms.map(p => p.category.toLowerCase()))];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlatforms.length === filteredPlatforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(filteredPlatforms.map(p => p.id));
    }
  };

  const handlePreviewSubmission = () => {
    const selectedPlatformData = currentPlatforms.filter(p => selectedPlatforms.includes(p.id));
    setPreviewData({
      platforms: selectedPlatformData,
      project: 'E-commerce Store', // This would come from selected project
      url: 'https://example-store.com',
      keywords: ['ecommerce', 'online shopping', 'retail'],
      description: 'Leading online store for quality products with fast shipping and excellent customer service.',
      submissionType: currentType?.name
    });
    setShowPreviewModal(true);
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSubmitting(false);
    setSelectedPlatforms([]);
    setShowPreviewModal(false);
    
    // Show success message
    alert(`Successfully submitted to ${selectedPlatforms.length} platforms!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
      yellow: 'from-yellow-500 to-yellow-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Type Submission System</h2>
          <p className="text-gray-600">Submit your projects across multiple platforms and channels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          {selectedPlatforms.length > 0 && (
            <button
              onClick={handlePreviewSubmission}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview & Submit ({selectedPlatforms.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project</h3>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">E-commerce Store</option>
          <option value="2">Tech Blog</option>
          <option value="3">Local Restaurant</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Submission Type Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Types</h3>
            <div className="space-y-2">
              {submissionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setActiveTab(type.id);
                      setSelectedPlatforms([]);
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                      activeTab === type.id
                        ? `bg-gradient-to-r ${getTypeColor(type.color)} text-white shadow-md`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className={`text-xs ${activeTab === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {type.platforms.length} platforms
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Type Header */}
          {currentType && (
            <div className={`bg-gradient-to-r ${getTypeColor(currentType.color)} rounded-xl p-6 text-white`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <currentType.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentType.name}</h3>
                  <p className="text-white/90">{currentType.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search platforms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {selectedPlatforms.length === filteredPlatforms.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Platform List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Available Platforms</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPlatforms.length} platforms found • {selectedPlatforms.length} selected
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredPlatforms.map((platform) => (
                <div key={platform.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(currentType?.color || 'blue')} rounded-lg flex items-center justify-center`}>
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{platform.name}</h4>
                          <p className="text-sm text-gray-500">{platform.domain}</p>
                          <p className="text-xs text-gray-400 mt-1">{platform.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{platform.pageRank}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          platform.submissionFee === 'free' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {platform.submissionFee}
                        </span>
                      </div>
                      {platform.estimatedTime && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{platform.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {platform.requirements && (
                    <div className="mt-3 ml-8">
                      <div className="flex flex-wrap gap-1">
                        {platform.requirements.map((req, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistoryPanel && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Submission History</h3>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(submission.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{submission.platform}</h4>
                      <p className="text-sm text-gray-600">{submission.type} • {submission.project}</p>
                      <p className="text-xs text-gray-500">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                    {submission.notes && (
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">{submission.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Preview Submission</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Project Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={previewData.project}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={previewData.url}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={previewData.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2">
                      {previewData.keywords.map((keyword: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {keyword}
                          <button className="ml-2 text-blue-600 hover:text-blue-800">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600 hover:bg-gray-50">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Keyword
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Platforms */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Selected Platforms ({previewData.platforms.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewData.platforms.map((platform: Platform) => (
                    <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{platform.name}</h5>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          platform.submissionFee === 'free' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {platform.submissionFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>PR: {platform.pageRank}</span>
                        {platform.estimatedTime && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{platform.estimatedTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAll}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Submit to All Platforms</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}