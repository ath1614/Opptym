import { useState, useEffect } from 'react';
import DirectoryGrid from './DirectoryGrid';
import axios from 'axios';

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
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0
  });
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Load directories from database API
  const loadDirectories = async () => {
    try {
      setLoading(true);
      console.log('🔍 DirectorySubmission: Attempting to load from API...');
      const response = await axios.get('/api/directories', {
        params: { classification: 'Directory Submission' }
      });
      
      console.log('📊 DirectorySubmission: API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ DirectorySubmission: Loaded ${response.data.length} directories from API`);
        setDirectories(response.data);
      } else {
        console.log('⚠️ DirectorySubmission: API returned invalid data, falling back to config');
        const configDirectories = getDirectoriesByClassification('Directory Submission');
        console.log(`📁 DirectorySubmission: Config fallback loaded ${configDirectories.length} directories`);
        setDirectories(configDirectories);
      }
    } catch (error) {
      console.error('❌ DirectorySubmission: Error loading directories from API:', error);
      // Fallback to config file
      try {
        const configDirectories = getDirectoriesByClassification('Directory Submission');
        console.log(`📁 DirectorySubmission: Config fallback loaded ${configDirectories.length} directories`);
        setDirectories(configDirectories);
      } catch (configError) {
        console.error('❌ DirectorySubmission: Error loading directories from config:', configError);
        setDirectories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for Directory Submission classification
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classification: 'Directory Submission' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSubmissions(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const submitted = response.data.filter(s => s.status === 'submitted').length;
        const approved = response.data.filter(s => s.status === 'approved' || s.status === 'published').length;
        const pending = response.data.filter(s => s.status === 'pending').length;
        
        setStats({ total, submitted, approved, pending });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    loadDirectories();
    fetchSubmissions();
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

        {/* Directory Grid */}
        <DirectoryGrid
          directories={directories}
          loading={loading}
          classification="Directory Submission"
          onSubmissionCreated={fetchSubmissions}
        />

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