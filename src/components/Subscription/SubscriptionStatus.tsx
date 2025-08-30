import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Star, 
  Gift, 
  Users, 
  Globe, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionDetails {
  subscription: string;
  status: string;
  limits: {
    projects: number;
    submissions: number;
    tools: number;
    teamMembers: number;
  };
  currentUsage: {
    projectsCreated: number;
    submissionsMade: number;
    apiCallsUsed: number;
    seoToolsUsed: number;
  };
  canUpgrade: boolean;
  nextBillingDate?: string;
  trialEndDate?: string;
  isInTrial?: boolean;
  trialDaysLeft?: number;
  trialExpired?: boolean;
}

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch subscription details if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchSubscriptionDetails();
    } else {
      setLoading(false);
      // Don't set any errors - just be silent
    }
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return; // Silent fail - don't set error
      }

      const response = await axios.get('/api/subscription/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setSubscription(response.data);
        setError(null);
      }
      // Silent fail for any other case
    } catch (error: any) {
      console.error('Error fetching subscription details:', error);
      // Silent fail - don't set any errors
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-600" />;
      case 'business':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'pro':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'starter':
        return <Star className="w-6 h-6 text-green-600" />;
      case 'free':
        return <Gift className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
      default:
        return <Gift className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'from-purple-500 to-pink-500';
      case 'business':
        return 'from-yellow-400 to-orange-500';
      case 'pro':
        return 'from-blue-500 to-purple-600';
      case 'starter':
        return 'from-green-400 to-blue-500';
      case 'free':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'Enterprise';
      case 'business':
        return 'Business';
      case 'pro':
        return 'Pro';
      case 'starter':
        return 'Starter';
      case 'free':
        return 'Free Trial (3 Days)';
      default:
        return 'Free Trial (3 Days)';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No access
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    // Don't show loading state - just return null
    return null;
  }

  if (!subscription) {
    // Don't show anything if there's an error or no subscription data
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className={`bg-gradient-to-r ${getPlanColor(subscription.subscription)} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPlanIcon(subscription.subscription)}
            <div>
              <h3 className="text-xl font-bold">{getPlanName(subscription.subscription)} Plan</h3>
              <p className="text-sm opacity-90">
                {subscription.status === 'active' ? 'Active' : subscription.status}
                {subscription.nextBillingDate && ` • Next billing: ${new Date(subscription.nextBillingDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            {subscription.status === 'active' ? (
              <CheckCircle className="w-6 h-6 text-green-300" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            )}
          </div>
        </div>
      </div>

      {/* Trial Status Banner for Free Users */}
      {subscription.subscription === 'free' && (
        <div className={`bg-gradient-to-r ${subscription.isInTrial ? 'from-orange-50 to-yellow-50 border-orange-200' : 'from-red-50 to-pink-50 border-red-200'} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {subscription.isInTrial ? (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div className="flex-1">
                <h4 className={`text-lg font-bold mb-2 ${subscription.isInTrial ? 'text-orange-900' : 'text-red-900'}`}>
                  {subscription.isInTrial ? '🎉 Free Trial Active' : '⏰ Free Trial Expired'}
                </h4>
                <p className={`text-sm ${subscription.isInTrial ? 'text-orange-700' : 'text-red-700'} mb-2`}>
                  {subscription.isInTrial 
                    ? `Your trial ends on ${subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'soon'}.`
                    : 'Your free trial has expired. Upgrade to continue using all Opptym features.'
                  }
                </p>
                {subscription.trialDaysLeft !== undefined && subscription.trialDaysLeft > 0 && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${subscription.trialDaysLeft <= 1 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                    <span className="mr-1">⏰</span>
                    {subscription.trialDaysLeft} day{subscription.trialDaysLeft !== 1 ? 's' : ''} remaining
                  </div>
                )}
                {subscription.trialExpired && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                    <span className="mr-1">❌</span>
                    Trial Expired
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => window.location.hash = 'pricing'}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects */}
        <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subscription.currentUsage.projectsCreated} / {subscription.limits.projects === -1 ? '∞' : subscription.limits.projects}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.currentUsage.projectsCreated, subscription.limits.projects))}`}
              style={{ width: `${getUsagePercentage(subscription.currentUsage.projectsCreated, subscription.limits.projects)}%` }}
            ></div>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submissions</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subscription.currentUsage.submissionsMade} / {subscription.limits.submissions === -1 ? '∞' : subscription.limits.submissions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.currentUsage.submissionsMade, subscription.limits.submissions))}`}
              style={{ width: `${getUsagePercentage(subscription.currentUsage.submissionsMade, subscription.limits.submissions)}%` }}
            ></div>
          </div>
        </div>

        {/* SEO Tools */}
        <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO Tools</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subscription.currentUsage.seoToolsUsed} / {subscription.limits.tools === -1 ? '∞' : subscription.limits.tools}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.currentUsage.seoToolsUsed, subscription.limits.tools))}`}
              style={{ width: `${getUsagePercentage(subscription.currentUsage.seoToolsUsed, subscription.limits.tools)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subscription.limits.tools === -1 ? 'Unlimited' : `${subscription.limits.tools} uses per month`}
          </p>
        </div>

        {/* Team Members */}
        <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subscription.limits.teamMembers === -1 ? '∞' : subscription.limits.teamMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${subscription.limits.teamMembers > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
              style={{ width: subscription.limits.teamMembers > 0 ? '100%' : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subscription.limits.teamMembers > 0 ? 'Available' : 'Not available'}
          </p>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">SEO Tools Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Project Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Directory Submissions</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {subscription.subscription === 'free' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              {['pro', 'business', 'enterprise'].includes(subscription.subscription) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">Team Management</span>
            </div>
            <div className="flex items-center space-x-2">
              {['business', 'enterprise'].includes(subscription.subscription) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">API Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {subscription.canUpgrade && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready to upgrade?</h4>
              <p className="text-blue-700">Get more features, higher limits, and better support with our premium plans.</p>
            </div>
            <button
              onClick={() => window.location.hash = 'pricing'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              View Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus; 