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
    tools: boolean;
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
      setError('Please log in to view subscription details');
    }
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/subscription/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setSubscription(response.data);
        setError(null);
      } else {
        setError('Failed to fetch subscription details');
      }
    } catch (error: any) {
      console.error('Error fetching subscription details:', error);
      if (error.response?.status === 401) {
        setError('Please log in to view subscription details');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch subscription details');
      }
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
        return <Gift className="w-6 h-6 text-gray-600" />;
      default:
        return <Gift className="w-6 h-6 text-gray-600" />;
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
        return 'Free Trial';
      default:
        return 'Free Trial';
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
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800">
            {error || 'Please log in to view subscription details'}
          </span>
        </div>
      </div>
    );
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

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Projects</span>
            </div>
            <span className="text-xs text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Submissions</span>
            </div>
            <span className="text-xs text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">SEO Tools</span>
            </div>
            <span className="text-xs text-gray-500">
              {subscription.currentUsage.seoToolsUsed} used
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${subscription.limits.tools ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: subscription.limits.tools ? '100%' : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {subscription.limits.tools ? 'Available' : 'Not available'}
          </p>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Team Members</span>
            </div>
            <span className="text-xs text-gray-500">
              {subscription.limits.teamMembers === -1 ? '∞' : subscription.limits.teamMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${subscription.limits.teamMembers > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
              style={{ width: subscription.limits.teamMembers > 0 ? '100%' : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {subscription.limits.teamMembers > 0 ? 'Available' : 'Not available'}
          </p>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">SEO Tools Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Project Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Directory Submissions</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {subscription.subscription === 'free' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm text-gray-700">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              {['pro', 'business', 'enterprise'].includes(subscription.subscription) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700">Team Management</span>
            </div>
            <div className="flex items-center space-x-2">
              {['business', 'enterprise'].includes(subscription.subscription) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700">API Access</span>
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