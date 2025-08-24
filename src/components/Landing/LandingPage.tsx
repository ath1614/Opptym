import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Globe, 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle,
  Play,
  Star,
  Award,
  TrendingUp,
  Clock,
  Target,
  Rocket
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Automation",
      description: "Intelligent form filling and submission automation across 1000+ directories"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Directory Network",
      description: "Access to premium directories worldwide for maximum SEO impact"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive SEO reports and performance tracking"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    }
  ];

  const stats = [
    { number: "1000+", label: "Directories" },
    { number: "50K+", label: "Submissions" },
    { number: "99.9%", label: "Success Rate" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "SEO Manager",
      company: "TechCorp",
      content: "OPPTYM transformed our directory submission process. We've seen a 300% increase in backlinks!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Digital Marketing Director",
      company: "GrowthLabs",
      content: "The automation is incredible. What used to take weeks now happens in minutes.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Agency Owner",
      company: "SEO Masters",
      content: "Best investment for our agency. Our clients love the results!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-950 dark:via-accent-950 dark:to-primary-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800 dark:to-accent-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-100 to-primary-200 dark:from-accent-900 dark:to-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
              OPPTYM
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className="px-6 py-2 text-primary-700 dark:text-primary-300 hover:text-accent-600 dark:hover:text-accent-400 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="px-6 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-700 rounded-full text-sm font-medium text-accent-700 dark:text-accent-300 mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Directory Submission Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
                Automate Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-600 to-primary-800 dark:from-accent-400 dark:to-primary-200 bg-clip-text text-transparent">
                SEO Success
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-600 dark:text-primary-400 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Submit to 1000+ directories automatically with AI-powered form filling. 
              Boost your backlinks and rankings in minutes, not months.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={onRegisterClick}
              className="group px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-2xl font-semibold text-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group px-8 py-4 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl font-semibold text-lg hover:bg-white dark:hover:bg-primary-800 transition-all duration-300 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 dark:from-accent-400 dark:to-primary-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-600 dark:text-primary-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 bg-white/50 dark:bg-primary-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
              Why Choose OPPTYM?
            </h2>
            <p className="text-xl text-primary-600 dark:text-primary-400 max-w-3xl mx-auto">
              Powerful automation tools designed to supercharge your SEO efforts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 hover:shadow-glass-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white shadow-glow group-hover:shadow-glow-lg transition-all duration-300 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">
                  {feature.title}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-primary-600 dark:text-primary-400 max-w-3xl mx-auto">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Project",
                description: "Add your website and business details to our platform",
                icon: <Target className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Select Directories",
                description: "Choose from 1000+ premium directories to submit to",
                icon: <Globe className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Automate & Scale",
                description: "Watch as AI automatically fills and submits forms",
                icon: <Rocket className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div
                key={index}
                className="relative group p-8 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 hover:shadow-glass-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow">
                  {item.step}
                </div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-2xl flex items-center justify-center text-white shadow-glow mb-6">
                  {item.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">
                  {item.title}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-20 bg-white/50 dark:bg-primary-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-800 to-accent-600 dark:from-primary-200 dark:to-accent-400 bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
            <p className="text-xl text-primary-600 dark:text-primary-400 max-w-3xl mx-auto">
              Join thousands of satisfied customers who've transformed their SEO
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 hover:shadow-glass-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-primary-700 dark:text-primary-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-primary-800 dark:text-primary-200">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl shadow-glow-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your SEO?
            </h2>
            <p className="text-xl text-accent-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using OPPTYM to automate their directory submissions and boost their rankings.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onRegisterClick}
                className="group px-8 py-4 bg-white text-accent-600 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onLoginClick}
                className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white hover:text-accent-600 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-primary-200 dark:border-primary-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
                OPPTYM
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-primary-600 dark:text-primary-400">
              <span>© 2024 OPPTYM. All rights reserved.</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}