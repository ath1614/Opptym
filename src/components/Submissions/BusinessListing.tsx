import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import DirectoryGrid from './DirectoryGrid';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Globe
} from 'lucide-react';
import { getDirectoriesByClassification, Directory } from '../../config/directoriesConfig';

export default function BusinessListing() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [countryStats, setCountryStats] = useState({});
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
      const configDirectories = getDirectoriesByClassification('Business Listing');
      setDirectories(configDirectories);
      
      // Calculate country stats
      const stats = configDirectories.reduce((acc, dir) => {
        acc[dir.country || 'Global'] = (acc[dir.country || 'Global'] || 0) + 1;
        return acc;
      }, {});
      setCountryStats(stats);
    } catch (error) {
      console.error('Error loading directories:', error);
      setDirectories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for Business Listing classification
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classification: 'Business Listing' }
      });
      
      if (response.data.success) {
        setSubmissions(response.data.submissions);
        
        // Calculate stats
        const total = response.data.submissions.length;
        const submitted = response.data.submissions.filter(s => s.status === 'submitted').length;
        const approved = response.data.submissions.filter(s => s.status === 'approved' || s.status === 'published').length;
        const pending = response.data.submissions.filter(s => s.status === 'pending').length;
        
        setStats({ total, submitted, approved, pending, highPriority: 465 }); // 465 high priority platforms
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    loadDirectories();
    fetchSubmissions();
  }, []);

  // Filter directories by country
  const filteredDirectories = selectedCountry === 'All' 
    ? directories 
    : directories.filter(dir => dir.country === selectedCountry);

  const countries = ['All', ...Object.keys(countryStats).sort()];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏢 Business Listing
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your business to local and international business directories across multiple countries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Platforms</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{directories.length}</p>
              </div>
            </div>
          </div>

          {/* Country Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Country:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCountry === country
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {country} {country !== 'All' && `(${countryStats[country] || 0})`}
                </button>
              ))}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Listed</p>
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
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.highPriority}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Directories Flow */}

        {/* Directory Grid */}
        <DirectoryGrid 
          directories={filteredDirectories}
          loading={loading}
          classification="Business Listing"
        />

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🌍 Global Business Listing Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global Reach</h3>
              <p className="text-gray-600 dark:text-gray-300">
                List your business across 10 countries including USA, UK, India, Canada, Australia, and more
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Local Visibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Increase local search visibility and attract customers in your target markets
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">High Priority</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit to high-priority platforms in major markets for maximum business exposure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}