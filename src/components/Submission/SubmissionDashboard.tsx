import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { UniversalFormService } from '../../services/UniversalFormService';
import { 
  Globe, 
  Target, 
  Zap, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  BookOpen,
  ExternalLink,
  Copy,
  Trash2,
  Settings,
  BarChart3
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  url: string;
  email: string;
  businessPhone: string;
  companyName: string;
  description: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface Directory {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  submittedAt?: string;
}

export default function SubmissionDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchDirectories();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDirectories = async () => {
    // Mock directories data
    const mockDirectories: Directory[] = [
      {
        id: '1',
        name: 'TechDirectory',
        url: 'https://techdirectory.com',
        category: 'Technology',
        description: 'Leading technology business directory',
        status: 'pending'
      },
      {
        id: '2',
        name: 'BusinessHub',
        url: 'https://businesshub.com',
        category: 'Business',
        description: 'Comprehensive business directory',
        status: 'completed',
        submittedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '3',
        name: 'LocalSearch',
        url: 'https://localsearch.com',
        category: 'Local',
        description: 'Local business directory and search',
        status: 'failed'
      },
      {
        id: '4',
        name: 'IndustryList',
        url: 'https://industrylist.com',
        category: 'Industry',
        description: 'Industry-specific business listings',
        status: 'pending'
      },
      {
        id: '5',
        name: 'StartupDirectory',
        url: 'https://startupdirectory.com',
        category: 'Startup',
        description: 'Startup and innovation directory',
        status: 'completed',
        submittedAt: '2024-01-14T15:45:00Z'
      }
    ];
    setDirectories(mockDirectories);
  };

  const handleOneClickAutomation = async (url: string, siteName: string) => {
    if (!selectedProject) {
      showPopup(`⚠️ ${t('submissions.selectProject')}`, 'warning');
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        name: selectedProject.name || '',
        email: selectedProject.email || '',
        phone: selectedProject.businessPhone || '',
        companyName: selectedProject.companyName || '',
        url: selectedProject.url || '',
        description: selectedProject.description || '',
        address: selectedProject.address1 || '',
        city: selectedProject.city || '',
        state: selectedProject.state || '',
        country: selectedProject.country || '',
        pincode: selectedProject.pincode || ''
      };

      const universalService = new UniversalFormService(projectData);
      const result = await universalService.installBookmarkletAutomatically();
      showBookmarkletInstructionsModal(url, siteName, projectData, result);

    } catch (error) {
      console.error('One-click automation error:', error);
      showPopup('❌ Automation setup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showBookmarkletInstructionsModal = (url: string, siteName: string, projectData: any, result: any) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    content.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">🎯</div>
      <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #1f2937;">Bookmarklet Ready!</h2>
      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
        Your automation bookmarklet has been created. It will <strong>auto-delete after 30 minutes</strong> to keep your bookmarks clean.
      </p>

      <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1f2937;">📋 Next Steps:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
          <li><strong>Click "Visit Website"</strong> to open ${siteName}</li>
          <li><strong>Drag the bookmarklet</strong> from your bookmarks bar to the page</li>
          <li><strong>Watch the magic happen!</strong> Forms will be filled automatically</li>
          <li><strong>Bookmarklet auto-deletes</strong> after 30 minutes</li>
        </ol>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px;">
        <button id="visitWebsiteBtn" style="
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🌐 Visit ${siteName}
        </button>
        <button id="closeModalBtn" style="
          background: #f3f4f6;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
          ✕ Close
        </button>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; font-size: 14px; color: #92400e;">
        ⏰ <strong>Auto-cleanup:</strong> Bookmarklet will be automatically removed after 30 minutes
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('visitWebsiteBtn')?.addEventListener('click', () => {
      window.open(url, '_blank');
      modal.remove();
    });

    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
      modal.remove();
    });

    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 5 * 60 * 1000);
  };

  const showPopup = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      popup.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    }, 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'failed':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDirectories = directories.filter(dir => {
    const matchesSearch = dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dir.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dir.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(directories.map(d => d.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-950 dark:via-accent-950 dark:to-primary-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
              Directory Submissions
            </h1>
            <p className="text-primary-600 dark:text-primary-400 mt-2">
              Automate your directory submissions with AI-powered form filling
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 rounded-xl text-primary-700 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              <span>Instructions</span>
            </button>
            <button
              onClick={fetchDirectories}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 rounded-xl text-primary-700 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/30 dark:to-primary-900/30 backdrop-blur-lg rounded-3xl shadow-glass border border-accent-200 dark:border-accent-700/30 p-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200">How It Works</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-glow mx-auto mb-3">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Select Project</h4>
                <p className="text-sm text-primary-600 dark:text-primary-400">Choose the project you want to submit to directories</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-glow mx-auto mb-3">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Click Fill Form</h4>
                <p className="text-sm text-primary-600 dark:text-primary-400">Our AI will create a bookmarklet for automatic form filling</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-glow mx-auto mb-3">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">Visit & Submit</h4>
                <p className="text-sm text-primary-600 dark:text-primary-400">Visit the directory and use the bookmarklet to auto-fill forms</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Selection */}
        <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-6">
          <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">Select Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedProject?._id === project._id
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 shadow-glow'
                    : 'border-primary-200 dark:border-primary-700 bg-white/50 dark:bg-primary-900/50 hover:border-accent-300 dark:hover:border-accent-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white shadow-glow">
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200 truncate">
                    {project.name}
                  </h4>
                </div>
                <p className="text-sm text-primary-600 dark:text-primary-400 truncate">
                  {project.url}
                </p>
                {selectedProject?._id === project._id && (
                  <div className="flex items-center space-x-1 mt-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-xs text-success-600 dark:text-success-400 font-medium">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="Search directories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 rounded-xl text-primary-700 dark:text-primary-300 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 rounded-xl text-primary-700 dark:text-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400">
            <span>{filteredDirectories.length} directories</span>
            <span>•</span>
            <span>{filteredDirectories.filter(d => d.status === 'completed').length} completed</span>
          </div>
        </div>

        {/* Directories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDirectories.map((directory, index) => (
            <div
              key={directory.id}
              className="group bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 hover:shadow-glass-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-800 dark:text-primary-200">
                        {directory.name}
                      </h3>
                      <p className="text-xs text-primary-500 dark:text-primary-400">
                        {directory.category}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(directory.status)}`}>
                    {getStatusIcon(directory.status)}
                    <span>{directory.status}</span>
                  </div>
                </div>
                
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 line-clamp-2">
                  {directory.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => window.open(directory.url, '_blank')}
                    className="flex items-center space-x-2 text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Site</span>
                  </button>
                  
                  <button
                    onClick={() => handleOneClickAutomation(directory.url, directory.name)}
                    disabled={loading || !selectedProject}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>Fill Form</span>
                  </button>
                </div>
                
                {directory.submittedAt && (
                  <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-700">
                    <div className="flex items-center space-x-2 text-xs text-primary-500 dark:text-primary-400">
                      <Clock className="w-3 h-3" />
                      <span>Submitted {new Date(directory.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDirectories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center text-white shadow-glow mx-auto mb-4">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-2">
              No directories found
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}