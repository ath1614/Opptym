import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DirectoryGrid from './DirectoryGrid';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Globe,
  Video,
  FileText,
  Image,
  Mic,
  Calendar,
  MessageSquare,
  Rss,
  Zap
} from 'lucide-react';

interface Directory {
  _id: string;
  name: string;
  domain: string;
  description?: string;
  pageRank?: number;
  daScore?: number;
  spamScore?: number;
  submissionUrl: string;
  category: string;
  country: string;
  priority?: number;
  isPremium?: boolean;
  status?: string;
  totalSubmissions?: number;
  successfulSubmissions?: number;
  rejectionRate?: number;
  createdAt?: string;
}

interface Submission {
  _id: string;
  directoryId: string;
  projectId: string;
  status: string;
  submittedAt: string;
  publishedAt?: string;
  directory: Directory;
}

const MoreSEO: React.FC = () => {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'daScore' | 'totalSubmissions'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Category icons mapping
  const categoryIcons: { [key: string]: React.ReactNode } = {
    'Web 2.0 Submission': <Globe className="h-5 w-5" />,
    'Q & A Websites': <MessageSquare className="h-5 w-5" />,
    'PDF Submission': <FileText className="h-5 w-5" />,
    'PPT Submission': <FileText className="h-5 w-5" />,
    'Video Submission': <Video className="h-5 w-5" />,
    'Event Submission': <Calendar className="h-5 w-5" />,
    'Podcast Submission': <Mic className="h-5 w-5" />,
    'Photo Sharing': <Image className="h-5 w-5" />,
    'Search Engine Submission': <Search className="h-5 w-5" />,
    'Infographics Submission': <Image className="h-5 w-5" />,
    'RSS Submission': <Rss className="h-5 w-5" />,
    'Ping Websites': <Zap className="h-5 w-5" />,
    'Blog Commenting': <MessageSquare className="h-5 w-5" />
  };

  // Fetch directories
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/directories', {
          headers: { Authorization: `Bearer ${token}` },
          params: { classification: 'More SEO' }
        });
        
        if (response.data) {
          setDirectories(response.data);
        }
      } catch (error) {
        console.error('Error fetching directories:', error);
        setDirectories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectories();
  }, []);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/submissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { classification: 'More SEO' }
        });
        
        if (response.data) {
          setSubmissions(response.data);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSubmissions = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const published = submissions.filter(s => s.status === 'published').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const highPriority = directories.filter(d => (d.priority || 0) >= 80).length;

    return {
      totalSubmissions,
      submitted,
      published,
      pending,
      highPriority
    };
  }, [submissions, directories]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(directories.map(d => d.category))];
    return uniqueCategories.sort();
  }, [directories]);

  // Filter and sort directories
  const filteredDirectories = useMemo(() => {
    let filtered = directories.filter(dir => {
      const matchesSearch = dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dir.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dir.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || dir.category === filterCategory;

      return matchesSearch && matchesCategory;
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
          aValue = a.totalSubmissions || 0;
          bValue = b.totalSubmissions || 0;
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
  }, [directories, searchTerm, sortBy, sortOrder, filterCategory]);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading More SEO platforms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 More SEO Platforms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover and submit to 334+ specialized SEO platforms across 13 categories. 
            From Web 2.0 submissions to podcast directories, expand your digital presence with targeted SEO strategies.
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
              <TrendingUp className="h-8 w-8 text-purple-600" />
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
            🎯 Why Use More SEO Platforms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Diverse Content Types</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit videos, PDFs, podcasts, infographics, and more across specialized platforms
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enhanced Visibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reach diverse audiences through multiple content formats and specialized directories
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Targeted Reach</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with specific communities through Q&A sites, events, and niche platforms
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Globe className="h-4 w-4" />
              All Categories ({directories.length})
            </button>
            {categories.map((category) => {
              const count = directories.filter(d => d.category === category).length;
              const highPriority = directories.filter(d => d.category === category && (d.priority || 0) >= 80).length;
              return (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    filterCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {categoryIcons[category]}
                  {category} ({count})
                  {highPriority > 0 && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">⭐{highPriority}</span>}
                </button>
              );
            })}
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
                placeholder="Search SEO platforms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-10 w-full"
              />
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
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
                    ? 'bg-purple-600 text-white'
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
            Showing {filteredDirectories.length} of {directories.length} SEO platforms
            {filterCategory !== 'all' && ` in ${filterCategory}`}
          </p>
        </div>

        {/* Directory Grid */}
        <DirectoryGrid
          directories={filteredDirectories}
          submissions={submissions}
          viewMode={viewMode}
          classification="More SEO"
        />
      </div>
    </div>
  );
};

export default MoreSEO;