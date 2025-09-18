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
  MapPin,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { showPopup } from '../../utils/popup';
import DirectoryGrid from './DirectoryGrid';

interface LocalBusinessSubmission {
  _id: string;
  projectId: string;
  projectName: string;
  platformName: string;
  platformUrl: string;
  businessName: string;
  businessUrl: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  businessHours: string;
  services: string;
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

export default function LocalBusiness() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<LocalBusinessSubmission[]>([]);
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
    businessName: '',
    businessUrl: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    businessHours: '',
    services: '',
    notes: '',
    classification: 'local'
  });

  useEffect(() => {
    fetchSubmissions();
    fetchProjects();
    fetchDirectories();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions?classification=local', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter for local business submissions and ensure all have required fields
      const localSubmissions = response.data
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
            businessName: submission.businessName || '',
            businessUrl: submission.businessUrl || '',
            email: submission.email || '',
            phone: submission.phone || '',
            address: submission.address || '',
            city: submission.city || '',
            state: submission.state || '',
            zipCode: submission.zipCode || '',
            description: submission.description || '',
            businessHours: submission.businessHours || '',
            services: submission.services || '',
            status: submission.status || 'pending',
            submittedAt: submission.submittedAt || new Date().toISOString(),
            approvedAt: submission.approvedAt,
            notes: submission.notes || ''
          };
        });
      
      setSubmissions(localSubmissions);
    } catch (error) {
      console.error('Error fetching local business submissions:', error);
      showPopup('Failed to load local business submissions', 'error');
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
      const response = await axios.get('/api/directories?classification=Business Listing');
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching local business directories:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const platformName = submission.platformName || '';
    const businessName = submission.businessName || '';
    const searchLower = searchTerm.toLowerCase();
    
    return platformName.toLowerCase().includes(searchLower) ||
           businessName.toLowerCase().includes(searchLower);
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
        classification: 'local',
        directoryName: formData.platformName,
        directoryUrl: formData.platformUrl,
        businessName: formData.businessName,
        businessUrl: formData.businessUrl,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        description: formData.description,
        businessHours: formData.businessHours,
        services: formData.services,
        notes: formData.notes,
        status: 'pending'
      };

      await axios.post('/api/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Local business submission created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        projectId: '',
        platformName: '',
        platformUrl: '',
        businessName: '',
        businessUrl: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        description: '',
        businessHours: '',
        services: '',
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Local Business Platforms</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Submit and manage your local business listings across various platforms</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBookmarkletModal(true)}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <MapPin className="w-5 h-5" />
            <span>Fill Form Bookmarklet</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Submission</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MapPin className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'approved').length}
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
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Local Business Platforms */}
      <DirectoryGrid
        directories={directories}
        loading={loading}
        onBookmarkletClick={() => setShowBookmarkletModal(true)}
        theme={{
          primary: 'bg-yellow-600',
          primaryHover: 'hover:bg-yellow-700',
          primaryBg: 'bg-yellow-100',
          primaryText: 'text-yellow-800'
        }}
        title="Available Local Business Platforms"
        emptyMessage="No local business platforms found"
      />

      {/* Search and Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search local business listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading local business listings...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No local business submissions found</p>
            <p className="text-sm text-gray-500">Create your first local business submission to get started</p>
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
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                          className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center"
                        >
                          Visit Platform <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.businessName}</div>
                        <div className="text-sm text-gray-500">{submission.services}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{submission.city}, {submission.state}</div>
                        <div className="text-sm text-gray-500">{submission.zipCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{submission.email}</div>
                        <div className="text-sm text-gray-500">{submission.phone}</div>
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
                        <button className="text-yellow-600 hover:text-yellow-900">
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

      {/* Create Local Business Listing Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Local Business Listing</h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Google My Business, Yelp, Foursquare"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="https://platform.com"
                    required
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="contact@yourbusiness.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="10001"
                  required
                />
              </div>

              {/* Business Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="Describe your business, services, and what makes you unique..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Mon-Fri: 9AM-5PM, Sat: 10AM-2PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services
                  </label>
                  <input
                    type="text"
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Service 1, Service 2, Service 3"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
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
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Local Business Listing</span>
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
              <h2 className="text-2xl font-bold text-gray-900">Local Business Form Bookmarklet</h2>
              <button
                onClick={() => setShowBookmarkletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">🚀 Quick Form Filling</h3>
                <p className="text-yellow-800 text-sm">
                  Drag the bookmarklet below to your browser's bookmarks bar. When you visit any local business platform, 
                  click the bookmarklet to automatically fill forms with your business data.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drag this bookmarklet to your bookmarks bar:
                  </label>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="bg-yellow-600 text-white px-4 py-2 rounded inline-block cursor-move select-none">
                      📝 Fill Local Business Form
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
    businessName: '${user?.username || 'Your Business'}',
    businessUrl: '${projects[0]?.url || 'https://yourwebsite.com'}',
    email: '${user?.email || 'your@email.com'}',
    phone: '${user?.phone || '+1234567890'}',
    address: '${user?.address || 'Your Address'}',
    city: '${user?.city || 'Your City'}',
    state: '${user?.state || 'Your State'}',
    zipCode: '${user?.zipCode || '12345'}',
    description: 'Professional local business services for ${projects[0]?.title || 'your business'}',
    businessHours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-2PM',
    services: 'Professional services, consultation, support'
  };
  
  // Auto-fill common form fields
  const fields = {
    'input[name*="name"], input[name*="business"], input[id*="name"], input[id*="business"]': data.businessName,
    'input[name*="email"], input[id*="email"]': data.email,
    'input[name*="phone"], input[id*="phone"]': data.phone,
    'input[name*="url"], input[name*="website"], input[id*="url"], input[id*="website"]': data.businessUrl,
    'input[name*="address"], textarea[name*="address"]': data.address,
    'input[name*="city"], input[id*="city"]': data.city,
    'input[name*="state"], input[id*="state"]': data.state,
    'input[name*="zip"], input[name*="postal"], input[id*="zip"], input[id*="postal"]': data.zipCode,
    'textarea[name*="description"], textarea[id*="description"]': data.description,
    'input[name*="hours"], textarea[name*="hours"]': data.businessHours,
    'input[name*="services"], textarea[name*="services"]': data.services
  };
  
  Object.entries(fields).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach(field => {
      if (field && !field.value) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
  
  alert('✅ Local business form filled successfully!');
})();`}
                    </code>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 How to use:</h4>
                  <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                    <li>Drag the bookmarklet to your browser's bookmarks bar</li>
                    <li>Visit any local business platform submission page</li>
                    <li>Click the bookmarklet in your bookmarks bar</li>
                    <li>The form will be automatically filled with your business data</li>
                    <li>Review and submit the form</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBookmarkletModal(false)}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
