import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  TrendingUp, 
  Star, 
  Activity, 
  Plus, 
  Target, 
  BarChart3, 
  Calendar, 
  Eye,
  Edit,
  PieChart,
  LineChart,
  Loader2,
  Send,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../lib/api';
import { getUserDisplayName } from '../../utils/userUtils';
import { useAuth } from '../../hooks/useAuth';
import SubscriptionStatus from '../Subscription/SubscriptionStatus';

interface Project {
  _id: string;
  title: string;
  url: string;
  createdAt: string;
  submissionsCount?: number;
  seoScore?: number;
  category?: string;
  email?: string;
}

interface Submission {
  _id: string;
  projectId: string;
  siteName: string;
  submissionType: string;
  status: string;
  submittedAt: string;
}

interface DashboardStats {
  totalProjects: number;
  totalSubmissions: number;
  averageScore: number;
  recentActivity: number;
  growthRate: number;
  successRate: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSubmissions: 0,
    averageScore: 0,
    recentActivity: 0,
    growthRate: 0,
    successRate: 0
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Navigation function
  const navigateToTab = (tab: string) => {
    window.location.hash = tab;
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    setError('');
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Create new project
  const handleCreateProject = () => {
    navigateToTab('projects');
  };

  // Run SEO analysis
  const handleRunSEOAnalysis = () => {
    navigateToTab('tools');
  };

  // View reports
  const handleViewReports = () => {
    navigateToTab('reports');
  };

  // View all projects
  const handleViewAllProjects = () => {
    navigateToTab('projects');
  };

  // View project details
  const handleViewProject = (projectId: string) => {
    navigateToTab(`projects/${projectId}`);
  };

  // Edit project
  const handleEditProject = (projectId: string) => {
    navigateToTab(`projects/${projectId}/edit`);
  };

  // Create first project
  const handleCreateFirstProject = () => {
    navigateToTab('projects');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      console.log('🔍 Fetching dashboard data...');

      const [projectsResponse, submissionsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/projects`, { headers }),
        axios.get(`${BASE_URL}/submissions`, { headers })
      ]);

      const projectsData = projectsResponse.data;
      const submissionsData = submissionsResponse.data;

      console.log('🔍 Projects data:', projectsData);
      console.log('🔍 Submissions data:', submissionsData);

      // Ensure we have arrays
      const projects = Array.isArray(projectsData) ? projectsData : [];
      const submissions = Array.isArray(submissionsData) ? submissionsData : [];

      setProjects(projects.slice(0, 5)); // Show only 5 recent projects
      setSubmissions(submissions);

      // Calculate stats with safe defaults
      const totalSubmissions = submissions.length;
      const totalProjects = projects.length;
      
      // Calculate average score safely
      let averageScore = 0;
      if (totalProjects > 0) {
        const validScores = projects
          .map((p: Project) => p.seoScore)
          .filter((score: any): score is number => typeof score === 'number' && !isNaN(score));
        
        if (validScores.length > 0) {
          averageScore = Math.round(validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length);
        }
      }

      // Calculate recent activity (submissions in last 7 days)
      const recentActivity = submissions.filter((s: Submission) => {
        try {
          if (!s.submittedAt) return false;
          const submissionDate = new Date(s.submittedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return submissionDate > weekAgo;
        } catch (error) {
          console.error('Error parsing submission date:', error);
          return false;
        }
      }).length;

      // Calculate success rate
      let successRate = 0;
      if (totalSubmissions > 0) {
        const successfulSubmissions = submissions.filter((s: Submission) => s.status === 'success').length;
        successRate = Math.round((successfulSubmissions / totalSubmissions) * 100);
      }

      // Calculate growth rate based on recent activity vs previous period
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentSubmissions = submissions.filter((s: Submission) => {
        try {
          const submissionDate = new Date(s.submittedAt);
          return submissionDate > oneWeekAgo;
        } catch (error) {
          return false;
        }
      }).length;
      
      const previousSubmissions = submissions.filter((s: Submission) => {
        try {
          const submissionDate = new Date(s.submittedAt);
          return submissionDate > twoWeeksAgo && submissionDate <= oneWeekAgo;
        } catch (error) {
          return false;
        }
      }).length;

      let growthRate = 0;
      if (previousSubmissions > 0) {
        growthRate = Math.round(((recentSubmissions - previousSubmissions) / previousSubmissions) * 100);
      } else if (recentSubmissions > 0) {
        growthRate = 100; // New activity
      }

      console.log('🔍 Calculated stats:', { 
        totalProjects, 
        totalSubmissions, 
        averageScore, 
        recentActivity, 
        growthRate,
        successRate 
      });

      setStats({
        totalProjects,
        totalSubmissions,
        averageScore,
        recentActivity,
        growthRate,
        successRate
      });

      // Generate chart data
      generateChartData(projects, submissions);

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You may not have permission to view this data.');
      } else if (error.response?.status === 404) {
        setError('API endpoints not found. Please check if the backend is running.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check if the backend is running on port 5050.');
      } else if (error.response?.data?.error) {
        setError(`Server error: ${error.response.data.error}`);
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (projects: Project[], submissions: Submission[]) => {
    // Generate project categories chart
    const categoryCounts: { [key: string]: number } = {};
    projects.forEach(project => {
      const category = project.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const chartData: ChartData = {
      labels: Object.keys(categoryCounts),
      datasets: [{
        label: 'Projects by Category',
        data: Object.values(categoryCounts),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ],
        borderColor: [
          '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
          '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
        ],
        borderWidth: 2
      }]
    };

    setChartData(chartData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getScoreColor = (score: number) => {
    if (typeof score !== 'number' || isNaN(score)) return 'text-gray-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (typeof score !== 'number' || isNaN(score)) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text-modern">
            Welcome back, {getUserDisplayName(user)}! 👋
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here's what's happening with your SEO automation projects today
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={refreshDashboard}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 hover:bg-white/90 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+{stats.growthRate}%</span>
                </div>
                <p className="text-xs text-gray-500">vs last week</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProjects}</h3>
            <p className="text-sm text-gray-600">Total Projects</p>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-green-600">{stats.successRate}%</span>
                </div>
                <p className="text-xs text-gray-500">success rate</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalSubmissions}</h3>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.averageScore}</h3>
            <p className="text-sm text-gray-600">Average SEO Score</p>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.recentActivity}</h3>
            <p className="text-sm text-gray-600">Recent Activity</p>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="card-modern p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Subscription Status</h3>
          <SubscriptionStatus />
        </div>

        {/* Quick Actions */}
        <div className="card-modern p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleCreateProject}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Project</span>
            </button>
            <button 
              onClick={handleRunSEOAnalysis}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg"
            >
              <Target className="w-5 h-5" />
              <span className="font-medium">Run SEO Analysis</span>
            </button>
            <button 
              onClick={handleViewReports}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">View Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Projects</h3>
            <button 
              onClick={handleViewAllProjects}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All Projects
            </button>
          </div>
          
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600">{project.url}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{project.createdAt ? formatDate(project.createdAt) : 'Unknown date'}</span>
                        </span>
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{project.submissionsCount || 0} submissions</span>
                        </span>
                        {project.category && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {project.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {typeof project.seoScore === 'number' && !isNaN(project.seoScore) && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(project.seoScore)} ${getScoreColor(project.seoScore)}`}>
                        {project.seoScore}/100
                      </div>
                    )}
                    <button 
                      onClick={() => handleViewProject(project._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Project Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProject(project._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h4>
              <p className="text-gray-600 mb-4">Create your first project to get started with SEO automation</p>
              <button 
                onClick={handleCreateFirstProject}
                className="btn-primary"
              >
                Create Your First Project
              </button>
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Submissions</h3>
              <button 
                onClick={() => navigateToTab('directory')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Submissions
              </button>
            </div>
            
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission) => (
                <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{submission.siteName}</p>
                      <p className="text-xs text-gray-600">{submission.submissionType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {submission.submittedAt ? formatDate(submission.submittedAt) : 'Unknown date'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Projects by Category</h3>
            {chartData && chartData.labels.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {chartData.labels.length} categories • {chartData.datasets[0].data.reduce((a, b) => a + b, 0)} total projects
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No data available for charts</p>
                  <p className="text-sm text-gray-500">Create some projects to see analytics</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {stats.recentActivity > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(0, 3).map((submission) => (
                    <div key={submission._id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {submission.status === 'success' ? 'Directory submission successful' : 
                           submission.status === 'pending' ? 'Directory submission pending' : 
                           'Directory submission failed'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {submission.siteName} • {submission.submittedAt ? formatDate(submission.submittedAt) : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500">Start creating projects and submissions to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}