import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Gift,
  ArrowRight,
  Users,
  BarChart3,
  Globe,
  Headphones
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface APIPlan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    projects: number;
    submissions: number;
    tools: number;
    apiCalls: number;
  };
  stripePriceIds: {
    monthly: string | null;
    yearly: string | null;
  };
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  metadata: {
    color: string;
    gradient: string;
    icon: string;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  limits: {
    projects: number;
    submissions: number;
    tools: boolean;
    support: string;
  };
  popular?: boolean;
  recommended?: boolean;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

// Icon mapping for plan metadata
const iconMap: Record<string, React.ComponentType<any>> = {
  star: Star,
  zap: Zap,
  crown: Crown,
  gift: Gift,
  trending: BarChart3,
  shield: Globe
};

// Color mapping for plan metadata
const colorMap: Record<string, string> = {
  gray: 'text-gray-600',
  orange: 'text-orange-600',
  green: 'text-green-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  red: 'text-red-600'
};


// Transform API plan data to component format
const transformAPIPlan = (apiPlan: APIPlan, billingCycle: 'monthly' | 'yearly'): PricingPlan => {
  const IconComponent = iconMap[apiPlan.metadata.icon] || Star;
  const colorClass = colorMap[apiPlan.metadata.color] || 'text-blue-600';
  
  return {
    id: apiPlan._id,
    name: apiPlan.name,
    price: billingCycle === 'yearly' ? apiPlan.price.yearly : apiPlan.price.monthly,
    period: billingCycle === 'yearly' ? 'year' : 'month',
    description: apiPlan.description,
    features: apiPlan.features,
    limits: {
      projects: apiPlan.limits.projects,
      submissions: apiPlan.limits.submissions,
      tools: apiPlan.limits.tools > 0,
      support: apiPlan.isPopular ? 'Priority' : 'Standard'
    },
    popular: apiPlan.isPopular,
    recommended: apiPlan.name === 'Pro',
    icon: IconComponent,
    color: colorClass,
    gradient: apiPlan.metadata.gradient
  };
};




export default function PricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [apiPlans, setApiPlans] = useState<APIPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();

  // Stripe price ID mapping - now dynamic from API
  const getStripePriceId = (planId: string, cycle: 'monthly' | 'yearly') => {
    const apiPlan = apiPlans.find(p => p._id === planId);
    if (!apiPlan) return null;
    
    return cycle === 'monthly' ? apiPlan.stripePriceIds.monthly : apiPlan.stripePriceIds.yearly;
  };

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/plans');
        const activePlans = response.data
          .filter((plan: APIPlan) => plan.isActive)
          .sort((a: APIPlan, b: APIPlan) => a.sortOrder - b.sortOrder);
        
        setApiPlans(activePlans);
        const transformedPlans = activePlans.map(plan => transformAPIPlan(plan, billingCycle));
        setPlans(transformedPlans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        showPopup('Failed to load pricing plans. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [billingCycle]);

  const getDiscountedPrice = (price: number, planId: string) => {
    // 10% discount for yearly on Pro/Business
    if (billingCycle === 'yearly' && (planId === 'pro' || planId === 'business')) {
      return Math.round(price * 12 * 0.9);
    }
    if (billingCycle === 'yearly') {
      return price * 12;
    }
    return price;
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    const selected = plans.find(p => p.id === planId);
    
    // Check if user is already on this plan
    if (user?.subscription === planId) {
      showPopup('You are already on this plan!', 'info');
      setSelectedPlan(null);
      return;
    }
    
    if (!user || !user.email || !selected || selected.price === 0) {
      showPopup('You must be logged in to upgrade to a paid plan.', 'warning');
      setSelectedPlan(null);
      return;
    }
    
    const priceId = getStripePriceId(planId, billingCycle);
    if (!priceId && planId !== 'test') {
      showPopup('No Stripe price ID found for this plan.', 'error');
      setSelectedPlan(null);
      return;
    }
    
    try {
      console.log('🚀 Initiating payment for plan:', planId);
      console.log('📧 User email:', user.email);
      console.log('💰 Billing cycle:', billingCycle);
      console.log('🔑 Stripe price ID:', priceId);
      
      const res = await axios.post(`/api/payment/create-checkout-session`, {
        planId: planId,
        userId: user.id,
        email: user.email,
        billingCycle,
      });
      
      console.log('✅ Checkout session created:', res.data);
      
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err: any) {
      console.error('❌ Payment initiation failed:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      let errorMessage = 'Failed to initiate payment. ';
      
      if (err.response?.status === 404) {
        errorMessage += 'Payment service is currently unavailable. Please try again later or contact support.';
        // Show contact information for payment issues
        setTimeout(() => {
          showPopup('For immediate assistance with payments, please contact support at support@opptym.com', 'info');
        }, 3000);
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error occurred. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      showPopup(errorMessage, 'error');
      setSelectedPlan(null);
    }
  };

  const getCurrentPlanStatus = (planId: string) => {
    if (!user) return null;
    
    if (user.subscription === planId) {
      return 'current';
    }
    
    // Check if user can upgrade to this plan
    const currentPlanIndex = plans.findIndex(p => p.id === user.subscription);
    const targetPlanIndex = plans.findIndex(p => p.id === planId);
    
    if (targetPlanIndex > currentPlanIndex) {
      return 'upgrade';
    } else if (targetPlanIndex < currentPlanIndex) {
      return 'downgrade';
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 space-y-8">
      {/* Current Plan Indicator */}
      {user && (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            You are currently on the <span className="font-semibold text-blue-600 dark:text-blue-400">
              {plans.find(p => p.id === user.subscription)?.name || user.subscription}
            </span> plan
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.subscription === 'free' ? 'Free plan: 3-day trial with progressive feature lockout' :
             user.subscription === 'test' ? 'Test plan - ₹10 payment testing' :
             user.subscription === 'starter' ? '1 project, 150 submissions per month' :
             user.subscription === 'pro' ? '5 projects, 750 submissions per month' :
             user.subscription === 'business' ? '10 projects, 1500 submissions per month' :
             'Unlimited projects and submissions'}
          </p>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Choose Your Perfect Plan</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Pricing that scales with your
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> success</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core SEO tools and directory submission features.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-primary-700 p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs px-2 py-0.5 rounded-full">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading plans...</span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const finalPrice = getDiscountedPrice(plan.price, plan.id);
          const planStatus = getCurrentPlanStatus(plan.id);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col h-full bg-white dark:bg-primary-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? 'border-blue-200 dark:border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30'
                  : plan.recommended
                  ? 'border-purple-200 dark:border-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              style={{ minHeight: '600px', display: 'flex' }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {planStatus === 'current' && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                  Current Plan
                </div>
              )}

              {/* Upgrade Badge */}
              {planStatus === 'upgrade' && (
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                  Upgrade
                </div>
              )}

              {/* Downgrade Badge */}
              {planStatus === 'downgrade' && (
                <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                  Downgrade
                </div>
              )}

              <div className="flex-1 flex flex-col p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ₹{getDiscountedPrice(plan.price, plan.id)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                      )}
                    </div>
                    {plan.originalPrice && billingCycle === 'monthly' && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="line-through">${plan.originalPrice}</span>
                        <span className="ml-2 text-green-600 font-medium">
                          Save ${plan.originalPrice - finalPrice}
                        </span>
                      </div>
                    )}
                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Save ${(plan.price * 12) - (finalPrice * 12)} per year
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Plan Stats */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                                              <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Projects</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                      {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                                              <BarChart3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Submissions</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                      {plan.limits.submissions === -1 ? 'Unlimited' : `${plan.limits.submissions}/month`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                                              <Headphones className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Support</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{plan.limits.support}</span>
                  </div>
                </div>

                {/* CTA Button */}
                {planStatus === 'current' ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 px-6 rounded-xl font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={selectedPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      plan.popular || plan.recommended
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                        : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedPlan === plan.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {planStatus === 'upgrade' ? 'Upgrade Now' :
                           planStatus === 'downgrade' ? 'Downgrade' :
                           plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 dark:text-gray-400">Everything you need to know about our pricing plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">Our Free plan includes a 3-day trial with progressive feature lockout. Try 3 projects, 5 submissions, and 5 SEO tool uses. No credit card required to get started.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, we offer a 30-day money-back guarantee on all paid plans.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">Absolutely! You can cancel your subscription at any time from your account settings.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Do you offer custom plans?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, we offer custom enterprise plans for large organizations. Contact our sales team.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-8 text-center max-w-4xl mx-auto">
          <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need a custom solution?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
          Our team can help you create a custom plan that fits your specific needs and budget.
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
          Contact Sales Team
        </button>
      </div>
    </div>
  );
}