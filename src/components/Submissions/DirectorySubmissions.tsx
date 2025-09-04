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
  AlertCircle,
  ExternalLink,
  X
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
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    directoryName: '',
    directoryUrl: '',
    classification: 'directory',
    category: 'general',
    businessName: '',
    businessUrl: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });

  // Directory Submissions only shows directory classification
  const classification = 'directory';

  useEffect(() => {
    fetchSubmissions();
    fetchProjects();
    fetchDirectories();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/submissions?classification=${classification}`, {
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
      
      setProjects([]);
    }
  };

  const fetchDirectories = async () => {
    try {
      const token = localStorage.getItem('token');
      // Map frontend classification to database classification
      const dbClassification = 'Business'; // directory maps to Business in database
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
    const directoryName = submission.directoryName || '';
    const projectName = submission.projectName || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = directoryName.toLowerCase().includes(searchLower) ||
                         projectName.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const filteredDirectories = directories.filter(directory => {
    const directoryName = directory.name || '';
    const searchLower = searchTerm.toLowerCase();
    
    return directoryName.toLowerCase().includes(searchLower);
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
        directoryName: formData.directoryName,
        directoryUrl: formData.directoryUrl,
        classification: formData.classification,
        category: formData.category,
        businessName: formData.businessName,
        businessUrl: formData.businessUrl,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        notes: formData.notes,
        status: 'pending'
      };

      await axios.post('/api/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Directory submission created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        projectId: '',
        directoryName: '',
        directoryUrl: '',
        classification: 'directory',
        category: 'general',
        businessName: '',
        businessUrl: '',
        email: '',
        phone: '',
        description: '',
        address: '',
        city: '',
        zipCode: '',
        notes: ''
      });
      
      // Add the new submission to the list immediately for better UX
      const newSubmission = {
        _id: `temp-${Date.now()}-${Math.random()}`,
        projectId: formData.projectId,
        projectName: projects.find(p => p._id === formData.projectId)?.title || 'Unknown Project',
        directoryName: formData.directoryName,
        directoryUrl: formData.directoryUrl,
        classification: formData.classification,
        category: formData.category,
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
        notes: formData.notes
      };
      
      setSubmissions(prev => [newSubmission, ...prev]);
      
      // Also refresh from server to get the real data
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Directory Platforms</h1>
          <p className="text-gray-600 mt-2">Submit your business to directory platforms and track your submissions</p>
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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Submission</span>
          </button>
        </div>
      </div>

      {/* Available Directories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Directory Platforms</h3>
            <p className="text-gray-600 text-sm">Click "Fill Form" to get the bookmarklet for each directory</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Directories: {filteredDirectories.length}</span>
            <span>Your Submissions: {filteredSubmissions.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading directories...</p>
          </div>
        ) : filteredDirectories.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No directory platforms available</p>
            <p className="text-sm text-gray-500">Contact admin to add directory platforms</p>
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

      {/* Create Submission Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Directory Submission</h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Directory Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Directory Name *
                  </label>
                  <input
                    type="text"
                    name="directoryName"
                    value={formData.directoryName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Google My Business"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Directory URL *
                  </label>
                  <input
                    type="url"
                    name="directoryUrl"
                    value={formData.directoryUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://business.google.com"
                    required
                  />
                </div>
              </div>

              {/* Classification and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classification *
                  </label>
                  <input
                    type="text"
                    name="classification"
                    value="directory"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="business">Business</option>
                    <option value="local">Local</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your business name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business URL *
                  </label>
                  <input
                    type="url"
                    name="businessUrl"
                    value={formData.businessUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@yourbusiness.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your business, services, and what makes you unique..."
                  required
                />
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Submission</span>
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Submission Bookmarklet</h3>
                    <p className="text-gray-600 text-sm">
                      Drag the button below to your bookmarks bar for instant directory submissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href="javascript:(function(){var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js';document.head.appendChild(script);})();"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-move"
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
                      📌 Opptym Bookmarklet
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Drag the "📌 Opptym Bookmarklet" button to your browser's bookmarks bar</li>
                    <li>Visit any directory website (Google My Business, Yelp, etc.)</li>
                    <li>Click the bookmarklet in your bookmarks bar to auto-fill the submission form</li>
                    <li>Review and submit your listing</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The bookmarklet will automatically detect form fields on directory websites and fill them with your business information.
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
