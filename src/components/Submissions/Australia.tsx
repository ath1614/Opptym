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

interface AustraliaSubmission {
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
  postcode: string;
  description: string;
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

export default function Australia() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<AustraliaSubmission[]>([]);
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
    postcode: '',
    description: '',
    notes: ''
  });

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
      
      // Filter for Australia submissions and ensure all have required fields
      const australiaSubmissions = response.data
        .filter((submission: any) => submission.classification === 'australia')
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
            postcode: submission.postcode || submission.zipCode || '',
            description: submission.description || '',
            status: submission.status || 'pending',
            submittedAt: submission.submittedAt || new Date().toISOString(),
            approvedAt: submission.approvedAt,
            notes: submission.notes || ''
          };
        });
      
      setSubmissions(australiaSubmissions);
    } catch (error) {
      console.error('Error fetching Australia submissions:', error);
      showPopup('Failed to load Australia submissions', 'error');
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
    const platformName = submission.platformName || '';
    const businessName = submission.businessName || '';
    const searchLower = searchTerm.toLowerCase();
    
    return platformName.toLowerCase().includes(searchLower) ||
           businessName.toLowerCase().includes(searchLower);
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
        classification: 'australia',
        directoryName: formData.platformName,
        directoryUrl: formData.platformUrl,
        businessName: formData.businessName,
        businessUrl: formData.businessUrl,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.postcode,
        description: formData.description,
        notes: formData.notes,
        status: 'pending'
      };

      await axios.post('/api/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Australia submission created successfully!', 'success');
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
        postcode: '',
        description: '',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Australia Directories</h1>
          <p className="text-gray-600 mt-2">Submit and manage your business listings across Australian directories</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Australia Submission</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="w-6 h-6 text-red-600" />
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

      {/* Available Australia Directories */}
      <DirectoryGrid
        directories={directories}
        loading={loading}
        onBookmarkletClick={() => setShowBookmarkletModal(true)}
        theme={{
          primary: 'bg-red-600',
          primaryHover: 'hover:bg-red-700',
          primaryBg: 'bg-red-100',
          primaryText: 'text-red-800'
        }}
        title="Available Australia Directories"
        emptyMessage="No Australia directories found"
      />

      {/* Search and Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Australia listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading Australia listings...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No Australia submissions found</p>
            <p className="text-sm text-gray-500">Create your first Australia submission to get started</p>
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
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          Visit Platform <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.businessName}</div>
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{submission.city}, {submission.state}</div>
                        <div className="text-sm text-gray-500">{submission.postcode}</div>
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
                        <button className="text-red-600 hover:text-red-900">
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

      {/* Create Australia Submission Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Australia Submission</h2>
            
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., TrueLocal, Yellow Pages"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://platform.com.au"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com.au"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="contact@yourbusiness.com.au"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+61 2 1234 5678"
                  />
                </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="123 Collins St"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Melbourne"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    <option value="NSW">New South Wales</option>
                    <option value="VIC">Victoria</option>
                    <option value="QLD">Queensland</option>
                    <option value="WA">Western Australia</option>
                    <option value="SA">South Australia</option>
                    <option value="TAS">Tasmania</option>
                    <option value="ACT">Australian Capital Territory</option>
                    <option value="NT">Northern Territory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="3000"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Describe your business, services, and what makes you unique..."
                  required
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
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
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Australia Submission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
