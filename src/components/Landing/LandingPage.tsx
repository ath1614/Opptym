import React from 'react';
import { 
  Rocket, 
  BarChart, 
  Globe, 
  Users, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Lightbulb
} from 'lucide-react';
import Logo from '../ui/Logo';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Logo size="xl" className="mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              AI-Powered SEO Automation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Transform your SEO strategy with intelligent automation. From directory submissions to comprehensive analysis, 
              OPPTYM handles everything while you focus on growing your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onRegisterClick}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <Rocket className="w-5 h-5" />
                <span>Start Free Trial</span>
              </button>
              <button
                onClick={onLoginClick}
                className="text-blue-600 font-medium border-2 border-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all flex items-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">+2,500</div>
              <div className="text-gray-600">Websites Automated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">+15,000</div>
              <div className="text-gray-600">Submissions Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10x</div>
              <div className="text-gray-600">Faster Results</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose OPPTYM?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most comprehensive AI-powered SEO automation platform designed for modern businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Intelligent Automation</h3>
              <p className="text-gray-600 mb-4">
                Our AI-powered system automatically detects form fields and fills them with your project data, 
                eliminating manual work and reducing errors.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Universal form detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Smart field mapping</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Error-free submissions</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive SEO Tools</h3>
              <p className="text-gray-600 mb-4">
                Access 15+ professional SEO tools including keyword analysis, backlink monitoring, 
                technical audits, and competitor research.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Keyword density analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Backlink monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Technical SEO audits</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Tracking</h3>
              <p className="text-gray-600 mb-4">
                Monitor your SEO progress with detailed reports, analytics, and performance insights 
                to optimize your strategy continuously.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Performance reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>ROI tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Complete SEO Knowledge Base</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about SEO automation and optimization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Directory Submissions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Directory Submissions</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>What it is:</strong> Automated submission to high-quality web directories to improve your website's visibility and backlink profile.
                </p>
                <p>
                  <strong>How it works:</strong> Our AI automatically detects form fields on directory websites and fills them with your project information, ensuring accurate and consistent submissions.
                </p>
                <p>
                  <strong>Benefits:</strong> Increased online presence, better local SEO, improved search rankings, and enhanced credibility.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Supported Platforms:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Business directories (Yelp, JustDial, IndiaMart)</li>
                    <li>• Local citation sites</li>
                    <li>• Industry-specific directories</li>
                    <li>• Social bookmarking platforms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SEO Analysis Tools */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">SEO Analysis Tools</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>What it is:</strong> Comprehensive suite of SEO analysis tools to audit and optimize your website's performance.
                </p>
                <p>
                  <strong>Key Features:</strong> Meta tag analysis, keyword density checking, backlink monitoring, technical audits, and competitor analysis.
                </p>
                <p>
                  <strong>Benefits:</strong> Identify optimization opportunities, track performance improvements, and stay ahead of competitors.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">Available Tools:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Meta Tag Analyzer</li>
                    <li>• Keyword Density Checker</li>
                    <li>• Backlink Scanner</li>
                    <li>• Technical SEO Auditor</li>
                    <li>• Page Speed Analyzer</li>
                    <li>• Mobile Audit Tool</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Automation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">AI-Powered Automation</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>What it is:</strong> Advanced artificial intelligence that learns from your submissions and improves accuracy over time.
                </p>
                <p>
                  <strong>How it works:</strong> Our AI analyzes form structures, learns field patterns, and adapts to different website layouts for maximum success rates.
                </p>
                <p>
                  <strong>Benefits:</strong> Higher success rates, reduced manual work, consistent data entry, and scalable operations.
                </p>
                <div className="bg-cyan-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-cyan-800 mb-2">AI Capabilities:</h4>
                  <ul className="text-sm text-cyan-700 space-y-1">
                    <li>• Form field detection</li>
                    <li>• Smart data mapping</li>
                    <li>• Error handling</li>
                    <li>• Learning algorithms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Performance Tracking */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Performance Tracking</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>What it is:</strong> Comprehensive reporting and analytics to track your SEO performance and ROI.
                </p>
                <p>
                  <strong>Key Metrics:</strong> Submission success rates, SEO score improvements, ranking changes, and conversion tracking.
                </p>
                <p>
                  <strong>Benefits:</strong> Data-driven decisions, measurable results, optimization insights, and ROI justification.
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Tracking Features:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Real-time analytics</li>
                    <li>• Performance dashboards</li>
                    <li>• Custom reports</li>
                    <li>• Export capabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Trusted by SEO Professionals</h2>
            <p className="text-xl text-gray-600">See what our users are saying about OPPTYM</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "OPPTYM revolutionized our SEO workflow. We went from spending 20+ hours per week on manual submissions to just a few clicks. Our rankings improved by 40% in the first month!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">RM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Rahul Mehta</div>
                  <div className="text-sm text-gray-600">SEO Agency Owner</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The AI automation is incredible! It handles complex forms that we used to struggle with manually. The accuracy rate is impressive, and the time savings are massive."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Sarah Patel</div>
                  <div className="text-sm text-gray-600">Digital Marketing Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The comprehensive SEO tools and automation features make OPPTYM a must-have for any serious SEO professional. It's like having a full team of experts working for you."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AK</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Amit Kumar</div>
                  <div className="text-sm text-gray-600">E-commerce Entrepreneur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Transform Your SEO Strategy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who trust OPPTYM for their SEO automation needs. 
            Start your free trial today and see the difference AI-powered automation can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Start Free Trial</span>
            </button>
            <button
              onClick={onLoginClick}
              className="text-blue-600 font-medium border-2 border-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400">© 2024 OPPTYM. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">Privacy Policy</span>
                <span className="text-gray-400">Terms of Service</span>
                <span className="text-gray-400">Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;