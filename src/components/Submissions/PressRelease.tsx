import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Plus, 
  Search, 
  Globe,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Megaphone,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface PressReleaseSubmission {
  _id: string;
  projectId: string;
  projectName: string;
  platformName: string;
  platformUrl: string;
  pressReleaseTitle: string;
  pressReleaseContent: string;
  status: 'draft' | 'submitted' | 'published' | 'rejected';
  submittedAt: string;
  publishedAt?: string;
  publishedUrl?: string;
  notes?: string;
}

interface Project {
  _id: string;
  title: string;
  url: string;
  category: string;
}

export default function PressRelease() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PressReleaseSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    platformName: '',
    platformUrl: '',
    pressReleaseTitle: '',
    pressReleaseContent: '',
    notes: ''
  });

  useEffect(() => {
    fetchSubmissions();
    fetchProjects();
    fetchDirectories();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions?classification=press', {
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
          platformName: submission.platformName || 'Unnamed Platform',
          platformUrl: submission.platformUrl || '',
          pressReleaseTitle: submission.pressReleaseTitle || 'Untitled Press Release',
          pressReleaseContent: submission.pressReleaseContent || '',
          status: submission.status || 'draft',
          submittedAt: submission.submittedAt || new Date().toISOString(),
          publishedAt: submission.publishedAt,
          publishedUrl: submission.publishedUrl,
          notes: submission.notes || ''
        };
      });
      
      setSubmissions(safeSubmissions);
    } catch (error) {
      console.error('Error fetching press release submissions:', error);
      showPopup('Failed to load press release submissions', 'error');
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

  const fetchDirectories = async () => {
    try {
      const token = localStorage.getItem('token');
      // Map frontend classification to database classification
      const dbClassification = 'Press Release'; // press maps to Press Release in database
      const response = await axios.get(`/api/directories?classification=${dbClassification}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching directories:', error);
      setDirectories([]);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    // Safe search with null checks
    const platformName = submission.platformName || '';
    const pressReleaseTitle = submission.pressReleaseTitle || '';
    const searchLower = searchTerm.toLowerCase();
    
    return platformName.toLowerCase().includes(searchLower) ||
           pressReleaseTitle.toLowerCase().includes(searchLower);
  });

  const filteredDirectories = directories.filter(directory => {
    const directoryName = directory.name || '';
    const searchLower = searchTerm.toLowerCase();
    
    return directoryName.toLowerCase().includes(searchLower);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      showPopup('Please select a project', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submissionData = {
        projectId: selectedProject,
        classification: 'press',
        ...formData
      };

      await axios.post('/api/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Press release submission created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        platformName: '',
        platformUrl: '',
        pressReleaseTitle: '',
        pressReleaseContent: '',
        notes: ''
      });
      setSelectedProject('');
      fetchSubmissions();
    } catch (error) {
      console.error('Error creating submission:', error);
      showPopup('Failed to create submission', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Press Release</h1>
          <p className="text-gray-600 mt-2">Submit and manage your press releases across various platforms</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBookmarkletModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Globe className="w-5 h-5" />
            <span>Fill Form Bookmarklet</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Press Release</span>
          </button>
        </div>
      </div>

      {/* Available Press Release Platforms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Press Release Platforms</h3>
            <p className="text-gray-600 text-sm">Click "Fill Form" to get the bookmarklet for each platform</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Platforms: {filteredDirectories.length}</span>
            <span>Your Submissions: {filteredSubmissions.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading platforms...</p>
          </div>
        ) : filteredDirectories.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No press release platforms available</p>
            <p className="text-sm text-gray-500">Contact admin to add press release platforms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectories.map((directory) => (
              <div key={directory._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{directory.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{directory.domain}</p>
                    {directory.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{directory.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {directory.pageRank && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PR {directory.pageRank}</span>
                    )}
                    {directory.daScore && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DA {directory.daScore}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <a
                      href={directory.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </a>
                  </div>
                  <button
                    onClick={() => setShowBookmarkletModal(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Fill Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Press Releases</p>
              <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search press releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading press releases...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No press release submissions found</p>
            <p className="text-sm text-gray-500">Create your first press release submission to get started</p>
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
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Press Release Title
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
                        <div className="text-sm text-gray-500">{submission.projectId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.platformName}</div>
                        <a 
                          href={submission.platformUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                        >
                          Visit Platform <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={submission.pressReleaseTitle}>
                          {submission.pressReleaseTitle}
                        </div>
                      </div>
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
                        <button className="text-orange-600 hover:text-orange-900">
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

      {/* Create Press Release Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Press Release</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title} - {project.url}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name *
                  </label>
                  <input
                    type="text"
                    value={formData.platformName}
                    onChange={(e) => setFormData({...formData, platformName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., PR Newswire, Business Wire"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL *
                  </label>
                  <input
                    type="url"
                    value={formData.platformUrl}
                    onChange={(e) => setFormData({...formData, platformUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://platform.com"
                    required
                  />
                </div>
              </div>

              {/* Press Release Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Press Release Title *
                </label>
                <input
                  type="text"
                  value={formData.pressReleaseTitle}
                  onChange={(e) => setFormData({...formData, pressReleaseTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your press release title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Press Release Content *
                </label>
                <textarea
                  value={formData.pressReleaseContent}
                  onChange={(e) => setFormData({...formData, pressReleaseContent: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Write your press release content here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any additional notes or instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Create Press Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bookmarklet Modal */}
      {showBookmarkletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Fill Form Bookmarklet</h2>
              <button
                onClick={() => setShowBookmarkletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-indigo-50 rounded-lg border border-orange-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Press Release Bookmarklet</h3>
                    <p className="text-gray-600 text-sm">
                      Drag the button below to your bookmarks bar for instant press release submissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href="javascript:(function(){var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js';document.head.appendChild(script);})();"
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium cursor-move"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', e.currentTarget.href);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        showPopup('Drag this button to your bookmarks bar!', 'info');
                      }}
                    >
                      📌 Press Release Bookmarklet
                    </a>
                    <button
                      onClick={() => {
                        const bookmarkletCode = `javascript:(function(){var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js';document.head.appendChild(script);})();`;
                        navigator.clipboard.writeText(bookmarkletCode).then(() => {
                          showPopup('Bookmarklet code copied to clipboard!', 'success');
                        }).catch(() => {
                          showPopup('Failed to copy to clipboard', 'error');
                        });
                      }}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg border border-orange-100">
                  <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Drag the "📌 Press Release Bookmarklet" button to your browser's bookmarks bar</li>
                    <li>Visit any press release platform (PR Newswire, Business Wire, etc.)</li>
                    <li>Click the bookmarklet in your bookmarks bar to auto-fill the submission form</li>
                    <li>Review and submit your press release</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The bookmarklet will automatically detect form fields on press release platforms and fill them with your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
