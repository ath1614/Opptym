import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import MyProjects from './components/Projects/MyProjects';
import SEOTools from './components/SEO/SeoToolsDashboard';
import SubmissionDashboard from './components/Submission/SubmissionDashboard';
import ProjectDetails from './components/Reports/ProjectDetails';
import PricingPlans from './components/Pricing/PricingPlans';
import ProfileSettings from './components/Profile/ProfileSettings';
import AdminPanel from './components/Admin/AdminPanel';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import { BookOpen, Settings, Eye, FileText, Plus, Shield } from 'lucide-react';
import { BASE_URL } from './lib/api';

function App() {
  const authProvider = useAuthProvider();

  console.log('🔍 App render - authProvider.user:', authProvider.user);
  console.log('🔍 App render - localStorage token:', !!localStorage.getItem('token'));

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

  // Development mode quick login helper
  const handleQuickLogin = async () => {
    try {
      console.log('🔍 Attempting quick login...');
      await authProvider.login('test@example.com', 'password123');
      console.log('✅ Quick login successful');
    } catch (error) {
      console.error('❌ Quick login failed:', error);
      // If quick login fails, show registration form
      setAuthMode('register');
    }
  };

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

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
        
        const res = await axios.get(`${BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Projects fetched:', res.data);
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
      alert('Failed to load project report. Please try again.');
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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header Section */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SEO Project Reports
                  </h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Comprehensive analytics and insights for your SEO projects. 
                  Track performance, submissions, and optimization opportunities.
                </p>
              </div>

              {/* Project Selection Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Project Selection</h2>
                    <p className="text-sm text-gray-600">Choose a project to view detailed reports</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <select
                      onChange={(e) => {
                        const projectId = e.target.value;
                        const project = projects.find((p) => p._id === projectId);
                        setSelectedProject(project || null);
                      }}
                      className="flex-1 border border-gray-200 px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Project Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {projectsLoading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Loading projects...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {projectsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-red-800 text-sm font-medium">Error loading projects:</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">{projectsError}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Project Details */}
                  {selectedProject && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{selectedProject.title}</h3>
                        <span className="text-sm text-gray-600">{selectedProject.url}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-medium">{selectedProject.category || 'General'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedProject.email || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewProject(selectedProject._id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleViewProjectReport(selectedProject)}
                          disabled={reportLoading}
                          className="px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reportLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              <span>View Reports</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Project Report Display */}
                  {showProjectReport && selectedProject && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Project Report: {selectedProject.title}</h2>
                        <button
                          onClick={() => setShowProjectReport(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Hide Report</span>
                        </button>
                      </div>
                      <ProjectDetails project={selectedProject} />
                    </div>
                  )}

                  {/* Empty State */}
                  {!selectedProject && projects.length === 0 && !projectsLoading && !projectsError && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                      <p className="text-gray-600 mb-4">Create your first project to start generating reports</p>
                      <button
                        onClick={handleCreateFirstProject}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Your First Project</span>
                      </button>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-blue-800 text-sm">
                        <strong>{projects.length} project(s) available.</strong> Select one from the dropdown above to view its reports.
                      </p>
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
        // Only allow admin access if user is admin
        if (!isAdmin) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">
                  You don't have permission to access the admin panel. Only administrators can view this section.
                </p>
                
                {/* Debug Info */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-semibold text-gray-800 mb-2">Debug Info:</h4>
                  <p className="text-sm text-gray-600">User ID: {authProvider.user?.id}</p>
                  <p className="text-sm text-gray-600">Email: {authProvider.user?.email}</p>
                  <p className="text-sm text-gray-600">isAdmin: {authProvider.user?.isAdmin ? 'true' : 'false'}</p>
                  <p className="text-sm text-gray-600">Role: {authProvider.user?.role}</p>
                  <p className="text-sm text-gray-600">Subscription: {authProvider.user?.subscription}</p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => updateActiveTab('dashboard')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      authProvider.refreshUser();
                      window.location.reload();
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Refresh & Try Again
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthContext.Provider value={authProvider}>
      <div className="min-h-screen bg-gray-50">
        {!authProvider.user ? (
          <div>
            {authMode === 'landing' ? (
              <LandingPage
                onLoginClick={() => setAuthMode('login')}
                onRegisterClick={() => setAuthMode('register')}
              />
            ) : authMode === 'login' ? (
              <Login onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <Register onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={updateActiveTab}
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar activeTab={activeTab} setActiveTab={updateActiveTab} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                {renderContent()}
              </main>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;