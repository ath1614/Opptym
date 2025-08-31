import React from 'react';
import { Crown, AlertTriangle, X, ArrowRight, Clock, Zap } from 'lucide-react';

interface TrialExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'trial_expired' | 'subscription_expired' | 'trial_ending';
  daysLeft?: number;
  subscription?: string;
}

const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({
  isOpen,
  onClose,
  type,
  daysLeft = 0,
  subscription = 'free'
}) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'trial_expired':
        return {
          title: 'Trial Expired',
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          message: 'Your free trial has expired. Upgrade to continue using Opptym features.',
          actionText: 'Upgrade Now',
          actionUrl: '/pricing',
          color: 'red'
        };
      case 'subscription_expired':
        return {
          title: 'Subscription Expired',
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          message: `Your ${subscription} subscription has expired. Renew to continue accessing all features.`,
          actionText: 'Renew Subscription',
          actionUrl: '/pricing',
          color: 'red'
        };
      case 'trial_ending':
        return {
          title: 'Trial Ending Soon',
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          message: `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Upgrade to continue using all features.`,
          actionText: 'Upgrade Now',
          actionUrl: '/pricing',
          color: 'yellow'
        };
      default:
        return {
          title: 'Upgrade Required',
          icon: <Crown className="w-8 h-8 text-purple-500" />,
          message: 'Upgrade your plan to access this feature.',
          actionText: 'View Plans',
          actionUrl: '/pricing',
          color: 'purple'
        };
    }
  };

  const content = getModalContent();

  const handleUpgrade = () => {
    window.location.href = content.actionUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon and Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {content.message}
          </p>
        </div>

        {/* Features that will be disabled */}
        {type === 'trial_expired' && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Features that will be disabled:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                SEO Tools access
              </li>
              <li className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                Directory submissions
              </li>
              <li className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                Project creation
              </li>
              <li className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                Analytics dashboard
              </li>
            </ul>
          </div>
        )}

        {/* Upgrade benefits */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Crown className="w-4 h-4 text-yellow-500 mr-2" />
            Upgrade Benefits:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              Unlimited SEO tools
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              Higher submission limits
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              Priority support
            </li>
            <li className="flex items-center">
              <Zap className="w-4 h-4 text-green-500 mr-2" />
              Advanced analytics
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
          >
            {content.actionText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpirationModal;
