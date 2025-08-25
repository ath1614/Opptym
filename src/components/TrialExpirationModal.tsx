import React, { useState, useEffect } from 'react';
import { X, Crown, Star, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TrialExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => onClose(), 300);
  };

  const plans = [
    {
      name: 'Starter',
      price: '$9.99',
      period: 'month',
      features: ['100 Submissions/month', '10 Projects', 'Priority Support', 'Advanced Analytics'],
      popular: false,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Pro',
      price: '$39.99',
      period: 'month',
      features: ['500 Submissions/month', '25 Projects', '24/7 Support', 'White-label Reports'],
      popular: true,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Business',
      price: '$89.99',
      period: 'month',
      features: ['1000 Submissions/month', '50 Projects', 'Dedicated Support', 'API Access'],
      popular: false,
      color: 'from-green-500 to-green-600'
    }
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-primary-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-200 dark:border-primary-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200">
                Free Trial Expired
              </h2>
              <p className="text-primary-600 dark:text-primary-400">
                Upgrade to continue using Opptym features
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-2">
              Your 3-day free trial has ended
            </h3>
            <p className="text-primary-600 dark:text-primary-400 max-w-2xl mx-auto">
              You've experienced the power of Opptym's AI-powered SEO automation. 
              Choose a plan that fits your needs and continue growing your online presence.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' 
                    : 'border-primary-200 dark:border-primary-700 hover:border-accent-300 dark:hover:border-accent-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-primary-800 dark:text-primary-200 mb-2">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold text-primary-800 dark:text-primary-200">
                      {plan.price}
                    </span>
                    <span className="text-primary-600 dark:text-primary-400">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3 text-sm text-primary-600 dark:text-primary-400">
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={onUpgrade}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow hover:shadow-glow-lg'
                      : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                >
                  {plan.popular ? 'Get Started' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center border-t border-primary-200 dark:border-primary-700 pt-6">
            <p className="text-sm text-primary-500 dark:text-primary-400 mb-4">
              All plans include a 30-day money-back guarantee
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-accent-500" />
                <span className="text-primary-600 dark:text-primary-400">Instant Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-primary-600 dark:text-primary-400">Cancel Anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-warning-500" />
                <span className="text-primary-600 dark:text-primary-400">Premium Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialExpirationModal;
