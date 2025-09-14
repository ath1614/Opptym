import React, { useState, ChangeEvent } from 'react';
import { createProject } from '../../lib/api';
import { showPopup, showConfirmPopup } from '../../utils/popup';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

type ProjectFormFields = {
  [key: string]: string;
};

type CustomField = {
  id: string;
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'url' | 'email';
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: string; // Custom validation rule
};

const initialFormState: ProjectFormFields = {
  title: '',
  url: '',
  category: '',
  email: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  targetKeywords: '',
  sitemapUrl: '',
  robotsTxtUrl: '',
  name: '',
  companyName: '',
  businessPhone: '',
  whatsapp: '',
  description: '',
  buildingName: '',
  address1: '',
  address2: '',
  address3: '',
  district: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  articleTitle: '',
  articleContent: '',
  authorName: '',
  authorBio: '',
  tags: '',
  productName: '',
  price: '',
  condition: '',
  productImageUrl: '',
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  businessHours: '',
  establishedYear: '',
  logoUrl: '',
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<ProjectFormFields>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [newCustomField, setNewCustomField] = useState<Omit<CustomField, 'id'>>({
    name: '',
    type: 'text',
    required: false,
    placeholder: '',
    validation: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addCustomField = () => {
    if (!newCustomField.name.trim()) return;
    
    const field: CustomField = {
      id: `custom_${Date.now()}`,
      ...newCustomField
    };
    
    setCustomFields(prev => [...prev, field]);
    setForm(prev => ({ ...prev, [field.id]: '' }));
    setNewCustomField({
      name: '',
      type: 'text',
      required: false,
      placeholder: '',
      validation: ''
    });
    setShowCustomFieldForm(false);
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    setForm(prev => {
      const newForm = { ...prev };
      delete newForm[fieldId];
      return newForm;
    });
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate required fields
    const requiredFields = [
      { key: 'title', label: 'Project title' },
      { key: 'url', label: 'Website URL' },
      { key: 'email', label: 'Business email' },
      { key: 'companyName', label: 'Company name' },
      { key: 'businessPhone', label: 'Business phone' },
      { key: 'description', label: 'Business description' },
      { key: 'address1', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'country', label: 'Country' },
      { key: 'pincode', label: 'Pincode' }
    ];

    for (const field of requiredFields) {
      if (!form[field.key]?.trim()) {
        setError(`${field.label} is required`);
        return;
      }
    }

    // Validate custom required fields
    for (const customField of customFields) {
      if (customField.required && !form[customField.id]?.trim()) {
        setError(`${customField.name} is required`);
        return;
      }
    }
    
    // Preprocess URL to ensure it has proper protocol
    let processedUrl = form.url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...form,
        url: processedUrl, // Use the processed URL
        keywords: form.keywords.split(',').map(k => k.trim()).filter(k => k),
        targetKeywords: form.targetKeywords.split(',').map(k => k.trim()).filter(k => k),
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await createProject(payload);
      onCreated();
      
      // Refresh dashboard data if the function exists
      if ((window as any).refreshDashboardData) {
        (window as any).refreshDashboardData();
      }
      
      onClose();
    } catch (err: any) {
      console.error('Project creation error:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error status:', err.status);
      
      // Parse error response to show specific messages
      let errorMessage = 'Please check the form and try again.';
      let showUpgradePopup = false;
      
      // Check if it's a usage limit error
      if (err.message && err.message.includes('Usage limit exceeded')) {
        showUpgradePopup = true;
        errorMessage = 'You have reached your project limit. Please upgrade your plan to create more projects.';
      } else if (err.message && err.message.includes('Trial expired')) {
        showUpgradePopup = true;
        errorMessage = 'Your trial has expired. Please upgrade to continue.';
      } else if (err.status === 429 || err.response?.status === 429) {
        // Handle 429 Too Many Requests (usage limit exceeded)
        showUpgradePopup = true;
        errorMessage = 'You have reached your project limit. Please upgrade your plan to create more projects.';
      } else if (err.message && err.message.includes('API Error:')) {
        try {
          // Extract error body from API error message
          const errorMatch = err.message.match(/API Error: \d+ [^-]+ - (.+)/);
          if (errorMatch) {
            const errorBody = errorMatch[1];
            try {
              const errorData = JSON.parse(errorBody);
              if (errorData.error === 'Usage limit exceeded') {
                showUpgradePopup = true;
                errorMessage = errorData.message || 'You have reached your project limit. Please upgrade your plan to create more projects.';
              } else if (errorData.error === 'Trial expired') {
                showUpgradePopup = true;
                errorMessage = errorData.message || 'Your trial has expired. Please upgrade to continue.';
              } else if (errorData.error === 'Invalid social media links') {
                errorMessage = errorData.message || 'Please check your social media links and try again.';
              } else if (errorData.error === 'Project title is required' || errorData.error === 'Project URL is required') {
                errorMessage = 'Please fill in all required fields and try again.';
              } else if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (parseError) {
              // If JSON parsing fails, use the raw error body
              errorMessage = errorBody;
            }
          }
        } catch (parseError) {
          console.error('Error parsing API error:', parseError);
        }
      } else if (err.response?.data) {
        // Handle axios error response data
        try {
          const errorData = err.response.data;
          if (errorData.error === 'Usage limit exceeded') {
            showUpgradePopup = true;
            errorMessage = errorData.message || 'You have reached your project limit. Please upgrade your plan to create more projects.';
          } else if (errorData.error === 'Trial expired') {
            showUpgradePopup = true;
            errorMessage = errorData.message || 'Your trial has expired. Please upgrade to continue.';
          } else if (errorData.error === 'Invalid social media links') {
            errorMessage = errorData.message || 'Please check your social media links and try again.';
          } else if (errorData.error === 'Project title is required' || errorData.error === 'Project URL is required') {
            errorMessage = 'Please fill in all required fields and try again.';
          } else if (errorData.error === 'Unauthorized: userId is missing') {
            errorMessage = 'Please refresh the page and try again.';
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('Error parsing response data:', parseError);
        }
      } else if (err.message) {
        // Handle other error messages
        if (err.message.includes('Network Error') || err.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('Unauthorized')) {
          errorMessage = 'Please refresh the page and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      if (showUpgradePopup) {
        setError('');
        // Show upgrade modal with our popup system
        showConfirmPopup(
          errorMessage + '\n\nWould you like to upgrade your plan?',
          () => {
            window.location.hash = '#pricing';
          },
          () => {
            // User cancelled, do nothing
          }
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const groupedFields = [
    {
      title: '🧠 Basic Info',
      fields: [
        { key: 'title', label: 'Project Title' },
        { key: 'url', label: 'Website URL' },
        { key: 'email', label: 'Business Email' },
        { key: 'category', label: 'Category' },
        { key: 'name', label: 'Contact Person' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'businessPhone', label: 'Phone Number' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'description', label: 'Business Description', type: 'textarea' },
      ],
    },
    {
      title: '📍 Address Details',
      fields: [
        { key: 'buildingName', label: 'Building Name' },
        { key: 'address1', label: 'Address Line 1' },
        { key: 'address2', label: 'Address Line 2' },
        { key: 'address3', label: 'Address Line 3' },
        { key: 'district', label: 'District' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'country', label: 'Country' },
        { key: 'pincode', label: 'Pincode' },
      ],
    },
    {
      title: '📊 SEO Metadata',
      fields: [
        { key: 'metaTitle', label: 'Meta Title' },
        { key: 'metaDescription', label: 'Meta Description' },
        { key: 'keywords', label: 'Keywords (comma-separated)' },
        { key: 'targetKeywords', label: 'Target Keywords' },
        { key: 'sitemapUrl', label: 'Sitemap URL' },
        { key: 'robotsTxtUrl', label: 'Robots.txt URL' },
      ],
    },
    {
      title: '📝 Article Submission',
      fields: [
        { key: 'articleTitle', label: 'Article Title' },
        { key: 'articleContent', label: 'Article Content', type: 'textarea' },
        { key: 'authorName', label: 'Author Name' },
        { key: 'authorBio', label: 'Author Bio', type: 'textarea' },
        { key: 'tags', label: 'Tags (comma-separated)' },
      ],
    },
    {
      title: '🛒 Classified Info',
      fields: [
        { key: 'productName', label: 'Product Name' },
        { key: 'price', label: 'Price' },
        { key: 'condition', label: 'Condition' },
        { key: 'productImageUrl', label: 'Product Image URL' },
      ],
    },
    {
      title: '🌐 Social Presence',
      fields: [
        { key: 'facebook', label: 'Facebook URL' },
        { key: 'twitter', label: 'Twitter URL' },
        { key: 'instagram', label: 'Instagram URL' },
        { key: 'linkedin', label: 'LinkedIn URL' },
        { key: 'youtube', label: 'YouTube URL' },
      ],
    },
    {
      title: '⚙️ Optional Enrichment',
      fields: [
        { key: 'businessHours', label: 'Business Hours' },
        { key: 'establishedYear', label: 'Established Year' },
        { key: 'logoUrl', label: 'Logo Image URL' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-primary-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Project</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {groupedFields.map(group => (
          <div key={group.title} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">{group.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map(({ key, label, type = 'text' }) => {
                const isRequired = ['title', 'url', 'email', 'companyName', 'businessPhone', 'city', 'state', 'country'].includes(key);
                return type === 'textarea' ? (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {label} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={label}
                      className={`w-full border rounded px-3 py-2 h-24 resize-none ${isRequired && !form[key].trim() ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  </div>
                ) : (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {label} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={type}
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={label}
                      className={`w-full border rounded px-3 py-2 ${isRequired && !form[key].trim() ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Fields Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">🔧 Custom Fields</h3>
            <button
              onClick={() => setShowCustomFieldForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + Add Custom Field
            </button>
          </div>

          {/* Custom Fields Form */}
          {showCustomFieldForm && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Field Name"
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={newCustomField.type}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, type: e.target.value as any }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="number">Number</option>
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                  <option value="select">Select</option>
                </select>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCustomField.required}
                    onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>
              
              {newCustomField.type === 'select' && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Options (comma-separated)"
                    value={newCustomField.options?.join(', ') || ''}
                    onChange={(e) => setNewCustomField(prev => ({ 
                      ...prev, 
                      options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                    }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={addCustomField}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Field
                </button>
                <button
                  onClick={() => setShowCustomFieldForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Display Custom Fields */}
          {customFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map(field => (
                <div key={field.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <button
                      onClick={() => removeCustomField(field.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.id}
                      value={form[field.id] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder || field.name}
                      className={`w-full border rounded px-3 py-2 h-24 resize-none ${field.required && !form[field.id]?.trim() ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.id}
                      value={form[field.id] || ''}
                      onChange={handleChange}
                      className={`w-full border rounded px-3 py-2 ${field.required && !form[field.id]?.trim() ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select {field.name}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.id}
                      value={form[field.id] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder || field.name}
                      className={`w-full border rounded px-3 py-2 ${field.required && !form[field.id]?.trim() ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;