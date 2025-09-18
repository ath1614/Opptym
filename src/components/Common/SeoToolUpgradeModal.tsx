import React from 'react';
import { Crown, X, Zap, BarChart3, Target, TrendingUp } from 'lucide-react';

interface SeoToolUpgradeModalProps {
  isOpen: boolean;
  onUpgrade: () => void;
  currentUsage: number;
  limit: number;
  subscription: string;
  isInTrial: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
}

const SeoToolUpgradeModal: React.FC<SeoToolUpgradeModalProps> = ({
  isOpen,
  onUpgrade,
  currentUsage,
  limit,
  subscription,
  isInTrial,
  trialDaysLeft,
  trialExpired
}) => {
  if (!isOpen) return null;

  const getUpgradeMessage = () => {
    if (trialExpired) {
      return "Your free trial has expired. Upgrade now to continue using SEO tools.";
    }
    if (isInTrial) {
      return `You've used all ${limit} SEO tools in your free trial. Upgrade to continue analyzing your website.`;
    }
    return `You've reached your SEO tool limit (${currentUsage}/${limit}). Upgrade for unlimited access.`;
  };

  const getBenefits = () => {
    const baseBenefits = [
      {
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        title: "Unlimited SEO Tools",
        description: "Run all SEO tools without restrictions"
      },
      {
        icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
        title: "Advanced Analytics",
        description: "Get detailed insights and reports"
      },
      {
        icon: <Target className="w-5 h-5 text-green-500" />,
        title: "Priority Support",
        description: "Get help when you need it most"
      }
    ];

    if (subscription === 'free') {
      baseBenefits.push({
        icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
        title: "More Projects & Submissions",
        description: "Create unlimited projects and submissions"
      });
    }

    return baseBenefits;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center relative">
        {/* No close button - modal is non-dismissible */}
        
        <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
          <Crown className="w-12 h-12" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {trialExpired ? 'Trial Expired' : 'SEO Tool Limit Reached'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          {getUpgradeMessage()}
        </p>
        
        {/* Usage Stats */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8 border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">SEO Tools Used</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trialExpired ? 'Trial expired' : `${currentUsage} of ${limit} tools used`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {trialExpired ? 'EXPIRED' : 'LIMIT REACHED'}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {getBenefits().map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex-shrink-0 mt-1">
                {benefit.icon}
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {benefit.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Upgrade Button */}
        <div className="space-y-4">
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
          >
            <Crown className="w-6 h-6" />
            <span>Upgrade Now - Unlock All Features</span>
          </button>
          
          {isInTrial && !trialExpired && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {trialDaysLeft} days left in your free trial
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoToolUpgradeModal;
