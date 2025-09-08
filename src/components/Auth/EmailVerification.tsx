import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface EmailVerificationProps {
  email?: string;
  onBackToLogin: () => void;
}

export default function EmailVerification({ email, onBackToLogin }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendError('Email address is required');
      return;
    }

    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      
      if (response.data.success) {
        setResendSuccess(true);
        setCountdown(300); // 5 minutes countdown
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      
      if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'RATE_LIMITED':
            setResendError('Please wait 5 minutes before requesting another verification email');
            break;
          case 'ALREADY_VERIFIED':
            setResendError('Email address is already verified');
            break;
          case 'USER_NOT_FOUND':
            setResendError('No account found with this email address');
            break;
          default:
            setResendError(error.response.data.message || 'Failed to resend verification email');
        }
      } else {
        setResendError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              We've sent a verification link to
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {email || 'your email address'}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to log in</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Resend Section */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Didn't receive the email?
              </p>
              
              <button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isResending || countdown > 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105'
                }`}
              >
                {isResending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : countdown > 0 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Verification Email</span>
                  </div>
                )}
              </button>
            </div>

            {/* Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Verification email sent successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {resendError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {resendError}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Having trouble? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
