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
import { BASE_URL } from '../../lib/api';
import axios from 'axios';

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

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '3 days',
    description: '3 days trial with all features (1 project)',
    features: [
      'All Features',
      '1 SEO Project',
      '3 Days Trial',
      'Email Support',
      'Basic Analytics',
      'Community Forum Access'
    ],
    limits: {
      projects: 1,
      submissions: 10,
      tools: true,
      support: 'Email'
    },
    icon: Gift,
    color: 'text-green-600',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 999,
    period: 'month',
    description: 'All features, 1 website SEO project',
    features: [
      'All Features',
      '1 SEO Project',
      '150 Submissions per month',
      'Priority Email Support',
      'Detailed Submission Reports',
      'White-label Reports',
      'API Access (100 calls/day)'
    ],
    limits: {
      projects: 1,
      submissions: 150,
      tools: true,
      support: 'Priority Email'
    },
    popular: true,
    icon: Star,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 3999,
    period: 'month',
    description: 'All features, 5 projects',
    features: [
      'All Features',
      '5 SEO Projects',
      '750 Submissions per month',
      'Priority Support',
      'Advanced Analytics',
      'Custom Branding',
      'API Access (500 calls/day)'
    ],
    limits: {
      projects: 5,
      submissions: 750,
      tools: true,
      support: 'Priority Support'
    },
    recommended: true,
    icon: Crown,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'business',
    name: 'Business Pack',
    price: 8999,
    period: 'month',
    description: 'All features, 10 projects',
    features: [
      'All Features',
      '10 SEO Projects',
      '1500 Submissions per month',
      '24/7 Support',
      'Dedicated Account Manager',
      'Unlimited API Access',
      'Custom Reporting'
    ],
    limits: {
      projects: 10,
      submissions: 1500,
      tools: true,
      support: '24/7 Support'
    },
    icon: Crown,
    color: 'text-yellow-600',
    gradient: 'from-yellow-400 to-orange-500'
  }
];

// Stripe price ID mapping
const priceIdMap: Record<string, string> = {
  // Monthly
  'starter_monthly': 'price_1Ro1LgCD7oezJBDYCEE71gAc',
  'pro_monthly': 'price_1Ro1MYCD7oezJBDYgAXVoUw6',
  'business_monthly': 'price_1Ro1NQCD7oezJBDYE4IX9qPE',
  // Yearly
  'starter_yearly': 'price_1Ro1LgCD7oezJBDYCEE71gAc', // update if you have a yearly price for starter
  'pro_yearly': 'price_1Ro1RGCD7oezJBDY2yHsrEur',
  'business_yearly': 'price_1Ro1TBCD7oezJBDYEEJGaA75',
};

const getStripePriceId = (planId: string, cycle: 'monthly' | 'yearly') => {
  if (planId === 'free') return null;
  if (planId === 'basic') planId = 'starter';
  if (planId === 'premium') planId = 'business';
  return priceIdMap[`${planId}_${cycle}`];
};

export default function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();

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
      alert('You are already on this plan!');
      setSelectedPlan(null);
      return;
    }
    
    if (!user || !user.email || !selected || selected.price === 0) {
      alert('You must be logged in to upgrade to a paid plan.');
      setSelectedPlan(null);
      return;
    }
    
    const priceId = getStripePriceId(planId, billingCycle);
    if (!priceId) {
      alert('No Stripe price ID found for this plan.');
      setSelectedPlan(null);
      return;
    }
    
    try {
      const res = await axios.post(`${BASE_URL}/payment/create-checkout-session`, {
        plan: planId,
        userId: user.id,
        email: user.email,
        priceId,
        billingCycle,
      });
      window.location.href = res.data.url;
    } catch (err: any) {
      alert('Failed to initiate payment: ' + (err.response?.data?.error || err.message));
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
    <div className="p-6 space-y-8">
      {/* Current Plan Indicator */}
      {user && (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          </div>
          <p className="text-gray-700 mb-2">
            You are currently on the <span className="font-semibold text-blue-600">
              {plans.find(p => p.id === user.subscription)?.name || user.subscription}
            </span> plan
          </p>
          <p className="text-sm text-gray-600">
            {user.subscription === 'free' ? 'Free forever plan with basic features' :
             user.subscription === 'starter' ? '1 project, 100 submissions per month' :
             user.subscription === 'pro' ? '5 projects, 500 submissions per month' :
             user.subscription === 'business' ? '10 projects, 1000 submissions per month' :
             'Unlimited projects and submissions'}
          </p>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Choose Your Perfect Plan</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Pricing that scales with your
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> success</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core SEO tools and directory submission features.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs px-2 py-0.5 rounded-full">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const finalPrice = getDiscountedPrice(plan.price, plan.id);
          const planStatus = getCurrentPlanStatus(plan.id);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col h-full bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? 'border-blue-200 ring-4 ring-blue-100'
                  : plan.recommended
                  ? 'border-purple-200 ring-4 ring-purple-100'
                  : 'border-gray-200 hover:border-gray-300'
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ₹{getDiscountedPrice(plan.price, plan.id)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                      )}
                    </div>
                    {plan.originalPrice && billingCycle === 'monthly' && (
                      <div className="text-sm text-gray-500">
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
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Plan Stats */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Projects</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Submissions</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {plan.limits.submissions === -1 ? 'Unlimited' : `${plan.limits.submissions}/month`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Headphones className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Support</span>
                    </div>
                    <span className="font-medium text-gray-900">{plan.limits.support}</span>
                  </div>
                </div>

                {/* CTA Button */}
                {planStatus === 'current' ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-xl font-medium cursor-not-allowed"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about our pricing plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Our Starter plan is completely free forever. No credit card required to get started.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee on all paid plans.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Absolutely! You can cancel your subscription at any time from your account settings.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do you offer custom plans?</h3>
              <p className="text-gray-600">Yes, we offer custom enterprise plans for large organizations. Contact our sales team.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center max-w-4xl mx-auto">
        <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Need a custom solution?</h3>
        <p className="text-gray-600 mb-6">
          Our team can help you create a custom plan that fits your specific needs and budget.
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
          Contact Sales Team
        </button>
      </div>
    </div>
  );
}