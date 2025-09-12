import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onSwitchToRegister?: () => void;
}

export default function ForgotPassword({ onBackToLogin, onSwitchToRegister }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isUserNotFound, setIsUserNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);
    setIsUserNotFound(false);

    // Client-side validation
    if (!email || !email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        // Handle non-existent user case
        const message = error.response.data.message || 'user account not found, please register';
        setError(message);
        setIsUserNotFound(true);
      } else if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'RATE_LIMITED':
            setError('Please wait 15 minutes before requesting another password reset');
            break;
          case 'INVALID_EMAIL':
            setError('Please enter a valid email address');
            break;
          default:
            setError(error.response.data.message || 'Failed to send reset email');
        }
      } else {
        // Check if it's a network/server error
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
          setError('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-success-200 to-success-300 dark:from-success-800 dark:to-success-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800 dark:to-accent-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-success-100 to-accent-200 dark:from-success-900 dark:to-accent-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-8 animate-fade-in-up">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-2">
                Check Your Email
              </h1>
              <p className="text-primary-600 dark:text-primary-400">
                We've sent a password reset link to
              </p>
              <p className="text-success-600 dark:text-success-400 font-medium">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-success-800 dark:text-success-200">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-success-700 dark:text-success-300">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the password reset link</li>
                    <li>Create a new password</li>
                    <li>Log in with your new password</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-warning-800 dark:text-warning-200">
                  <p className="font-medium mb-1">Security Note:</p>
                  <p className="text-warning-700 dark:text-warning-300">
                    The reset link will expire in 1 hour for security reasons.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="space-y-4">
              <button
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-300 hover:shadow-glow hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-4 text-center">
              <p className="text-xs text-primary-500 dark:text-primary-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-accent-200 to-accent-300 dark:from-accent-800 dark:to-accent-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-100 to-primary-200 dark:from-accent-900 dark:to-primary-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/20 dark:border-primary-700/20 p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-2">
              Reset Password
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 dark:border-primary-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white/50 dark:bg-primary-800/50 backdrop-blur-sm text-primary-900 dark:text-primary-100 placeholder-primary-500 dark:placeholder-primary-400 transition-all duration-200 shadow-soft hover:shadow-medium"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                  <p className="text-sm text-error-800 dark:text-error-200">
                    {error}
                  </p>
                </div>
                {isUserNotFound && onSwitchToRegister && (
                  <div className="mt-3 pt-3 border-t border-error-200 dark:border-error-800">
                    <button
                      onClick={onSwitchToRegister}
                      className="w-full py-2 px-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-300 hover:shadow-glow hover:scale-105 text-sm font-medium"
                    >
                      Create New Account
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isLoading
                  ? 'bg-primary-100 dark:bg-primary-700 text-primary-400 dark:text-primary-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 hover:shadow-glow hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-primary-200 dark:border-primary-700">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-primary-500 dark:text-primary-400">
              Remember your password? You can log in normally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}