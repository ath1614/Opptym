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
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // Fetch data in parallel for better performance
      const [projectsResponse, submissionsResponse] = await Promise.all([
        axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => {
          console.error('Error fetching projects:', error);
          return { data: [] };
        }),
        axios.get('/api/submissions', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => {
          console.error('Error fetching submissions:', error);
          return { data: [] };
        })
      ]);

      const projects = projectsResponse.data || [];
      const submissions = submissionsResponse.data || [];

      // Fetch subscription details with real usage tracking
      try {
        const subscriptionResponse = await axios.get('/api/subscription/details', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('📊 Dashboard subscription response:', subscriptionResponse.data);
        setSubscription(subscriptionResponse.data);
      } catch (error) {
        console.error('❌ Error fetching subscription details:', error);
        
        // Fallback subscription data
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
        
        const limits = getPlanLimits(user?.subscription || 'free');
        
        setSubscription({
          subscription: user?.subscription || 'free',
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          currentUsage: {
            submissionsMade: submissions.length,
            projectsCreated: projects.length,
            seoToolsUsed: 0,
            apiCallsUsed: 0
          },
          limits: limits,
          isInTrial: user?.subscription === 'free',
          trialDaysLeft: user?.subscription === 'free' ? 3 : 0
        });
      }

      // Calculate real stats from actual data
      const successfulSubmissions = submissions.filter((s: any) => s.status === 'success' || s.status === 'completed');
      const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending' || s.status === 'processing');
      const failedSubmissions = submissions.filter((s: any) => s.status === 'failed' || s.status === 'error');
      
      const calculatedStats: DashboardStats = {
        totalProjects: projects.length,
        totalSubmissions: submissions.length,
        successRate: submissions.length > 0 ? Math.round((successfulSubmissions.length / submissions.length) * 100) : 0,
        averageRanking: successfulSubmissions.length > 0 ? Math.round(successfulSubmissions.reduce((acc: number, s: any) => acc + (s.ranking || 0), 0) / successfulSubmissions.length) : 0,
        backlinksGained: successfulSubmissions.length,
        directoriesSubmitted: submissions.length
      };

      setStats(calculatedStats);
      
      // Generate real recent activity from actual data
      const realActivity = [];
      
      // Add recent submissions
      submissions.slice(0, 3).forEach((submission: any, index: number) => {
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
      
      // Add recent projects
      projects.slice(0, 2).forEach((project: any, index: number) => {
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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-950 dark:via-accent-950 dark:to-primary-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-accent-600" aria-hidden="true" />
              <span className="text-lg text-primary-700 dark:text-primary-300">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-950 dark:via-accent-950 dark:to-primary-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
              Welcome back, {user?.username || user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-primary-600 dark:text-primary-400 mt-2">
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
              change: '+12%',
              changeType: 'increase'
            },
            {
              title: 'Submissions',
              value: stats.totalSubmissions,
              icon: <Globe className="w-6 h-6" />,
              color: 'from-green-500 to-green-600',
              change: '+8%',
              changeType: 'increase'
            },
            {
              title: 'Success Rate',
              value: `${stats.successRate}%`,
              icon: <CheckCircle className="w-6 h-6" />,
              color: 'from-success-500 to-success-600',
              change: '+5%',
              changeType: 'increase'
            },
            {
              title: 'Backlinks Gained',
              value: stats.backlinksGained,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'from-purple-500 to-purple-600',
              change: '+23%',
              changeType: 'increase'
            },
            {
              title: 'Directories Submitted',
              value: stats.directoriesSubmitted,
              icon: <FileText className="w-6 h-6" />,
              color: 'from-orange-500 to-orange-600',
              change: '+15%',
              changeType: 'increase'
            },
            {
              title: 'Average Ranking',
              value: `#${stats.averageRanking}`,
              icon: <BarChart3 className="w-6 h-6" />,
              color: 'from-red-500 to-red-600',
              change: '-3%',
              changeType: 'decrease'
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
                  stat.changeType === 'increase' ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
                }`}>
                  <ArrowUpRight className="w-4 h-4" />
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
          <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200">Subscription Status</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400">Your current plan and usage</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-800 dark:text-primary-200 capitalize">
                  {subscription.subscription === 'free' ? 'Free Trial (3 Days)' : subscription.subscription}
                </div>
                <div className="text-sm text-success-600 dark:text-success-400 font-medium">
                  {subscription.status}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600 dark:text-primary-400">Submissions Used</span>
                  <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                    {subscription.currentUsage?.submissionsMade || 0} / {subscription.limits?.submissions || 100}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subscription.currentUsage?.submissionsMade || 0) / (subscription.limits?.submissions || 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
                                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary-600 dark:text-primary-400">Projects Used</span>
                      <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                        {subscription.currentUsage?.projectsCreated || 0} / {subscription.limits?.projects || 50}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((subscription.currentUsage?.projectsCreated || 0) / (subscription.limits?.projects || 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600 dark:text-primary-400">Next Billing</span>
                  <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, 100 - ((new Date(subscription.nextBillingDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100)}%` }}
                  ></div>
                </div>
              </div>
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