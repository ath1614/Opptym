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
  ArrowDownRight,
  Minus,
  Plus,
  RefreshCw
} from 'lucide-react';
// Removed old TrialExpirationModal import - now handled in App.tsx

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
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  // Trial modal logic removed - now handled in App.tsx

  // Calculate delta percentage between two values
  const calculateDelta = (current: number, previous: number): { delta: number; direction: 'increase' | 'decrease' | 'stable' } => {
    if (previous === 0) {
      return { delta: 0, direction: 'stable' };
    }
    
    const deltaPercent = ((current - previous) / previous) * 100;
    
    if (Math.abs(deltaPercent) < 1) {
      return { delta: 0, direction: 'stable' };
    }
    
    return {
      delta: Math.abs(deltaPercent),
      direction: deltaPercent > 0 ? 'increase' : 'decrease'
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const totalProjects = projectsResponse.data.length;
      
      // Fetch subscription details
      try {
        const subscriptionResponse = await axios.get('/api/subscription/details', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSubscription(subscriptionResponse.data);
        
        // Trial modal logic removed - now handled in App.tsx
      } catch (error) {
        // Set fallback subscription data for free users
        const getPlanLimits = (plan: string) => {
          switch (plan) {
            case 'business':
              return { submissions: 1500, projects: 50, tools: 1000 };
            case 'pro':
              return { submissions: 750, projects: 15, tools: 500 };
            case 'starter':
              return { submissions: 150, projects: 5, tools: 100 };
            case 'free':
            default:
              return { submissions: 5, projects: 2, tools: 10 };
          }
        };
        
        // Always default to free plan if subscription API fails
        const userPlan = 'free';
        const limits = getPlanLimits(userPlan);
        
        setSubscription({
          subscription: userPlan,
          status: 'active',
          nextBillingDate: null, // No billing date for free users
          currentUsage: {
            submissionsUsed: 0,
            projectsUsed: 0,
            seoToolsUsed: 0,
            apiCallsUsed: 0
          },
          limits: limits,
          isInTrial: true,
          trialDaysLeft: 3,
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          trialExpired: false
        });
      }

      // Fetch recent submissions
      try {
        const submissionsResponse = await axios.get('/api/submissions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('📊 Dashboard submissions response:', {
          count: submissionsResponse.data.length,
          submissions: submissionsResponse.data.map(s => ({
            id: s._id,
            type: s.submissionType,
            status: s.status,
            site: s.siteName
          }))
        });
        setStats(prev => ({ ...prev, totalSubmissions: submissionsResponse.data.length }));
        // Map submission statuses correctly
        const successfulSubmissions = submissionsResponse.data.filter((s: any) => 
          s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
        );
        const pendingSubmissions = submissionsResponse.data.filter((s: any) => 
          s.status === 'pending' || s.status === 'processing' || s.status === 'submitted' || s.status === 'draft'
        );
        const failedSubmissions = submissionsResponse.data.filter((s: any) => 
          s.status === 'failed' || s.status === 'error' || s.status === 'rejected'
        );
        
        const calculatedStats: DashboardStats = {
          totalProjects: totalProjects, // Use actual projects count
          totalSubmissions: submissionsResponse.data.length,
          successRate: submissionsResponse.data.length > 0 ? Math.round((successfulSubmissions.length / submissionsResponse.data.length) * 100) : 0,
          averageRanking: successfulSubmissions.length > 0 ? Math.round(successfulSubmissions.reduce((acc: number, s: any) => acc + (s.ranking || 0), 0) / successfulSubmissions.length) : 0,
          backlinksGained: successfulSubmissions.length,
          directoriesSubmitted: submissionsResponse.data.length
        };

        // Store previous values for delta calculation
        const previousStats = { ...stats };
        
        // Update stats with calculated data
        setStats(calculatedStats);
        
        // Calculate deltas with previous values
        const newDeltas: DashboardDelta = {
          totalProjects: { ...calculateDelta(calculatedStats.totalProjects, previousStats.totalProjects), value: calculatedStats.totalProjects },
          totalSubmissions: { ...calculateDelta(calculatedStats.totalSubmissions, previousStats.totalSubmissions), value: calculatedStats.totalSubmissions },
          successRate: { ...calculateDelta(calculatedStats.successRate, previousStats.successRate), value: calculatedStats.successRate },
          averageRanking: { ...calculateDelta(calculatedStats.averageRanking, previousStats.averageRanking), value: calculatedStats.averageRanking },
          backlinksGained: { ...calculateDelta(calculatedStats.backlinksGained, previousStats.backlinksGained), value: calculatedStats.backlinksGained },
          directoriesSubmitted: { ...calculateDelta(calculatedStats.directoriesSubmitted, previousStats.directoriesSubmitted), value: calculatedStats.directoriesSubmitted }
        };
        
        setDeltas(newDeltas);
        
        // Generate real recent activity from actual data
        const realActivity = [];
        
        // Add recent submissions
        submissionsResponse.data.slice(0, 3).forEach((submission: any, index: number) => {
          const timeAgo = submission.createdAt ? 
            new Date(submission.createdAt).toLocaleDateString() : 
            `${index + 1} day${index > 0 ? 's' : ''} ago`;
          
          realActivity.push({
            id: `submission-${submission._id || index}`,
            type: 'submission',
            message: `Submission to ${submission.directoryName || 'Directory'} ${submission.status === 'success' ? 'completed' : submission.status === 'failed' ? 'failed' : 'is processing'}`,
            time: timeAgo,
            status: submission.status === 'success' ? 'success' : submission.status === 'failed' ? 'error' : 'pending'
          });
        });
        
        // Add recent projects (use already fetched data)
        projectsResponse.data.slice(0, 2).forEach((project: any, index: number) => {
          realActivity.push({
            id: `project-${project._id || index}`,
            type: 'project',
            message: `Project: ${project.title || project.companyName || 'Untitled Project'}`,
            time: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : `${index + 1} day${index > 0 ? 's' : ''} ago`,
            status: 'success'
          });
        });
        
        // If no real activity, show default message
        if (realActivity.length === 0) {
          realActivity.push({
            id: 'welcome',
            type: 'project',
            message: 'Welcome to Opptym! Create your first project to get started.',
            time: 'Just now',
            status: 'success'
          });
        }
        
        setRecentActivity(realActivity);

      } catch (error) {
        setRecentActivity([]);
      }
      
      // Fetch analytics and update stats with real data
      try {
        const analyticsResponse = await axios.get('/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Update stats with analytics data
        if (analyticsResponse.data) {
          setStats(prev => {
            const updatedStats = {
              ...prev,
              totalProjects: analyticsResponse.data.totalProjects || totalProjects,
              totalSubmissions: analyticsResponse.data.totalSubmissions || prev.totalSubmissions,
              successRate: analyticsResponse.data.successRate || prev.successRate,
              averageRanking: analyticsResponse.data.averageRanking || prev.averageRanking,
              backlinksGained: analyticsResponse.data.backlinksGained || prev.backlinksGained,
              directoriesSubmitted: analyticsResponse.data.totalSubmissions || prev.directoriesSubmitted
            };
            return updatedStats;
          });

          // Update deltas with analytics data
          if (analyticsResponse.data.deltas) {
            setDeltas(analyticsResponse.data.deltas);
          }
        }
      } catch (error) {
        // Keep existing stats if analytics fails
      }
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // setError('Failed to load dashboard data'); // error state is not defined in this component
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh dashboard data (can be called from other components)
  const refreshDashboardData = () => {
    fetchDashboardData();
  };

  // Expose refresh function globally for other components to use
  useEffect(() => {
    (window as any).refreshDashboardData = refreshDashboardData;
    
    // Cleanup function to remove global reference
    return () => {
      delete (window as any).refreshDashboardData;
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh dashboard data when the component becomes visible (user returns to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Dashboard visible - refreshing data');
        fetchDashboardData();
      }
    };

    const handleFocus = () => {
      console.log('🔄 Window focused - refreshing dashboard data');
      fetchDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Also refresh when user object changes (indicating auth state change)
  useEffect(() => {
    if (user && user.id) {
      console.log('🔄 User changed - refreshing dashboard data');
      fetchDashboardData();
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-950 dark:via-accent-950 dark:to-primary-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-12 bg-white/20 dark:bg-primary-800/20 rounded-2xl animate-pulse w-80 mx-auto"></div>
            <div className="h-6 bg-white/20 dark:bg-primary-800/20 rounded-xl animate-pulse w-96 mx-auto"></div>
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group p-6 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/30 dark:bg-primary-700/30 rounded-2xl"></div>
                  <div className="w-16 h-4 bg-white/30 dark:bg-primary-700/30 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-white/30 dark:bg-primary-700/30 rounded-xl w-20"></div>
                  <div className="h-4 bg-white/30 dark:bg-primary-700/30 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Activity Skeleton */}
          <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-8">
            <div className="h-8 bg-white/30 dark:bg-primary-700/30 rounded-xl w-48 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white/20 dark:bg-primary-700/20 rounded-2xl animate-pulse">
                  <div className="w-10 h-10 bg-white/30 dark:bg-primary-600/30 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/30 dark:bg-primary-600/30 rounded w-3/4"></div>
                    <div className="h-3 bg-white/30 dark:bg-primary-600/30 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900">

      
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-800 dark:text-primary-200 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-lg text-primary-600 dark:text-primary-400">
              Here's what's happening with your SEO campaigns today
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 rounded-xl text-primary-700 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 transition-all duration-300"
              aria-label="Refresh dashboard data"
              title="Refresh dashboard data"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Total Projects',
              value: stats.totalProjects,
              icon: <Target className="w-6 h-6" />,
              color: 'from-blue-500 to-blue-600',
              change: deltas.totalProjects.direction === 'stable' ? '0%' : `${deltas.totalProjects.direction === 'increase' ? '+' : '-'}${deltas.totalProjects.delta.toFixed(1)}%`,
              changeType: deltas.totalProjects.direction
            },
            {
              title: 'Submissions',
              value: stats.totalSubmissions,
              icon: <Globe className="w-6 h-6" />,
              color: 'from-green-500 to-green-600',
              change: deltas.totalSubmissions.direction === 'stable' ? '0%' : `${deltas.totalSubmissions.direction === 'increase' ? '+' : '-'}${deltas.totalSubmissions.delta.toFixed(1)}%`,
              changeType: deltas.totalSubmissions.direction
            },
            {
              title: 'Success Rate',
              value: `${stats.successRate}%`,
              icon: <CheckCircle className="w-6 h-6" />,
              color: 'from-success-500 to-success-600',
              change: deltas.successRate.direction === 'stable' ? '0%' : `${deltas.successRate.direction === 'increase' ? '+' : '-'}${deltas.successRate.delta.toFixed(1)}%`,
              changeType: deltas.successRate.direction
            },
            {
              title: 'Backlinks Gained',
              value: stats.backlinksGained,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'from-purple-500 to-purple-600',
              change: deltas.backlinksGained.direction === 'stable' ? '0%' : `${deltas.backlinksGained.direction === 'increase' ? '+' : '-'}${deltas.backlinksGained.delta.toFixed(1)}%`,
              changeType: deltas.backlinksGained.direction
            },
            {
              title: 'Directories Submitted',
              value: stats.directoriesSubmitted,
              icon: <FileText className="w-6 h-6" />,
              color: 'from-orange-500 to-orange-600',
              change: deltas.directoriesSubmitted.direction === 'stable' ? '0%' : `${deltas.directoriesSubmitted.direction === 'increase' ? '+' : '-'}${deltas.directoriesSubmitted.delta.toFixed(1)}%`,
              changeType: deltas.directoriesSubmitted.direction
            },
            {
              title: 'Average Ranking',
              value: `#${stats.averageRanking}`,
              icon: <BarChart3 className="w-6 h-6" />,
              color: 'from-red-500 to-red-600',
              change: deltas.averageRanking.direction === 'stable' ? '0%' : `${deltas.averageRanking.direction === 'increase' ? '+' : '-'}${deltas.averageRanking.delta.toFixed(1)}%`,
              changeType: deltas.averageRanking.direction
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="group p-6 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 hover:shadow-glass-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-glow group-hover:shadow-glow-lg transition-all duration-300`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-success-600 dark:text-success-400' : 
                  stat.changeType === 'decrease' ? 'text-error-600 dark:text-error-400' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : stat.changeType === 'decrease' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-primary-800 dark:text-primary-200">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-600 dark:text-primary-400">
                  {stat.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white backdrop-blur-lg rounded-3xl shadow-glass border-4 border-yellow-400 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>

            {/* Trial Status Banner for Free Users */}
            {subscription.subscription === 'free' && (
              <div className={`mb-6 p-4 rounded-xl border ${
                subscription.isInTrial 
                  ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {subscription.isInTrial ? (
                      <Clock className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Crown className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${
                        subscription.isInTrial ? 'text-orange-900' : 'text-red-900'
                      }`}>
                        {subscription.isInTrial ? '🎉 Free Trial Active' : '⏰ Free Trial Expired'}
                      </h4>
                      <p className={`text-sm ${
                        subscription.isInTrial ? 'text-orange-700' : 'text-red-700'
                      }`}>
                        {subscription.isInTrial 
                          ? `Your trial ends on ${subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'soon'}.`
                          : 'Your free trial has expired. Upgrade to continue using all features.'
                        }
                        {subscription.trialDaysLeft !== undefined && subscription.trialDaysLeft > 0 && (
                          <span className="block mt-1 font-medium">
                            {subscription.trialDaysLeft} day{subscription.trialDaysLeft !== 1 ? 's' : ''} remaining
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.hash = 'pricing'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      subscription.isInTrial 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {subscription.isInTrial ? 'Upgrade Now' : 'Upgrade to Continue'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-glow">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Subscription Status</h3>
                  <p className="text-sm text-white/80">Your current plan and usage</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white capitalize">
                  {subscription.subscription === 'free' ? 'Free Trial (3 Days)' : subscription.subscription}
                </div>
                <div className="text-sm text-green-300 font-medium">
                  {subscription.status}
                </div>
                {subscription.nextBillingDate && (
                  <div className="text-xs text-white/60">
                    Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Submissions Used</span>
                  <span className="text-sm font-semibold text-white">
                    {subscription.currentUsage?.submissionsUsed || 0} / {subscription.limits?.submissions === -1 ? 'Unlimited' : subscription.limits?.submissions || 5}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subscription.limits?.submissions === -1 ? 0 : Math.min((subscription.currentUsage?.submissionsUsed || 0) / (subscription.limits?.submissions || 5) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Projects Used</span>
                  <span className="text-sm font-semibold text-white">
                    {subscription.currentUsage?.projectsUsed || 0} / {subscription.limits?.projects === -1 ? 'Unlimited' : subscription.limits?.projects || 2}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subscription.limits?.projects === -1 ? 0 : Math.min((subscription.currentUsage?.projectsUsed || 0) / (subscription.limits?.projects || 2) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">SEO Tools Used</span>
                  <span className="text-sm font-semibold text-white">
                    {subscription.currentUsage?.seoToolsUsed || 0} / {subscription.limits?.tools === -1 ? 'Unlimited' : subscription.limits?.tools || 10}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subscription.limits?.tools === -1 ? 0 : Math.min((subscription.currentUsage?.seoToolsUsed || 0) / (subscription.limits?.tools || 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>


              
              {subscription.nextBillingDate && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Next Billing</span>
                    <span className="text-sm font-semibold text-white">
                      {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, 100 - ((new Date(subscription.nextBillingDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary-200 dark:border-primary-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Plan Features</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• {subscription.subscription === 'business' ? 'Unlimited' : subscription.subscription === 'pro' ? '750' : subscription.subscription === 'starter' ? '150' : '5'} submissions per month</li>
                    <li>• {subscription.subscription === 'business' ? 'Unlimited' : subscription.subscription === 'pro' ? '15' : subscription.subscription === 'starter' ? '5' : '2'} projects</li>
                    <li>• {subscription.subscription === 'free' ? 'Limited' : 'Advanced'} analytics</li>
                    <li>• {subscription.subscription === 'free' ? 'Community' : 'Priority'} support</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-colors">
                      • Upgrade Plan
                    </button>
                    <button className="w-full text-left text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-colors">
                      • View Billing History
                    </button>
                    <button className="w-full text-left text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-colors">
                      • Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        <div className="bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/30 dark:to-primary-900/30 backdrop-blur-lg rounded-3xl shadow-glass border border-accent-200 dark:border-accent-700/30 p-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Upgrade Your Plan</h3>
                  <p className="text-primary-600 dark:text-primary-400">Unlock unlimited submissions, advanced analytics, and priority support</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-100 dark:bg-success-900/50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                  </div>
                  <span className="text-sm text-primary-700 dark:text-primary-300">Unlimited Submissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-100 dark:bg-success-900/50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                  </div>
                  <span className="text-sm text-primary-700 dark:text-primary-300">Advanced Analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-100 dark:bg-success-900/50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                  </div>
                  <span className="text-sm text-primary-700 dark:text-primary-300">Priority Support</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-800 dark:text-primary-200">
                  {subscription?.subscription === 'free' ? 'Free' : 
                   subscription?.subscription === 'starter' ? 'Starter' :
                   subscription?.subscription === 'pro' ? 'Pro' : 'Business'}
                </div>
                <div className="text-sm text-primary-600 dark:text-primary-400">Current Plan</div>
              </div>
              
              <button 
                onClick={() => window.location.hash = 'pricing'}
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-3 rounded-xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105"
                aria-label="View all subscription plans"
                title="View all subscription plans"
              >
                View All Plans
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200">Recent Activity</h3>
                <button className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400' :
                      activity.status === 'error' ? 'bg-error-100 dark:bg-error-900/50 text-error-600 dark:text-error-400' :
                      'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400'
                    }`}>
                      {activity.type === 'submission' && <Globe className="w-4 h-4" />}
                      {activity.type === 'project' && <Target className="w-4 h-4" />}
                      {activity.type === 'analysis' && <BarChart3 className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                        {activity.message}
                      </p>
                      <p className="text-xs text-primary-500 dark:text-primary-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Create New Project', icon: <Plus className="w-4 h-4" />, color: 'from-blue-500 to-blue-600', action: () => window.location.hash = 'projects' },
                  { label: 'Start Submission', icon: <Globe className="w-4 h-4" />, color: 'from-green-500 to-green-600', action: () => window.location.hash = 'directory' },
                  { label: 'Run SEO Analysis', icon: <BarChart3 className="w-4 h-4" />, color: 'from-purple-500 to-purple-600', action: () => window.location.hash = 'tools' },
                  { label: 'View Reports', icon: <FileText className="w-4 h-4" />, color: 'from-orange-500 to-orange-600', action: () => window.location.hash = 'reports' }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900 transition-all duration-200 group"
                    aria-label={action.label}
                    title={action.label}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white shadow-glow group-hover:shadow-glow-lg transition-all duration-300`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300 group-hover:text-primary-800 dark:group-hover:text-primary-200">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/30 dark:to-primary-900/30 backdrop-blur-lg rounded-3xl shadow-glass border border-accent-200 dark:border-accent-700/30 p-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200">Pro Tip</h3>
              </div>
              
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
                Regular directory submissions can improve your search rankings by up to 40%. Consider upgrading to our Pro plan for unlimited submissions and advanced analytics.
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-primary-500 dark:text-primary-400">
                <Clock className="w-3 h-3" />
                <span>Updated 2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}