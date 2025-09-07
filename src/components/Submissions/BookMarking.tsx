import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import DirectoryGrid from './DirectoryGrid';
import DebugDirectoriesFlow from '../DebugDirectoriesFlow';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ExternalLink,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { getDirectoriesByClassification, Directory } from '../../config/directoriesConfig';

export default function BookMarking() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    highPriority: 0
  });

  // Load directories from config file
  const loadDirectories = () => {
    try {
      setLoading(true);
      const configDirectories = getDirectoriesByClassification('BookMarking');
      setDirectories(configDirectories);
      console.log('✅ BookMarking directories loaded:', configDirectories.length);
    } catch (error) {
      console.error('Error loading directories:', error);
      setDirectories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for BookMarking classification
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classification: 'BookMarking' }
      });
      
      if (response.data.success) {
        setSubmissions(response.data.submissions);
        
        // Calculate stats
        const total = response.data.submissions.length;
        const submitted = response.data.submissions.filter(s => s.status === 'submitted').length;
        const approved = response.data.submissions.filter(s => s.status === 'approved' || s.status === 'published').length;
        const pending = response.data.submissions.filter(s => s.status === 'pending').length;
        
        setStats({ total, submitted, approved, pending, highPriority: 561 }); // 561 high priority platforms
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    loadDirectories();
    loadSubmissions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔖 BookMarking
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your website to social bookmarking platforms and directories to increase visibility and drive traffic
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Platforms</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{directories.length}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookmarked</p>
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

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highPriority}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Directories Flow */}
        <DebugDirectoriesFlow />

        {/* Directory Grid */}
        <DirectoryGrid 
          directories={directories}
          loading={loading}
          classification="BookMarking"
          onSubmissionCreated={fetchSubmissions}
        />

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 BookMarking Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Visibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Increase your website's visibility through social bookmarking platforms and community engagement
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Traffic Boost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drive targeted traffic to your website through social bookmarking and directory submissions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">High Priority</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit to high-priority bookmarking platforms for maximum SEO impact and faster indexing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
