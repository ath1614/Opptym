import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './i18n'; // Import i18n configuration
import { useAuthProvider, AuthContext } from './hooks/useAuth';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import MyProjects from './components/Projects/MyProjects';
import SEOTools from './components/SEO/SeoToolsDashboard';
import SubmissionDashboard from './components/Submission/SubmissionDashboard';
import PricingPlans from './components/Pricing/PricingPlans';
import ProfileSettings from './components/Profile/ProfileSettings';
import AdminPanel from './components/Admin/AdminPanel';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import TrialExpirationModal from './components/TrialExpirationModal';

import { BookOpen, Settings, Shield, Sparkles } from 'lucide-react';
import { showPopup } from './utils/popup';

interface Project {
  _id: string;
  title: string;
  url: string;
  email?: string;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  targetKeywords?: string[];
  sitemapUrl?: string;
  robotsTxtUrl?: string;
  metaTagReport?: object;
  keywordDensityReport?: object;
  backlinkReport?: object;
  brokenLinksReport?: object;
  sitemapReport?: object;
  robotsReport?: object;
  keywordTrackerReport?: object;
  submissions?: any[];
}

function App() {
  const authProvider = useAuthProvider();



  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  
  // Initialize activeTab from localStorage or URL hash, default to dashboard
  const getInitialTab = () => {
    // Check URL hash first
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'projects', 'tools', 'directory', 'reports', 'pricing', 'profile', 'admin'].includes(hash)) {
      return hash;
    }
    // Fall back to localStorage
    return localStorage.getItem('activeTab') || 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Move all project-related state to the top
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Trial expiration modal state
  const [showTrialExpirationModal, setShowTrialExpirationModal] = useState(false);

  // Update localStorage and URL hash when activeTab changes
  const updateActiveTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
    window.location.hash = tab;
  };

  // Listen for hash changes (back/forward browser buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['dashboard', 'projects', 'tools', 'directory', 'reports', 'pricing', 'profile', 'admin'].includes(hash)) {
        setActiveTab(hash);
        localStorage.setItem('activeTab', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Set initial hash if not present
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Check trial expiration
  useEffect(() => {
    if (authProvider.user && authProvider.user.subscription === 'free') {
      // Check if trial has expired
      const checkTrialExpiration = () => {
        const trialEndDate = authProvider.user?.trialEndDate;
        if (trialEndDate && new Date() > new Date(trialEndDate)) {
          // Show trial expiration modal
          setShowTrialExpirationModal(true);
        }
      };
      
      checkTrialExpiration();
      
      // Check every time user navigates
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkTrialExpiration();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [authProvider.user]);

  // Clear invalid tokens on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Basic token validation
        const parts = token.split('.');
        if (parts.length !== 3) {
          localStorage.removeItem('token');
          return;
        }
        
        // Try to decode payload
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        
        const payload = JSON.parse(atob(base64));
        if (!payload.userId || !payload.email) {
          localStorage.removeItem('token');
          return;
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Handle manual logout for debugging
  const handleManualLogout = () => {

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Add global function for debugging
  useEffect(() => {
    (window as any).manualLogout = handleManualLogout;

  }, []);

  // Fetch projects when activeTab changes to reports
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setProjectsError('No authentication token found. Please log in again.');
          setProjectsLoading(false);
          return;
        }
        
        const res = await axios.get('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjects(res.data);
      } catch (err: any) {
        console.error('Error loading projects:', err);
        setProjectsError(err.response?.data?.error || err.message || 'Failed to load projects');
      } finally {
        setProjectsLoading(false);
      }
    };

    if (activeTab === 'reports') {
      fetchProjects();
    }
  }, [activeTab]);

  // If user is not authenticated, show landing/login/register
  if (!authProvider.user || !authProvider.user.id) {
    return (
      <AuthContext.Provider value={authProvider}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-100 to-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>
          </div>



          
          <div className="relative z-10">
            {authMode === 'landing' && <LandingPage onLoginClick={() => setAuthMode('login')} onRegisterClick={() => setAuthMode('register')} />}
            {authMode === 'login' && <Login onSwitchToRegister={() => setAuthMode('register')} />}
            {authMode === 'register' && <Register onSwitchToLogin={() => setAuthMode('login')} />}
          </div>
        </div>
        
        {/* Trial Expiration Modal */}
        <TrialExpirationModal
          isOpen={showTrialExpirationModal}
          onClose={() => setShowTrialExpirationModal(false)}
          onUpgrade={() => {
            setShowTrialExpirationModal(false);
            updateActiveTab('pricing');
          }}
        />
      </AuthContext.Provider>
    );
  }

  const navigateToTab = (tab: string) => {
    updateActiveTab(tab);
  };

  // Run SEO analysis
  const handleRunAnalysis = () => {
    navigateToTab('tools');
  };

  // View reports
  const handleViewReports = () => {
    navigateToTab('reports');
  };

  // View project report
  const handleViewProjectReport = async (project: Project) => {
    setReportLoading(true);
    try {
      setSelectedProject(project);
      // Show the project report directly
      setShowProjectReport(true);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error loading project report:', error);
      showPopup('Failed to load project report. Please try again.', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  // View all projects
  const handleViewAllProjects = () => {
    navigateToTab('projects');
  };

  // View specific project
  const handleViewProject = (projectId: string) => {
    navigateToTab('projects');
    // You could also set a selected project state here
  };

  // Create first project
  const handleCreateFirstProject = () => {
    navigateToTab('projects');
  };

  const renderContent = () => {
    // Check if user is admin for admin-only routes
    const isAdmin = authProvider.user?.isAdmin;
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;

      case 'projects':
        return <MyProjects />;
      case 'tools':
        return <SEOTools />;
      case 'directory':
        return <SubmissionDashboard />;
      case 'reports':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
              <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
              
              {/* Modern Header Section */}
              <div className="text-center space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-glass border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
                      SEO Project Reports
                    </h1>
                    <p className="text-primary-600 text-sm">Comprehensive analytics and insights</p>
                  </div>
                </div>
              </div>

              {/* Modern Project Selection Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-primary-800">Project Selection</h2>
                    <p className="text-primary-600">Choose a project to view detailed reports</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <select
                      onChange={(e) => {
                        const projectId = e.target.value;
                        const project = projects.find((p) => p._id === projectId);
                        setSelectedProject(project || null);
                      }}
                      className="flex-1 border border-primary-200 px-6 py-4 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
                      defaultValue=""
                      disabled={projectsLoading}
                    >
                      <option value="" disabled>
                        {projectsLoading ? 'Loading projects...' : '-- Select your project --'}
                      </option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.url})
                        </option>
                      ))}
                    </select>
                    
                    {selectedProject && (
                      <div className="flex items-center space-x-3 px-4 py-2 bg-success-50 border border-success-200 rounded-xl">
                        <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                        <span className="text-success-700 font-medium">Project Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {projectsLoading && (
                    <div className="flex items-center space-x-3 text-accent-600 bg-accent-50 border border-accent-200 rounded-xl p-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-600"></div>
                      <span className="font-medium">Loading projects...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {projectsError && (
                    <div className="bg-error-50 border border-error-200 rounded-2xl p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-error-500 rounded-full"></div>
                        <span className="text-error-800 font-medium">Error loading projects:</span>
                      </div>
                      <p className="text-error-700 mt-2">{projectsError}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-3 text-error-600 hover:text-error-800 font-medium underline transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Project Details */}
                  {selectedProject && (
                    <div className="bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 rounded-2xl p-8 animate-scale-in">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-primary-800">{selectedProject.title}</h3>
                        <span className="text-primary-600 bg-white/50 px-4 py-2 rounded-xl">{selectedProject.url}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-sm text-primary-600 mb-1">Category</p>
                          <p className="font-semibold text-primary-800">{selectedProject.category || 'General'}</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-sm text-primary-600 mb-1">Email</p>
                          <p className="font-semibold text-primary-800">{selectedProject.email || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleViewProjectReport(selectedProject)}
                          disabled={reportLoading}
                          className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-3 rounded-xl font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reportLoading ? 'Loading...' : 'View Full Report'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return <PricingPlans />;
      case 'profile':
        return <ProfileSettings />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div>Access Denied</div>;
      default:
        return <Dashboard />;
    }
  };

  // If user is authenticated, show main app
  return (
    <AuthContext.Provider value={authProvider}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-100 to-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>


        
        <div className="relative z-10">
          <div className="flex">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={updateActiveTab}
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
            />
            <div className="flex-1">
              <Navbar activeTab={activeTab} setActiveTab={updateActiveTab} />
              <main className="p-6">
                {renderContent()}
              </main>
            </div>
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;