import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Lock, AlertTriangle, X } from 'lucide-react';

interface LimitGateProps {
  isLimited: boolean;
  currentUsage: number;
  limit: number;
  feature: string;
  onUpgrade: () => void;
  children: React.ReactNode;
  showUpgradeModal?: boolean;
  onCloseUpgradeModal?: () => void;
  autoShowModal?: boolean; // New prop to auto-show modal when limit is hit
  disableButton?: boolean; // New prop to disable the button when limited
}

export default function LimitGate({
  isLimited,
  currentUsage,
  limit,
  feature,
  onUpgrade,
  children,
  showUpgradeModal = false,
  onCloseUpgradeModal,
  autoShowModal = false,
  disableButton = false
}: LimitGateProps) {
  const { t } = useTranslation();

  // Auto-show modal when component mounts and user is limited
  useEffect(() => {
    if (isLimited && autoShowModal && !showUpgradeModal) {
      // Show modal after a short delay to ensure proper rendering
      const timer = setTimeout(() => {
        if (onCloseUpgradeModal) {
          // This will trigger the parent to show the modal
          onUpgrade();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLimited, autoShowModal, showUpgradeModal, onUpgrade, onCloseUpgradeModal]);

  // If limited and disableButton is true, render disabled version
  if (isLimited && disableButton) {
    return (
      <>
        {/* Disabled button */}
        <div className="relative">
          <div className="opacity-50 cursor-not-allowed">
            {children}
          </div>
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 opacity-30 rounded-lg"></div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center relative">
              {/* Close button */}
              <button
                onClick={onCloseUpgradeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <Crown className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('landing.limits.upgradeTitle')}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('landing.limits.upgradeMessage', { 
                  feature: t(`landing.limits.features.${feature}`)
                })}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {t(`landing.limits.features.${feature}`)}
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {currentUsage}/{limit} (LIMIT REACHED)
                  </span>
                </div>
                
                {/* Benefits of upgrading */}
                <div className="text-left space-y-2 mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Upgrade to unlock:</h4>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="text-sm">More {t(`landing.limits.features.${feature}`)}</span>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="text-sm">Advanced Analytics</span>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="text-sm">Priority Support</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onUpgrade}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>{t('landing.limits.upgradeNow')}</span>
                </button>
                <button
                  onClick={onCloseUpgradeModal}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // If limited but not disabling button, show warning banner
  if (isLimited) {
    return (
      <>
        {/* Warning banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {t('landing.limits.upgradeRequired', { feature: t(`landing.limits.features.${feature}`) })}
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                {t('landing.limits.usageExceeded', { 
                  feature: t(`landing.limits.features.${feature}`),
                  current: currentUsage,
                  limit: limit 
                })}
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>{t('landing.limits.upgradeNow')}</span>
                </button>
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  {t('landing.limits.currentUsage', { current: currentUsage, limit: limit })}
                </div>
              </div>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Not limited - render children normally
  return <>{children}</>;
}
