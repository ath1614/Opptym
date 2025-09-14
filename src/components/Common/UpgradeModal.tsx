import React from 'react';
import { X, Crown, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { showPopup } from '../../utils/popup';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockoutReason?: 'trial_expired' | 'trial_limits_reached';
  message?: string;
  trialUsage?: {
    seoToolsUsed: number;
    projectsUsed: number;
    submissionsUsed: number;
  };
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  lockoutReason,
  message,
  trialUsage
}) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Redirect to pricing page
    window.location.href = '/pricing';
  };

  const getTitle = () => {
    if (lockoutReason === 'trial_expired') {
      return 'Trial Expired - Upgrade to Continue';
    }
    return 'Trial Limits Reached - Upgrade to Unlock All Features';
  };

  const getSubtitle = () => {
    if (lockoutReason === 'trial_expired') {
      return 'Your 3-day trial has ended. Upgrade now to continue using OPPTYM and unlock unlimited features.';
    }
    return 'You\'ve reached your trial limits. Upgrade to unlock unlimited access to all features.';
  };

  const getUsageStats = () => {
    if (!trialUsage) return null;
    
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Your Trial Usage</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trialUsage.seoToolsUsed}/5
            </div>
            <div className="text-gray-600 dark:text-gray-400">SEO Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {trialUsage.projectsUsed}/3
            </div>
            <div className="text-gray-600 dark:text-gray-400">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {trialUsage.submissionsUsed}/5
            </div>
            <div className="text-gray-600 dark:text-gray-400">Submissions</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {getUsageStats()}

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What you'll get with a paid plan:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Unlimited SEO tool usage
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Unlimited project creation
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Unlimited directory submissions
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Advanced analytics and reporting
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Priority customer support
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Start with Starter Plan
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  5 projects • 150 submissions • All SEO tools
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $29<span className="text-sm font-normal">/month</span>
                </div>
                <div className="text-xs text-gray-500">Cancel anytime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            No hidden fees • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
