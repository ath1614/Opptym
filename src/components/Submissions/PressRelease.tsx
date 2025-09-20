import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import DirectoryGrid from './DirectoryGrid';
import GlobalSubmissionStats from '../Common/GlobalSubmissionStats';
import axios from 'axios';
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

export default function PressRelease() {
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

  // Load directories from database API
  const loadDirectories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/directories', {
        params: { classification: 'Press Release' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setDirectories(response.data);
      } else {
        // Fallback to config file if API fails
        const configDirectories = getDirectoriesByClassification('Press Release');
        setDirectories(configDirectories);
      }
    } catch (error) {
      console.error('Error loading directories from API:', error);
      // Fallback to config file
      try {
        const configDirectories = getDirectoriesByClassification('Press Release');
        setDirectories(configDirectories);
      } catch (configError) {
        console.error('Error loading directories from config:', configError);
        setDirectories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for Press Release classification
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classification: 'Press Release' }
      });
      
      if (response.data.success) {
        setSubmissions(response.data.submissions);
        
        // Calculate stats
        const total = response.data.submissions.length;
        const submitted = response.data.submissions.filter(s => s.status === 'submitted').length;
        const approved = response.data.submissions.filter(s => s.status === 'approved' || s.status === 'published').length;
        const pending = response.data.submissions.filter(s => s.status === 'pending').length;
        
        setStats({ total, submitted, approved, pending, highPriority: 3 }); // 3 high priority platforms
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
                📰 Press Release
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your press releases to professional PR platforms for maximum media coverage and brand visibility
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Platforms</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{directories.length}</p>
              </div>
            </div>
          </div>

          {/* Global Submission Stats */}
          <GlobalSubmissionStats />
        </div>


        {/* Directory Grid */}
        <DirectoryGrid 
          directories={directories}
          loading={loading}
          classification="Press Release"
        />

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 Press Release Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Media Coverage</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reach journalists, bloggers, and media outlets to get your news published across multiple channels
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Brand Authority</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build credibility and authority by publishing press releases on reputable PR platforms
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">High Priority</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit to premium platforms like PRNewswire, PRWeb, and PRLog for maximum impact
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}