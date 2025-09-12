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
              Check Your Email
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              We've sent a verification link to
            </p>
            <p className="text-accent-600 dark:text-accent-400 font-medium">
              {email || 'your email address'}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-accent-800 dark:text-accent-200">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-accent-700 dark:text-accent-300">
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
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
                Didn't receive the email?
              </p>
              
              <button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isResending || countdown > 0
                    ? 'bg-primary-100 dark:bg-primary-700 text-primary-400 dark:text-primary-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 hover:shadow-glow hover:scale-105'
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
              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                  <p className="text-sm text-success-800 dark:text-success-200">
                    Verification email sent successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {resendError && (
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                  <p className="text-sm text-error-800 dark:text-error-200">
                    {resendError}
                  </p>
                </div>
              </div>
            )}
          </div>

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
              Having trouble? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}