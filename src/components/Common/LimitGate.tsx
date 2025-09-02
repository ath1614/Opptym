import React from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Lock, AlertTriangle } from 'lucide-react';

interface LimitGateProps {
  isLimited: boolean;
  currentUsage: number;
  limit: number;
  feature: string;
  onUpgrade: () => void;
  children: React.ReactNode;
  showUpgradeModal?: boolean;
  onCloseUpgradeModal?: () => void;
}

export default function LimitGate({
  isLimited,
  currentUsage,
  limit,
  feature,
  onUpgrade,
  children,
  showUpgradeModal = false,
  onCloseUpgradeModal
}: LimitGateProps) {
  const { t } = useTranslation();

  if (!isLimited) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Locked State - Show upgrade banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              {t('limits.upgradeRequired', { feature: t(`limits.features.${feature}`) })}
            </h3>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              {t('limits.usageExceeded', { 
                feature: t(`limits.features.${feature}`),
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
                <span>{t('limits.upgradeNow')}</span>
              </button>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                {t('limits.currentUsage', { current: currentUsage, limit: limit })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
              <Crown className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('limits.upgradeTitle')}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('limits.upgradeMessage', { 
                feature: t(`limits.features.${feature}`),
                current: currentUsage,
                limit: limit 
              })}
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">
                  {t(`limits.features.${feature}`)}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentUsage}/{limit}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
              >
                {t('limits.upgradeNow')}
              </button>
              <button
                onClick={onCloseUpgradeModal}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
