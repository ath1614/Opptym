import { useState, useEffect } from 'react';
import DirectoryGrid from './DirectoryGrid';
import axios from 'axios';
import { 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Directory } from '../../config/directoriesConfig';

export default function ArticleSubmission() {
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    instantApproval: 0
  });
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Load directories from API
  const fetchDirectories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/directories?classification=Article Submission', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching directories:', error);
      setDirectories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for Article Submission classification
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classification: 'Article Submission' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSubmissions(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const submitted = response.data.filter(s => s.status === 'submitted').length;
        const approved = response.data.filter(s => s.status === 'approved' || s.status === 'published').length;
        const pending = response.data.filter(s => s.status === 'pending').length;
        const instantApproval = response.data.filter(s => s.status === 'instant_approval').length;
        
        setStats({ total, submitted, approved, pending, instantApproval });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    fetchDirectories();
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
                📝 Article Submission
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your articles to high-quality article submission platforms for better content distribution and SEO benefits
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Platforms</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{directories.length}</p>
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

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instant Approval</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.instantApproval}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Directory Grid */}
        <DirectoryGrid 
          directories={directories}
          loading={loading}
          classification="Article Submission"
          onSubmissionCreated={fetchSubmissions}
        />

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 Article Submission Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Distribution</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Distribute your articles across multiple platforms to reach a wider audience and increase brand visibility
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quality Backlinks</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build high-quality backlinks from reputable article platforms to improve your website's SEO rankings
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instant Approval</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit to instant approval platforms for immediate publication and faster SEO benefits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
