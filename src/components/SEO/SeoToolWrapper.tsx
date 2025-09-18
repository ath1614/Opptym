import React, { useState } from 'react';
import { useSeoToolLimits } from '../../hooks/useSeoToolLimits';
import SeoToolUpgradeModal from '../Common/SeoToolUpgradeModal';
import { Lock, AlertTriangle } from 'lucide-react';

interface SeoToolWrapperProps {
  children: React.ReactNode;
  toolName: string;
  onRunTool: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SeoToolWrapper: React.FC<SeoToolWrapperProps> = ({
  children,
  toolName,
  onRunTool,
  loading = false,
  disabled = false
}) => {
  const { limits, canUseSeoTools, isLimitReached, remainingUses, refetch } = useSeoToolLimits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleRunTool = async () => {
    if (!canUseSeoTools || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      await onRunTool();
      // Refetch limits after successful tool run
      await refetch();
    } catch (error: any) {
      // If it's a usage limit error, show upgrade modal
      if (error.response?.status === 429 || error.response?.status === 403) {
        setShowUpgradeModal(true);
      }
      // Re-throw other errors
      throw error;
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    window.location.hash = '#pricing';
  };

  // Separate UI disabled state from limit-based disabled state
  const isLimitDisabled = !canUseSeoTools || isLimitReached;
  const isToolDisabled = isLimitDisabled || disabled || loading;

  // Debug logging
  console.log('🔍 SeoToolWrapper Debug:', {
    canUseSeoTools,
    isLimitReached,
    disabled,
    loading,
    isLimitDisabled,
    isToolDisabled,
    limits
  });

  return (
    <div className="space-y-6">
      {/* Usage Warning Banner */}
      {limits && isLimitDisabled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {limits.trialExpired ? 'Trial Expired' : 'SEO Tool Limit Reached'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {limits.trialExpired 
                  ? 'Your free trial has expired. Upgrade to continue using SEO tools.'
                  : `You've used all ${limits.tools} SEO tools. Upgrade for unlimited access.`
                }
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Usage Info */}
      {limits && canUseSeoTools && !isLimitReached && !disabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                SEO Tools Usage
              </span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {limits.seoToolsUsed} / {limits.tools} used
              {remainingUses > 0 && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  ({remainingUses} remaining)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tool Content with Disabled Overlay */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          onRunTool: handleRunTool,
          loading: loading,
          disabled: isToolDisabled
        })}
        
        {/* Disabled Overlay - Only show for limit-related issues */}
        {isLimitDisabled && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {limits?.trialExpired ? 'Trial Expired' : 'Limit Reached'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {limits?.trialExpired 
                  ? 'Your free trial has expired. Upgrade to continue using SEO tools.'
                  : `You've reached your SEO tool limit. Upgrade for unlimited access.`
                }
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Lock className="w-4 h-4" />
                <span>Upgrade to Continue</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <SeoToolUpgradeModal
        isOpen={showUpgradeModal}
        onUpgrade={handleUpgrade}
        currentUsage={limits?.seoToolsUsed || 0}
        limit={limits?.tools || 5}
        subscription={limits?.subscription || 'free'}
        isInTrial={limits?.isInTrial || false}
        trialDaysLeft={limits?.trialDaysLeft || 0}
        trialExpired={limits?.trialExpired || false}
      />
    </div>
  );
};

export default SeoToolWrapper;
