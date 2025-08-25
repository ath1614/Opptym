import React from 'react';
import { useAuth } from '../hooks/useAuth';

const TestChanges: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 bg-white dark:bg-primary-900 rounded-xl shadow-glass">
      <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-4">
        Test Changes Component
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-primary-50 dark:bg-primary-800 rounded-lg">
          <h3 className="font-semibold text-primary-700 dark:text-primary-300 mb-2">
            User Information
          </h3>
          <p className="text-primary-600 dark:text-primary-400">
            Email: {user?.email || 'Not logged in'}
          </p>
          <p className="text-primary-600 dark:text-primary-400">
            Subscription: {user?.subscription || 'Free'}
          </p>
          <p className="text-primary-600 dark:text-primary-400">
            Trial End Date: {user?.trialEndDate || 'No trial'}
          </p>
        </div>
        
        <div className="p-4 bg-accent-50 dark:bg-accent-900/30 rounded-lg">
          <h3 className="font-semibold text-accent-700 dark:text-accent-300 mb-2">
            Dark Mode Test
          </h3>
          <p className="text-accent-600 dark:text-accent-400">
            This text should be visible in both light and dark modes
          </p>
        </div>
        
        <div className="p-4 bg-success-50 dark:bg-success-900/30 rounded-lg">
          <h3 className="font-semibold text-success-700 dark:text-success-300 mb-2">
            Success Colors
          </h3>
          <p className="text-success-600 dark:text-success-400">
            Success message styling test
          </p>
        </div>
        
        <div className="p-4 bg-warning-50 dark:bg-warning-900/30 rounded-lg">
          <h3 className="font-semibold text-warning-700 dark:text-warning-300 mb-2">
            Warning Colors
          </h3>
          <p className="text-warning-600 dark:text-warning-400">
            Warning message styling test
          </p>
        </div>
        
        <div className="p-4 bg-error-50 dark:bg-error-900/30 rounded-lg">
          <h3 className="font-semibold text-error-700 dark:text-error-300 mb-2">
            Error Colors
          </h3>
          <p className="text-error-600 dark:text-error-400">
            Error message styling test
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestChanges;
