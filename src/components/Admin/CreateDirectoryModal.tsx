import React, { useState, useEffect } from 'react';
import { X, Plus, Globe, Settings, Save } from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';
import { handleFormError } from '../../utils/errorHandler';

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
    classification: 'Directory Submission',
    pageRank: 3,
    daScore: 30,
    spamScore: 2,
    isPremium: false,
    requiresApproval: true,
    submissionUrl: '',
    contactEmail: '',
    submissionGuidelines: '',
    requiredFields: [],
    priority: 10,
    freeUserLimit: 0,
    starterUserLimit: 5,
    proUserLimit: 20,
    businessUserLimit: 50,
    enterpriseUserLimit: -1
  });
  const [loading, setLoading] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string>('');
  const [checkingName, setCheckingName] = useState(false);

  // Function to generate alternative directory names
  const generateAlternativeNames = (baseName: string): string[] => {
    const alternatives = [];
    const timestamp = new Date().getTime().toString().slice(-4);
    
    alternatives.push(`${baseName} ${timestamp}`);
    alternatives.push(`${baseName} Directory`);
    alternatives.push(`${baseName} Listing`);
    alternatives.push(`${baseName} Portal`);
    alternatives.push(`${baseName} Hub`);
    
    return alternatives;
  };

  // Function to check if directory name exists
  const checkDirectoryName = async (name: string) => {
    if (!name || name.length < 3) {
      setNameError('');
      return;
    }

    setCheckingName(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/directories?search=${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const existingDirectory = response.data.find((dir: any) => 
        dir.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingDirectory) {
        setNameError(`Directory "${name}" already exists`);
        const alternatives = generateAlternativeNames(name);
        setSuggestedNames(alternatives);
      } else {
        setNameError('');
        setSuggestedNames([]);
      }
    } catch (error) {
      console.error('Error checking directory name:', error);
      setNameError('');
    } finally {
      setCheckingName(false);
    }
  };

  // Function to use a suggested name
  const useSuggestedName = (suggestedName: string) => {
    setForm({ ...form, name: suggestedName });
    setSuggestedNames([]);
    setNameError('');
  };

  // Debounced effect to check directory name
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.name) {
        checkDirectoryName(form.name);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [form.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!form.name || !form.domain || !form.submissionUrl) {
      showPopup('Please fill in all required fields: Name, Domain, and Submission URL', 'error');
      setLoading(false);
      return;
    }

    // Check for name conflicts
    if (nameError) {
      showPopup(`Cannot create directory: ${nameError}`, 'error');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🚀 Creating directory with data:', form);
      console.log('🔗 Using API endpoint: /api/admin/directories');
      console.log('🔑 Token exists:', !!token);
      console.log('📋 Required fields check:', {
        name: !!form.name,
        domain: !!form.domain,
        submissionUrl: !!form.submissionUrl
      });
      
      const response = await axios.post('/api/admin/directories', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Directory created successfully:', response.data);

      showPopup('Directory created successfully! 🎉', 'success');
      setForm({
        name: '',
        domain: '',
        description: '',
        category: 'business',
        country: 'Global',
        classification: 'Directory Submission',
        pageRank: 3,
        daScore: 30,
        spamScore: 2,
        isPremium: false,
        requiresApproval: true,
        submissionUrl: '',
        contactEmail: '',
        submissionGuidelines: '',
        requiredFields: [],
        priority: 10,
        freeUserLimit: 0,
        starterUserLimit: 5,
        proUserLimit: 20,
        businessUserLimit: 50,
        enterpriseUserLimit: -1
      });
      setNameError('');
      setSuggestedNames([]);
      onCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Directory creation error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Handle duplicate name error specifically
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        const alternatives = generateAlternativeNames(form.name);
        setSuggestedNames(alternatives);
        const fullErrorMessage = `Directory name "${form.name}" already exists.\n\nSuggested alternatives:\n${alternatives.slice(0, 3).map(name => `• ${name}`).join('\n')}`;
        showPopup(fullErrorMessage, 'error');
      } else if (error.response?.status === 400) {
        // Handle other validation errors
        const errorMessage = error.response?.data?.error || 'Validation failed. Please check your input.';
        showPopup(`❌ ${errorMessage}`, 'error');
      } else {
        // Use comprehensive error handler for all other errors
        handleFormError(error, 'Directory Creation');
      }
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
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-primary-700 dark:text-white ${
                      nameError 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Blahoo"
                  />
                  {checkingName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
                
                {/* Suggested Names */}
                {suggestedNames.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Suggested names:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedNames.slice(0, 3).map((name, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => useSuggestedName(name)}
                          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  <option value="entertainment">Entertainment</option>
                  <option value="sports">Sports</option>
                  <option value="travel">Travel</option>
                  <option value="food">Food</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="other">Other</option>
                  <option value="Web 2.0 Submission">Web 2.0 Submission</option>
                  <option value="Q & A Websites">Q & A Websites</option>
                  <option value="PDF Submission">PDF Submission</option>
                  <option value="PPT Submission">PPT Submission</option>
                  <option value="Video Submission">Video Submission</option>
                  <option value="Event Submission">Event Submission</option>
                  <option value="Podcast Submission">Podcast Submission</option>
                  <option value="Photo Sharing">Photo Sharing</option>
                  <option value="Search Engine Submission">Search Engine Submission</option>
                  <option value="Infographics Submission">Infographics Submission</option>
                  <option value="RSS Submission">RSS Submission</option>
                  <option value="Ping Websites">Ping Websites</option>
                  <option value="Blog Commenting">Blog Commenting</option>
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
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Japan">Japan</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Finland">Finland</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Austria">Austria</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Ireland">Ireland</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Singapore">Singapore</option>
                  <option value="South Korea">South Korea</option>
                  <option value="China">China</option>
                  <option value="Russia">Russia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Algeria">Algeria</option>
                  <option value="Libya">Libya</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Angola">Angola</option>
                  <option value="Congo">Congo</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Chad">Chad</option>
                  <option value="Niger">Niger</option>
                  <option value="Mali">Mali</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Ivory Coast">Ivory Coast</option>
                  <option value="Togo">Togo</option>
                  <option value="Benin">Benin</option>
                  <option value="Central African Republic">Central African Republic</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                  <option value="Cape Verde">Cape Verde</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Eswatini">Eswatini</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Other">Other</option>
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
                  <option value="Directory Submission">Directory Submission</option>
                  <option value="Article Submission">Article Submission</option>
                  <option value="Press Release">Press Release</option>
                  <option value="BookMarking">BookMarking</option>
                  <option value="Business Listing">Business Listing</option>
                  <option value="Classified">Classified</option>
                  <option value="More SEO">More SEO</option>
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
              disabled={loading || !!nameError || checkingName}
              className="px-6 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg hover:from-accent-600 hover:to-accent-700 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {loading ? 'Creating...' : 
                 checkingName ? 'Checking name...' :
                 nameError ? 'Fix name error' :
                 'Create Directory'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDirectoryModal;
