import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Star,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { BASE_URL } from '../../lib/api';
import axios from 'axios';

interface Directory {
  _id: string;
  name: string;
  domain: string;
  description?: string;
  category: string;
  pageRank: number;
  daScore: number;
  spamScore: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  isPremium: boolean;
  requiresApproval: boolean;
  submissionUrl: string;
  contactEmail?: string;
  totalSubmissions: number;
  successfulSubmissions: number;
  rejectionRate: number;
  createdAt: string;
  updatedAt: string;
}

interface DirectoryForm {
  name: string;
  domain: string;
  description: string;
  category: string;
  pageRank: number;
  daScore: number;
  spamScore: number;
  isPremium: boolean;
  requiresApproval: boolean;
  submissionUrl: string;
  contactEmail: string;
  submissionGuidelines: string;
  freeUserLimit: number;
  starterUserLimit: number;
  proUserLimit: number;
  businessUserLimit: number;
  enterpriseUserLimit: number;
}

const categories = [
  'business', 'technology', 'health', 'education', 'finance', 
  'entertainment', 'sports', 'travel', 'food', 'lifestyle', 'other'
];

export default function DirectoryManagement() {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDirectory, setEditingDirectory] = useState<Directory | null>(null);
  const [formData, setFormData] = useState<DirectoryForm>({
    name: '',
    domain: '',
    description: '',
    category: 'business',
    pageRank: 0,
    daScore: 0,
    spamScore: 0,
    isPremium: false,
    requiresApproval: true,
    submissionUrl: '',
    contactEmail: '',
    submissionGuidelines: '',
    freeUserLimit: 0,
    starterUserLimit: 5,
    proUserLimit: 20,
    businessUserLimit: 50,
    enterpriseUserLimit: -1
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/admin/directories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching directories:', error);
      setErrorMessage('Failed to fetch directories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDirectory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/admin/directories`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMessage('Directory created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchDirectories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to create directory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDirectory = async () => {
    if (!editingDirectory) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/admin/directories/${editingDirectory._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMessage('Directory updated successfully!');
      setShowEditModal(false);
      setEditingDirectory(null);
      resetForm();
      fetchDirectories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update directory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDirectory = async (directoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this directory?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/admin/directories/${directoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMessage('Directory deleted successfully!');
      fetchDirectories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to delete directory');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      description: '',
      category: 'business',
      pageRank: 0,
      daScore: 0,
      spamScore: 0,
      isPremium: false,
      requiresApproval: true,
      submissionUrl: '',
      contactEmail: '',
      submissionGuidelines: '',
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1
    });
  };

  const openEditModal = (directory: Directory) => {
    setEditingDirectory(directory);
    setFormData({
      name: directory.name,
      domain: directory.domain,
      description: directory.description || '',
      category: directory.category,
      pageRank: directory.pageRank,
      daScore: directory.daScore,
      spamScore: directory.spamScore,
      isPremium: directory.isPremium,
      requiresApproval: directory.requiresApproval,
      submissionUrl: directory.submissionUrl,
      contactEmail: directory.contactEmail || '',
      submissionGuidelines: '',
      freeUserLimit: 0,
      starterUserLimit: 5,
      proUserLimit: 20,
      businessUserLimit: 50,
      enterpriseUserLimit: -1
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredDirectories = directories.filter(directory => {
    const matchesSearch = directory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         directory.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || directory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && directories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Directory Management</h2>
          <p className="text-gray-600">Manage directories and their submission settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Directory</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search directories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-modern"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directories List */}
      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Directory</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Metrics</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Submissions</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDirectories.map((directory) => (
                <tr key={directory._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{directory.name}</p>
                        <p className="text-sm text-gray-500">{directory.domain}</p>
                        {directory.isPremium && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 capitalize">{directory.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">PR:</span>
                        <span className="text-sm font-medium">{directory.pageRank}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">DA:</span>
                        <span className="text-sm font-medium">{directory.daScore}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(directory.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(directory.status)}`}>
                        {directory.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Target className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium">{directory.totalSubmissions}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-sm text-gray-600">{directory.successfulSubmissions}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(directory)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDirectory(directory._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Directory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Directory</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateDirectory(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Directory Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="select-modern"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission URL</label>
                  <input
                    type="url"
                    value={formData.submissionUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, submissionUrl: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Rank</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pageRank}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageRank: parseInt(e.target.value) }))}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DA Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.daScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, daScore: parseInt(e.target.value) }))}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea-modern"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                    Premium Directory
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
                    Requires Approval
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Create Directory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Directory Modal */}
      {showEditModal && editingDirectory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Directory</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateDirectory(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Directory Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="select-modern"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission URL</label>
                  <input
                    type="url"
                    value={formData.submissionUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, submissionUrl: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Rank</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pageRank}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageRank: parseInt(e.target.value) }))}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DA Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.daScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, daScore: parseInt(e.target.value) }))}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea-modern"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="editIsPremium" className="text-sm font-medium text-gray-700">
                    Premium Directory
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editRequiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="editRequiresApproval" className="text-sm font-medium text-gray-700">
                    Requires Approval
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span>Update Directory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 