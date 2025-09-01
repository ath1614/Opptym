import React, { useState } from 'react';
import { X, Plus, Globe, Settings, Save } from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface CreateDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateDirectoryModal: React.FC<CreateDirectoryModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    domain: '',
    description: '',
    category: 'business',
    country: 'Global',
    classification: 'Article Submission',
    pageRank: 3,
    daScore: 30,
    spamScore: 2,
    isPremium: false,
    requiresApproval: true,
    submissionUrl: '',
    contactEmail: '',
    submissionGuidelines: '',
    priority: 10,
    freeUserLimit: 0,
    starterUserLimit: 5,
    proUserLimit: 20,
    businessUserLimit: 50,
    enterpriseUserLimit: -1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/directories', form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup('Directory created successfully!', 'success');
      setForm({
        name: '',
        domain: '',
        description: '',
        category: 'business',
        country: 'Global',
        classification: 'Article Submission',
        pageRank: 3,
        daScore: 30,
        spamScore: 2,
        isPremium: false,
        requiresApproval: true,
        submissionUrl: '',
        contactEmail: '',
        submissionGuidelines: '',
        priority: 10,
        freeUserLimit: 0,
        starterUserLimit: 5,
        proUserLimit: 20,
        businessUserLimit: 50,
        enterpriseUserLimit: -1
      });
      onCreated();
      onClose();
    } catch (error: any) {
      showPopup(`Error creating directory: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">Create New Directory</h2>
              <p className="text-sm text-primary-600 dark:text-primary-400">Add a new directory to the submission network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-primary-800 dark:text-primary-200 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Directory Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                  placeholder="e.g., Blahoo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  required
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                  placeholder="e.g., www.blahoo.net"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                rows={3}
                placeholder="Brief description of the directory"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                >
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                >
                  <option value="Global">Global</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Classification
                </label>
                <select
                  value={form.classification}
                  onChange={(e) => setForm({ ...form, classification: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                >
                  <option value="Article Submission">Article Submission</option>
                  <option value="Web2.0">Web2.0</option>
                  <option value="Social">Social</option>
                  <option value="Local">Local</option>
                  <option value="Classified">Classified</option>
                  <option value="Q&A">Q&A</option>
                  <option value="Press Release">Press Release</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-primary-800 dark:text-primary-200 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              SEO Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Page Rank (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.pageRank}
                  onChange={(e) => setForm({ ...form, pageRank: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  DA Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.daScore}
                  onChange={(e) => setForm({ ...form, daScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Spam Score (0-17)
                </label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={form.spamScore}
                  onChange={(e) => setForm({ ...form, spamScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-primary-800 dark:text-primary-200">Submission Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Submission URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.submissionUrl}
                  onChange={(e) => setForm({ ...form, submissionUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                  placeholder="https://example.com/submit"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Submission Guidelines
              </label>
              <textarea
                value={form.submissionGuidelines}
                onChange={(e) => setForm({ ...form, submissionGuidelines: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
                rows={3}
                placeholder="Guidelines for submissions to this directory"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={form.isPremium}
                  onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                  className="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                />
                <label htmlFor="isPremium" className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Premium Directory
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={form.requiresApproval}
                  onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
                  className="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresApproval" className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Requires Approval
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Priority (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg hover:from-accent-600 hover:to-accent-700 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Directory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDirectoryModal;
