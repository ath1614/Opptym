import React, { useState, useEffect, useMemo } from 'react';
import DirectoryGrid from './DirectoryGrid';
import { getDirectoriesByClassification, Directory } from '../../config/directoriesConfig';
import axios from 'axios';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Directory interface is now imported from config

interface Submission {
  _id: string;
  directoryId: string;
  projectId: string;
  status: string;
  submittedAt: string;
  publishedAt?: string;
  directory: Directory;
}

const Classified: React.FC = () => {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'daScore' | 'totalSubmissions'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Load directories from database API
  useEffect(() => {
    const loadDirectories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/directories', {
          params: { classification: 'Classified' }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setDirectories(response.data);
        } else {
          // Fallback to config file if API fails
          const configDirectories = getDirectoriesByClassification('Classified');
          setDirectories(configDirectories);
        }
      } catch (error) {
        console.error('Error loading directories from API:', error);
        // Fallback to config file
        try {
          const configDirectories = getDirectoriesByClassification('Classified');
          setDirectories(configDirectories);
        } catch (configError) {
          console.error('Error loading directories from config:', configError);
          setDirectories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDirectories();
  }, []);

  // Load submissions from API
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/submissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { classification: 'Classified' }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else if (response.data && response.data.submissions) {
          setSubmissions(response.data.submissions);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      }
    };

    loadSubmissions();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSubmissions = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const published = submissions.filter(s => s.status === 'published').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const highPriority = directories.filter(d => (d.priority || 0) >= 75).length;

    return {
      totalSubmissions,
      submitted,
      published,
      pending,
      highPriority
    };
  }, [submissions, directories]);

  // Filter and sort directories
  const filteredDirectories = useMemo(() => {
    let filtered = directories.filter(dir => {
      const matchesSearch = dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dir.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (dir.country || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || 
        (filterPriority === 'high' && (dir.priority || 0) >= 75) ||
        (filterPriority === 'medium' && (dir.priority || 0) >= 50 && (dir.priority || 0) < 75) ||
        (filterPriority === 'low' && (dir.priority || 0) < 50);

      return matchesSearch && matchesPriority;
    });

    // Sort directories
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          aValue = a.priority || 0;
          bValue = b.priority || 0;
          break;
        case 'daScore':
          aValue = a.daScore || 0;
          bValue = b.daScore || 0;
          break;
        case 'totalSubmissions':
          aValue = 0; // Placeholder since totalSubmissions doesn't exist in Directory interface
          bValue = 0;
          break;
        default:
          aValue = a.priority || 0;
          bValue = b.priority || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [directories, searchTerm, sortBy, sortOrder, filterPriority]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading classified platforms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏷️ Classified Platforms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover and submit to 124+ classified advertising platforms across Australia. 
            Reach local audiences and boost your business visibility through targeted classified ads.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.submitted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🎯 Why Use Classified Platforms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Targeted Reach</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reach local Australian audiences with targeted classified advertisements
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cost Effective</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Many platforms offer free or low-cost advertising options
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get immediate visibility and engagement from local customers
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search classified platforms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 w-full"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterPriority('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPriority === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPriority('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPriority === 'high'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilterPriority('medium')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPriority === 'medium'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilterPriority('low')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPriority === 'low'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Low Priority
              </button>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Sort by:</span>
            {[
              { key: 'priority', label: 'Priority' },
              { key: 'name', label: 'Name' },
              { key: 'daScore', label: 'DA Score' },
              { key: 'totalSubmissions', label: 'Submissions' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleSort(option.key as typeof sortBy)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  sortBy === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
                {sortBy === option.key && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredDirectories.length} of {directories.length} classified platforms
          </p>
        </div>

        {/* Debug Directories Flow */}

        {/* Directory Grid */}
        <DirectoryGrid
          directories={filteredDirectories}
          viewMode={viewMode}
          classification="Classified"
        />
      </div>
    </div>
  );
};

export default Classified;