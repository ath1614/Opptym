import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { 
  TrendingUp, 
  Globe, 
  FileText, 
  Target, 
  Crown,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Plus,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalSubmissions: number;
  successRate: number;
  averageRanking: number;
  backlinksGained: number;
  directoriesSubmitted: number;
}

interface DashboardDelta {
  totalProjects: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
  totalSubmissions: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
  successRate: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
  averageRanking: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
  backlinksGained: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
  directoriesSubmitted: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSubmissions: 0,
    successRate: 0,
    averageRanking: 0,
    backlinksGained: 0,
    directoriesSubmitted: 0
  });
  const [deltas, setDeltas] = useState<DashboardDelta>({
    totalProjects: { value: 0, delta: 0, direction: 'stable' },
    totalSubmissions: { value: 0, delta: 0, direction: 'stable' },
    successRate: { value: 0, delta: 0, direction: 'stable' },
    averageRanking: { value: 0, delta: 0, direction: 'stable' },
    backlinksGained: { value: 0, delta: 0, direction: 'stable' },
    directoriesSubmitted: { value: 0, delta: 0, direction: 'stable' }
  });
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch projects count
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const totalProjects = projectsResponse.data?.length || 0;

      // Fetch subscription details for limits
      let subscriptionResponse;
      try {
        subscriptionResponse = await axios.get('/api/subscription/details', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        // Subscription details are optional
      }

      // Fetch recent submissions
      let recentSubmissionsData = [];
      try {
        const submissionsResponse = await axios.get('/api/submissions?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        recentSubmissionsData = submissionsResponse.data || [];
      } catch (error) {
        // Recent submissions are optional
      }

      // Fetch analytics data
      let analyticsData = {};
      try {
        const analyticsResponse = await axios.get('/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        analyticsData = analyticsResponse.data || {};
      } catch (error) {
        // Analytics are optional
      }

      // Update stats with fetched data
      const updatedStats = {
        totalProjects,
        totalSubmissions: analyticsData.totalSubmissions || recentSubmissionsData.length || 0,
        successRate: analyticsData.successRate || 0,
        averageRanking: analyticsData.averageRanking || 0,
        backlinksGained: analyticsData.backlinksGained || 0,
        directoriesSubmitted: analyticsData.directoriesSubmitted || recentSubmissionsData.length || 0
      };

      setStats(updatedStats);
      setRecentSubmissions(recentSubmissionsData);

      // Calculate deltas (simplified for production)
      const newDeltas = {
        totalProjects: { value: totalProjects, delta: 0, direction: 'stable' as const },
        totalSubmissions: { value: updatedStats.totalSubmissions, delta: 0, direction: 'stable' as const },
        successRate: { value: updatedStats.successRate, delta: 0, direction: 'stable' as const },
        averageRanking: { value: updatedStats.averageRanking, delta: 0, direction: 'stable' as const },
        backlinksGained: { value: updatedStats.backlinksGained, delta: 0, direction: 'stable' as const },
        directoriesSubmitted: { value: updatedStats.directoriesSubmitted, delta: 0, direction: 'stable' as const }
      };

      setDeltas(newDeltas);

    } catch (error: any) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchDashboardData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const StatCard = ({ 
    title, 
    value, 
    delta, 
    icon: Icon, 
    color = 'primary',
    isLoading: cardLoading = false 
  }: {
    title: string;
    value: number | string;
    delta: { value: number; delta: number; direction: 'increase' | 'decrease' | 'stable' };
    icon: React.ComponentType<any>;
    color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
    isLoading?: boolean;
  }) => {
    const colorClasses = {
      primary: 'from-primary-500 to-primary-600',
      accent: 'from-accent-500 to-accent-600',
      success: 'from-success-500 to-success-600',
      warning: 'from-warning-500 to-warning-600',
      error: 'from-error-500 to-error-600'
    };

    const deltaColorClasses = {
      increase: 'text-success-600 dark:text-success-400',
      decrease: 'text-error-600 dark:text-error-400',
      stable: 'text-gray-600 dark:text-gray-400'
    };

    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6 hover:shadow-glass-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center text-white shadow-glow`}>
            <Icon className="w-6 h-6" />
          </div>
          {delta.delta !== 0 && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${deltaColorClasses[delta.direction]}`}>
              <TrendingUp className={`w-4 h-4 ${delta.direction === 'decrease' ? 'rotate-180' : ''}`} />
              <span>{Math.abs(delta.delta)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          {cardLoading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-96 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 p-6">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-error-600 dark:text-error-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unable to load dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800 dark:to-accent-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-700 dark:to-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-glass border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || user?.username || 'User'}!
              </h1>
              <p className="text-primary-600 text-sm">Here's your SEO automation overview</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            delta={deltas.totalProjects}
            icon={FileText}
            color="primary"
          />
          <StatCard
            title="Submissions"
            value={stats.totalSubmissions}
            delta={deltas.totalSubmissions}
            icon={Globe}
            color="accent"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            delta={deltas.successRate}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Avg. Ranking"
            value={stats.averageRanking || 'N/A'}
            delta={deltas.averageRanking}
            icon={Target}
            color="warning"
          />
          <StatCard
            title="Backlinks Gained"
            value={stats.backlinksGained}
            delta={deltas.backlinksGained}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="Directories Submitted"
            value={stats.directoriesSubmitted}
            delta={deltas.directoriesSubmitted}
            icon={Globe}
            color="accent"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-primary-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-accent-50 to-primary-50 hover:from-accent-100 hover:to-primary-100 rounded-xl transition-all duration-200 group">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Project</p>
                <p className="text-sm text-gray-600">Start a new SEO project</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-success-50 to-accent-50 hover:from-success-100 hover:to-accent-100 rounded-xl transition-all duration-200 group">
              <div className="w-10 h-10 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Submit Directory</p>
                <p className="text-sm text-gray-600">Submit to directories</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-warning-50 to-accent-50 hover:from-warning-100 hover:to-accent-100 rounded-xl transition-all duration-200 group">
              <div className="w-10 h-10 bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Check your progress</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {recentSubmissions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary-800">Recent Activity</h2>
              <button className="flex items-center space-x-2 text-accent-600 hover:text-accent-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {recentSubmissions.slice(0, 5).map((submission, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{submission.directoryName || 'Directory Submission'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{submission.status || 'Submitted'}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
