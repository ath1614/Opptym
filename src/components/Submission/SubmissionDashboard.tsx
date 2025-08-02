import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../lib/api';
import { getProjects } from '../../lib/api';
import { 
  Download, 
  Globe, 
  FileText, 
  Share2, 
  PenTool, 
  HelpCircle, 
  MapPin, 
  Copy, 
  Check, 
  Zap,
  ExternalLink,
  Bot,
  Sparkles,
  ChevronRight,
  Play,
  Settings,
  BookOpen
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

type Project = {
  _id: string;
  title: string;
  url: string;
  name?: string;
  email?: string;
  companyName?: string;
  businessPhone?: string;
  description?: string;
};

type SiteEntry = {
  name: string;
  url: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

const siteMap: Record<string, { 
  icon: JSX.Element; 
  sites: SiteEntry[];
  color: string;
  gradient: string;
  description: string;
}> = {
  directory: {
    icon: <MapPin className="w-5 h-5" />,
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Business directories and local listings',
    sites: [
      { name: 'SuperiorBid', url: 'https://www.superiorbid.com/resources-2/submission-forms/business-directory-listing-form/', description: 'Premium business directory', difficulty: 'easy' },
      { name: 'Yelp Business', url: 'https://biz.yelp.com/signup', description: 'Popular review platform', difficulty: 'easy' },
      { name: 'JustDial', url: 'https://www.justdial.com/addbusiness', description: 'Indian business directory', difficulty: 'medium' },
      { name: 'IndiaMart', url: 'https://seller.indiamart.com/', description: 'B2B marketplace', difficulty: 'medium' },
      { name: 'Sulekha', url: 'https://business.sulekha.com/register', description: 'Local services platform', difficulty: 'easy' }
    ]
  },
  article: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Article publishing and content platforms',
    sites: [
      { name: 'Medium', url: 'https://medium.com/new-story', description: 'Popular blogging platform', difficulty: 'easy' },
      { name: 'Tealfeed', url: 'https://tealfeed.com/write', description: 'Content creation platform', difficulty: 'easy' },
      { name: 'EzineArticles', url: 'https://ezinearticles.com/', description: 'Article directory', difficulty: 'medium' },
      { name: 'HubPages', url: 'https://hubpages.com/user/new/', description: 'Content monetization', difficulty: 'hard' },
      { name: 'Vocal Media', url: 'https://vocal.media/write', description: 'Creative writing platform', difficulty: 'easy' }
    ]
  },
  social: {
    icon: <Share2 className="w-5 h-5" />,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Social media and networking platforms',
    sites: [
      { name: 'Twitter', url: 'https://twitter.com/compose/tweet', description: 'Micro-blogging platform', difficulty: 'easy' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/feed/', description: 'Professional networking', difficulty: 'easy' },
      { name: 'Facebook', url: 'https://www.facebook.com/', description: 'Social networking', difficulty: 'easy' },
      { name: 'Pinterest', url: 'https://www.pinterest.com/pin-builder/', description: 'Visual discovery platform', difficulty: 'medium' },
      { name: 'Tumblr', url: 'https://www.tumblr.com/new/text', description: 'Microblogging platform', difficulty: 'easy' }
    ]
  },
  web2: {
    icon: <PenTool className="w-5 h-5" />,
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Web 2.0 and blogging platforms',
    sites: [
      { name: 'WordPress', url: 'https://wordpress.com/start/post', description: 'Popular CMS platform', difficulty: 'medium' },
      { name: 'Blogger', url: 'https://www.blogger.com/blog/posts/', description: 'Google\'s blogging platform', difficulty: 'easy' },
      { name: 'Wix Blog', url: 'https://www.wix.com/blog', description: 'Website builder blog', difficulty: 'medium' },
      { name: 'Weebly', url: 'https://www.weebly.com/editor/main.php', description: 'Drag-and-drop website builder', difficulty: 'easy' },
      { name: 'Strikingly', url: 'https://my.strikingly.com/sites', description: 'Single-page website builder', difficulty: 'easy' }
    ]
  },
  qa: {
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'text-red-600',
    gradient: 'from-red-500 to-orange-600',
    description: 'Q&A and community platforms',
    sites: [
      { name: 'Quora', url: 'https://www.quora.com/', description: 'Question and answer platform', difficulty: 'medium' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions/ask', description: 'Developer Q&A platform', difficulty: 'hard' },
      { name: 'Reddit Ask', url: 'https://www.reddit.com/r/AskReddit/', description: 'Community discussion platform', difficulty: 'medium' },
      { name: 'SuperUser', url: 'https://superuser.com/questions/ask', description: 'Tech support Q&A', difficulty: 'hard' },
      { name: 'Answerbag', url: 'https://www.answerbag.com/', description: 'General Q&A platform', difficulty: 'easy' }
    ]
  }
};

const SubmissionsDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAutoFillScript, setShowAutoFillScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError(null);
        const res = await getProjects();
        console.log('Projects fetched:', res);
        setProjects(Array.isArray(res) ? res : []);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setProjectsError(err.response?.data?.error || err.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const handleProjectSelect = (id: string) => {
    const found = (projects || []).find(p => p._id === id) || null;
    setSelectedProject(found);
    if (found) {
      localStorage.setItem('selectedProject', found._id);
    }
  };

  // Ultra-Smart Puppeteer function to open tab and auto-fill
  const openTabAndUltraSmartFill = async (url: string) => {
    if (!selectedProject) {
      alert('⚠️ Please select a project first!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/ultra-smart/open-and-ultra-fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: selectedProject.url,
          projectId: selectedProject._id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`🤖 ULTRA-SMART FILLING COMPLETE! ${result.filledCount} fields filled successfully!`);
    } catch (error) {
      console.error('Ultra-smart automation error:', error);
      alert('❌ Ultra-smart automation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Universal Form Puppeteer function to open tab and auto-fill ANY form system
  const openTabAndUniversalFill = async (url: string) => {
    if (!selectedProject) {
      alert('⚠️ Please select a project first!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/universal-form/open-and-universal-fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: url,
          projectId: selectedProject._id
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const systemsInfo = result.detectedSystems.length > 0 ? ` (Detected: ${result.detectedSystems.join(', ')})` : '';
        alert(`🌍 UNIVERSAL FORM FILLING COMPLETE! ${result.filledCount} fields filled${systemsInfo}`);
      } else {
        const errorMsg = result.details || result.error || 'Unknown error';
        const filledInfo = result.filledCount > 0 ? ` (${result.filledCount} fields were filled before error)` : '';
        alert(`❌ Universal form automation failed: ${errorMsg}${filledInfo}`);
      }
    } catch (error) {
      console.error('Universal form automation error:', error);
      alert('❌ Universal form automation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate auto-fill script
  const generateAutoFillScript = () => {
    if (!selectedProject) return '';
    
    return `// Auto-Fill Script for ${selectedProject.title}
// Copy and paste this in browser console (F12)

const projectData = {
  name: "${selectedProject.name || ''}",
  email: "${selectedProject.email || ''}",
  companyName: "${selectedProject.companyName || ''}",
  phone: "${selectedProject.businessPhone || ''}",
  description: "${selectedProject.description || ''}",
  url: "${selectedProject.url || ''}"
};

// Fill common form fields
document.querySelectorAll('input, textarea, select').forEach(field => {
  const fieldName = field.name || field.id || field.placeholder || '';
  const fieldValue = field.value || '';
  
  if (fieldName.toLowerCase().includes('name') && !fieldValue) {
    field.value = projectData.name;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('email') && !fieldValue) {
    field.value = projectData.email;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('company') && !fieldValue) {
    field.value = projectData.companyName;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('phone') && !fieldValue) {
    field.value = projectData.phone;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('url') && !fieldValue) {
    field.value = projectData.url;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('description') && !fieldValue) {
    field.value = projectData.description;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

console.log('✅ Auto-fill script executed for:', projectData.companyName || projectData.name);`;
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(generateAutoFillScript());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SEO Submissions Hub
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your SEO submissions with our intelligent automation tools. 
            Choose your project and let our AI-powered systems handle the rest.
          </p>
        </div>

        {/* Project Selection Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Project Configuration</h2>
              <p className="text-sm text-gray-600">Select the project you want to submit</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedProject?._id || ''}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="flex-1 border border-gray-200 px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">-- Select your project --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            
            {selectedProject && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Project Selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Fill Script Section */}
        {showAutoFillScript && selectedProject && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">🤖 Auto-Fill Script</h3>
                <p className="text-sm text-gray-600">Copy and paste this script in the browser console</p>
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-6 rounded-xl text-sm font-mono overflow-x-auto border border-gray-700">
              <pre className="whitespace-pre-wrap">{generateAutoFillScript()}</pre>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={copyScript}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
              
              <div className="text-xs text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                <strong>How to use:</strong> Open form page → Press <kbd className="bg-gray-200 px-2 py-1 rounded text-xs mx-1">F12</kbd> → Paste script → Press Enter
              </div>
            </div>
          </div>
        )}

        {/* Platform Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(siteMap).map(([category, { icon, sites, color, gradient, description }]) => (
            <div key={category} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold capitalize">{category} Platforms</h3>
                    <p className="text-white/80 text-sm">{description}</p>
                  </div>
                </div>
              </div>
              
              {/* Platform List */}
              <div className="p-6 space-y-3">
                {sites.map((site) => (
                  <div key={site.name} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/50 transition-all border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{site.name}</h4>
                          {site.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(site.difficulty)}`}>
                              {site.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center space-x-1"
                        >
                          <span>{site.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => openTabAndUltraSmartFill(site.url)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          title="Ultra-Smart Fill"
                        >
                          <Bot className="w-3 h-3 mr-1" />
                          Ultra-Smart
                        </button>
                        
                        <button
                          onClick={() => openTabAndUniversalFill(site.url)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          title="Universal Form Fill"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Universal
                        </button>
                        
                        <button
                          onClick={() => window.open(site.url, '_blank')}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Automation Status */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Automation Ready</h3>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Ultra-Smart System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Universal Form System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Chrome Integration</span>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Quick Guide</h3>
                <p className="text-sm text-gray-600">How to use automation</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Select your project</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Choose automation type</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Watch the magic happen!</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Platform Stats</h3>
                <p className="text-sm text-gray-600">Available platforms</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Platforms</span>
                <span className="text-lg font-bold text-purple-600">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-lg font-bold text-purple-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-green-600">95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show Script Button */}
        {selectedProject && !showAutoFillScript && (
          <div className="text-center">
            <button
              onClick={() => setShowAutoFillScript(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Bot className="w-4 h-4 mr-2" />
              Show Auto-Fill Script
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsDashboard;