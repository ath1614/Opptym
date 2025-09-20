import { useState, useEffect } from 'react';
import DirectoryGrid from './DirectoryGrid';
import UnifiedSubmissionStats from './UnifiedSubmissionStats';
import axios from 'axios';
import { 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { getDirectoriesByClassification, Directory } from '../../config/directoriesConfig';

interface Submission {
  _id: string;
  status: string;
  submittedAt: string;
  publishedAt?: string;
}

export default function BookMarking() {
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]); // Used for stats calculation and future features
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    highPriority: 0
  });

  // Calculate stats from submissions
  const calculateStats = (submissionData: Submission[]) => {
    const total = submissionData.length;
    const submitted = submissionData.filter((s: Submission) => s.status === 'submitted').length;
    const approved = submissionData.filter((s: Submission) => s.status === 'approved' || s.status === 'published').length;
    const pending = submissionData.filter((s: Submission) => s.status === 'pending').length;
    const highPriority = directories.filter(d => (d.priority || 0) >= 75).length;
    
    return { total, submitted, approved, pending, highPriority };
  };

  // Load directories from database API
  const loadDirectories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/directories', {
        params: { classification: 'BookMarking' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setDirectories(response.data);
      } else {
        // Fallback to config file if API fails
        const configDirectories = getDirectoriesByClassification('BookMarking');
        setDirectories(configDirectories);
      }
    } catch (error) {
      console.error('Error loading directories from API:', error);
      // Fallback to config file
      try {
        const configDirectories = getDirectoriesByClassification('BookMarking');
        setDirectories(configDirectories);
      } catch (configError) {
        console.error('Error loading directories from config:', configError);
        setDirectories([]);
      }
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
      
      if (response.data && Array.isArray(response.data)) {
        setSubmissions(response.data);
        setStats(calculateStats(response.data));
      } else if (response.data && response.data.submissions) {
        setSubmissions(response.data.submissions);
        setStats(calculateStats(response.data.submissions));
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    loadDirectories();
    fetchSubmissions();
  }, []);

  // Update stats when submissions change
  useEffect(() => {
    if (submissions.length > 0) {
      setStats(calculateStats(submissions));
    }
  }, [submissions, directories]);

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

          {/* Unified Submission Stats */}
          <UnifiedSubmissionStats />
        </div>

        {/* Debug Directories Flow */}

        {/* Directory Grid */}
        <DirectoryGrid 
          directories={directories}
          loading={loading}
          classification="BookMarking"
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
