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
  Share2,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { showPopup } from '../../utils/popup';
import DirectoryGrid from './DirectoryGrid';
import GlobalSubmissionStats from '../Common/GlobalSubmissionStats';

interface SocialMediaSubmission {
  _id: string;
  projectId: string;
  projectName: string;
  platformName: string;
  platformUrl: string;
  postTitle: string;
  postContent: string;
  postType: string;
  hashtags: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  notes?: string;
}

interface Project {
  _id: string;
  title: string;
  url: string;
  category: string;
}

export default function SocialMedia() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SocialMediaSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    platformName: '',
    platformUrl: '',
    postTitle: '',
    postContent: '',
    postType: '',
    hashtags: '',
    notes: '',
    classification: 'social'
  });

  useEffect(() => {
    fetchSubmissions();
    fetchProjects();
    fetchDirectories();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions?classification=social', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter for social media submissions and ensure all have required fields
      const socialSubmissions = response.data
        .map((submission: any) => {
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
            platformName: submission.platformName || submission.directoryName || 'Unnamed Platform',
            platformUrl: submission.platformUrl || submission.directoryUrl || '',
            postTitle: submission.postTitle || submission.businessName || 'Untitled Post',
            postContent: submission.postContent || submission.description || '',
            postType: submission.postType || 'post',
            hashtags: submission.hashtags || '',
            status: submission.status || 'pending',
            submittedAt: submission.submittedAt || new Date().toISOString(),
            approvedAt: submission.approvedAt,
            notes: submission.notes || ''
          };
        });
      
      setSubmissions(socialSubmissions);
    } catch (error) {
      console.error('Error fetching social media submissions:', error);
      showPopup('Failed to load social media submissions', 'error');
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
      const response = await axios.get('/api/directories?classification=BookMarking');
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching social media directories:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const platformName = submission.platformName || '';
    const postTitle = submission.postTitle || '';
    const searchLower = searchTerm.toLowerCase();
    
    return platformName.toLowerCase().includes(searchLower) ||
           postTitle.toLowerCase().includes(searchLower);
  });

  const filteredDirectories = directories.filter(directory => {
    const name = directory.name || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted':
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
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      showPopup('Please select a project', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submissionData = {
        projectId: formData.projectId,
        classification: 'social',
        directoryName: formData.platformName,
        directoryUrl: formData.platformUrl,
        businessName: formData.postTitle,
        description: formData.postContent,
        postType: formData.postType,
        hashtags: formData.hashtags,
        notes: formData.notes,
        status: 'pending'
      };

      await axios.post('/api/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Social media submission created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        projectId: '',
        platformName: '',
        platformUrl: '',
        postTitle: '',
        postContent: '',
        postType: '',
        hashtags: '',
        notes: ''
      });
      fetchSubmissions();
    } catch (error) {
      console.error('Error creating submission:', error);
      showPopup('Failed to create submission', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Media Platforms</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Submit and manage your social media content across various platforms</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBookmarkletModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Fill Form Bookmarklet</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Submission</span>
          </button>
        </div>
      </div>

          {/* Global Submission Stats */}
          <GlobalSubmissionStats />

      {/* Available Social Media Platforms */}
      <DirectoryGrid
        directories={directories}
        loading={loading}
        onBookmarkletClick={() => setShowBookmarkletModal(true)}
        theme={{
          primary: 'bg-purple-600',
          primaryHover: 'hover:bg-purple-700',
          primaryBg: 'bg-purple-100',
          primaryText: 'text-purple-800'
        }}
        title="Available Social Media Platforms"
        emptyMessage="No social media platforms found"
      />

      {/* Search and Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search social media posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading social media posts...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No social media submissions found</p>
            <p className="text-sm text-gray-500">Create your first social media submission to get started</p>
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
                    Post Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                          className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                        >
                          Visit Platform <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={submission.postTitle}>
                          {submission.postTitle}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {submission.postType}
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
                        <button className="text-teal-600 hover:text-teal-900">
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

      {/* Create Social Media Post Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Social Media Post</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project *
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title} ({project.url})
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name *
                  </label>
                  <input
                    type="text"
                    name="platformName"
                    value={formData.platformName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., Facebook, Twitter, LinkedIn, Instagram"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL *
                  </label>
                  <input
                    type="url"
                    name="platformUrl"
                    value={formData.platformUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="https://platform.com"
                    required
                  />
                </div>
              </div>

              {/* Post Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  name="postTitle"
                  value={formData.postTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content *
                </label>
                <textarea
                  rows={6}
                  name="postContent"
                  value={formData.postContent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Write your social media post content..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type *
                  </label>
                  <select
                    name="postType"
                    value={formData.postType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Post Type</option>
                    <option value="post">Regular Post</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel/Video</option>
                    <option value="poll">Poll</option>
                    <option value="event">Event</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    name="hashtags"
                    value={formData.hashtags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Any additional information or special instructions..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Social Media Post</span>
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
              <h2 className="text-2xl font-bold text-gray-900">Social Media Form Bookmarklet</h2>
              <button
                onClick={() => setShowBookmarkletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">🚀 Quick Form Filling</h3>
                <p className="text-purple-800 text-sm">
                  Drag the bookmarklet below to your browser's bookmarks bar. When you visit any social media platform, 
                  click the bookmarklet to automatically fill forms with your project data.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drag this bookmarklet to your bookmarks bar:
                  </label>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded inline-block cursor-move select-none">
                      📝 Fill Social Media Form
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Drag this button to your bookmarks bar</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or copy this JavaScript code:
                  </label>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>
                      {`javascript:(function(){
  const data = {
    projectName: '${projects[0]?.title || 'Your Project'}',
    businessName: '${user?.username || 'Your Business'}',
    description: 'Professional social media content for ${projects[0]?.title || 'your project'}',
    url: '${projects[0]?.url || 'https://yourwebsite.com'}',
    email: '${user?.email || 'your@email.com'}',
    phone: '${user?.phone || '+1234567890'}',
    address: '${user?.address || 'Your Address'}'
  };
  
  // Auto-fill common form fields
  const fields = {
    'input[name*="name"], input[name*="title"], input[id*="name"], input[id*="title"]': data.businessName,
    'input[name*="email"], input[id*="email"]': data.email,
    'input[name*="phone"], input[id*="phone"]': data.phone,
    'input[name*="url"], input[name*="website"], input[id*="url"], input[id*="website"]': data.url,
    'textarea[name*="description"], textarea[id*="description"]': data.description,
    'input[name*="address"], textarea[name*="address"]': data.address
  };
  
  Object.entries(fields).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach(field => {
      if (field && !field.value) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
  
  alert('✅ Social media form filled successfully!');
})();`}
                    </code>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 How to use:</h4>
                  <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                    <li>Drag the bookmarklet to your browser's bookmarks bar</li>
                    <li>Visit any social media platform submission page</li>
                    <li>Click the bookmarklet in your bookmarks bar</li>
                    <li>The form will be automatically filled with your project data</li>
                    <li>Review and submit the form</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBookmarkletModal(false)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
