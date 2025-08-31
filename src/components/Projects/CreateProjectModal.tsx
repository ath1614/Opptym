import React, { useState, ChangeEvent } from 'react';
import { createProject } from '../../lib/api';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

type ProjectFormFields = {
  [key: string]: string;
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate required fields
    if (!form.title.trim()) {
      setError('Project title is required');
      return;
    }
    
    if (!form.url.trim()) {
      setError('Website URL is required');
      return;
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
      let errorMessage = 'Failed to create project. Please try again.';
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
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            console.error('Error parsing response data:', parseError);
          }
        }
      
      if (showUpgradePopup) {
        setError('');
        // Show upgrade modal
        if (window.confirm(errorMessage + '\n\nWould you like to upgrade your plan?')) {
          window.location.hash = '#pricing';
        }
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
                const isRequired = key === 'title' || key === 'url';
                return type === 'textarea' ? (
                  <textarea
                    key={key}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={isRequired ? `${label} *` : label}
                    className={`w-full border rounded px-3 py-2 h-24 resize-none ${isRequired && !form[key].trim() ? 'border-red-300' : ''}`}
                  />
                ) : (
                  <input
                    key={key}
                    type={type}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={isRequired ? `${label} *` : label}
                    className={`w-full border rounded px-3 py-2 ${isRequired && !form[key].trim() ? 'border-red-300' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}

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