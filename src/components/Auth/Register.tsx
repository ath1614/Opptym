import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await register(name, email, password);
      setSuccess('Account created successfully! You can now login.');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-100 to-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl mb-6 shadow-glow">
              {/* Opptym Logo */}
              <svg className="w-8 h-8" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />
                {/* Bright blue circle and curve */}
                <circle cx="26" cy="14" r="3" fill="white" />
                <path
                  d="M 26 14 A 18 18 0 0 1 20 2"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Dark blue circle and curve */}
                <circle cx="14" cy="26" r="3" fill="white" />
                <path
                  d="M 14 26 A 18 18 0 0 1 20 38"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-primary-600">Join Opptym and boost your SEO</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl text-sm animate-fade-in-up">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-error-500 rounded-full"></div>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-xl text-sm animate-fade-in-up">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-primary-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-primary-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-700">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 border border-primary-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-accent-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-700">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-primary-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-4 px-6 rounded-xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-primary-600">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin} 
                className="text-accent-600 hover:text-accent-700 font-semibold transition-colors hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}