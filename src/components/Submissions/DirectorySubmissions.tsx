import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Globe, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface Submission {
  _id: string;
  projectId: string;
  projectName: string;
  directoryName: string;
  directoryUrl: string;
  classification: string;
  category: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  backlinkUrl?: string;
  notes?: string;
}

interface Project {
  _id: string;
  title: string;
  url: string;
  category: string;
}

export default function DirectorySubmissions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const classifications = [
    { id: 'all', name: 'All Classifications', icon: Globe, color: 'bg-blue-500' },
    { id: 'directory', name: 'Directory Platforms', icon: FileText, color: 'bg-green-500' },
    { id: 'article', name: 'Article Platforms', icon: FileText, color: 'bg-purple-500' },
    { id: 'press', name: 'Press Release', icon: FileText, color: 'bg-orange-500' },
    { id: 'australia', name: 'Australia', icon: FileText, color: 'bg-red-500' },
    { id: 'classified', name: 'Classified Ads', icon: FileText, color: 'bg-indigo-500' },
    { id: 'qa', name: 'Q&A Platforms', icon: FileText, color: 'bg-pink-500' },
    { id: 'social', name: 'Social Media', icon: FileText, color: 'bg-teal-500' },
    { id: 'local', name: 'Local Business', icon: FileText, color: 'bg-yellow-500' }
  ];

  useEffect(() => {
    fetchSubmissions();
    fetchProjects();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure all submissions have required fields with fallbacks
      const safeSubmissions = response.data.map((submission: any) => {
        // Handle projectId which might be an object or string
        let projectId = '';
        let projectName = 'Unnamed Project';
        
        if (submission.projectId) {
          if (typeof submission.projectId === 'object') {
            const projectObj = submission.projectId as { _id?: string; title?: string };
            if (projectObj._id) {
              projectId = projectObj._id;
              projectName = projectObj.title || submission.projectName || 'Unnamed Project';
            }
          } else {
            projectId = submission.projectId;
            projectName = submission.projectName || 'Unnamed Project';
          }
        }
        
        return {
          _id: submission._id || `temp-${Date.now()}-${Math.random()}`,
          projectId: projectId,
          projectName: projectName,
          directoryName: submission.directoryName || 'Unnamed Directory',
          directoryUrl: submission.directoryUrl || '',
          classification: submission.classification || 'directory',
          category: submission.category || 'general',
          status: submission.status || 'pending',
          submittedAt: submission.submittedAt || new Date().toISOString(),
          approvedAt: submission.approvedAt,
          backlinkUrl: submission.backlinkUrl,
          notes: submission.notes || ''
        };
      });
      
      setSubmissions(safeSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showPopup('Failed to load submissions', 'error');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesClassification = selectedClassification === 'all' || submission.classification === selectedClassification;
    
    // Safe search with null checks
    const directoryName = submission.directoryName || '';
    const projectName = submission.projectName || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = directoryName.toLowerCase().includes(searchLower) ||
                         projectName.toLowerCase().includes(searchLower);
    
    return matchesClassification && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Directory Submissions</h1>
          <p className="text-gray-600 mt-2">Manage and track your directory submissions across all platforms</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Submission</span>
        </button>
      </div>

      {/* Classification Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Classification</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {classifications.map((classification) => {
            const Icon = classification.icon;
            return (
              <button
                key={classification.id}
                onClick={() => setSelectedClassification(classification.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                  selectedClassification === classification.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${classification.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {classification.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {filteredSubmissions.length}</span>
            <span>Approved: {filteredSubmissions.filter(s => s.status === 'approved').length}</span>
            <span>Pending: {filteredSubmissions.filter(s => s.status === 'pending').length}</span>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions found</p>
            <p className="text-sm text-gray-500">Create your first submission to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Directory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.projectName}</div>
                        <div className="text-sm text-gray-500">
                          {submission.projectId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.directoryName}</div>
                        <a 
                          href={submission.directoryUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Visit Directory
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {submission.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Submission Form Modal would go here */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Submission</h2>
            {/* Form content would go here */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
