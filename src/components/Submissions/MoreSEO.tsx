import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, AlertCircle } from 'lucide-react';

export default function MoreSEO() {
  const theme = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 More SEO
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Additional SEO platforms and tools for comprehensive search engine optimization strategies.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">Coming Soon</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Additional SEO platforms and tools will be available soon. Please provide the directory data to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
