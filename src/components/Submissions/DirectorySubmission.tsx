import { useState, useEffect } from 'react';
import DirectoryGrid from './DirectoryGrid';

// Test if DirectoryGrid is imported correctly
console.log('🔍 DirectoryGrid import test:', DirectoryGrid);
console.log('🚀 CACHE BUST v4.0 - Latest build loaded at:', new Date().toISOString());
import axios from 'axios';
import TestConfig from '../TestConfig';
import DebugDirectories from '../DebugDirectories';
import DebugDirectoriesFlow from '../DebugDirectoriesFlow';
import { 
  ExternalLink,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { getDirectoriesByClassification, Directory } from '../../config/directoriesConfig';

export default function DirectorySubmission() {
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [stats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0
  });

  // Load directories from API
  const loadDirectories = async () => {
    try {
      setLoading(true);
      console.log('🔄 DIRECTORY FIX v3.1 - Loading Directory Submission directories from API...');
      
      // First test the debug route
      console.log('🔍 Testing debug route...');
      const debugResponse = await axios.get('/api/directories/debug/all', {
        params: { _cb: Date.now() } // Cache busting
      });
      console.log('🔍 DEBUG ROUTE RESPONSE:', debugResponse.data);
      console.log('🔍 DEBUG: Total directories available:', debugResponse.data.total);
      
      // Now get filtered directories
      const response = await axios.get('/api/directories', {
        params: { 
          classification: 'Directory Submission',
          _cb: Date.now() // Cache busting
        }
      });
      
      console.log('📊 API response for Directory Submission:', response.data);
      console.log('📊 API response length:', response.data?.length);
      console.log('📊 First directory:', response.data?.[0]);
      console.log('✅ Directory Submission directories loaded:', response.data?.length || 0);
      
      setDirectories(response.data || []);
    } catch (error: any) {
      console.error('❌ Error loading directories:', error);
      console.error('❌ Error details:', error.response?.data);
      // Fallback to config if API fails
      const configDirectories = getDirectoriesByClassification('Directory Submission');
      console.log('📊 Fallback to config directories:', configDirectories);
      setDirectories(configDirectories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📁 Directory Submission
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your website to high-quality directory submission sites for better SEO rankings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Directories</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{directories.length}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.submitted}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Directories Flow */}
        <DebugDirectoriesFlow />

        {/* Debug Directories - Raw API Data */}
        <DebugDirectories />

        {/* Test Config */}
        <TestConfig />

        {/* Directory Grid */}
        <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold text-yellow-800">🔍 DEBUG: DirectoryGrid Status - CACHE BUST v4.0</h3>
          <p className="text-yellow-700">Loading: {loading ? 'true' : 'false'}</p>
          <p className="text-yellow-700">Directories count: {directories.length}</p>
          <p className="text-yellow-700">Directories type: {typeof directories}</p>
          <p className="text-yellow-700">Build timestamp: {new Date().toISOString()}</p>
        </div>
        
        {DirectoryGrid ? (
          <DirectoryGrid
            directories={directories}
            loading={loading}
            classification="Directory Submission"
          />
        ) : (
          <div className="bg-red-100 border-2 border-red-400 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-red-800">❌ DirectoryGrid Component Failed to Load</h3>
            <p className="text-red-700">The DirectoryGrid component is not available</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 Directory Submission Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">SEO Boost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Improve your website's search engine rankings with quality backlinks from directory submissions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Traffic Increase</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drive more targeted traffic to your website through directory listings and referrals
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy Submission</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use our secure bookmarklet to auto-fill forms and submit to multiple directories quickly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
