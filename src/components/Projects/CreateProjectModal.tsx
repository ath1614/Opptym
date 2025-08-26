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
    
    setLoading(true);
    try {
      const payload = {
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(k => k),
        targetKeywords: form.targetKeywords.split(',').map(k => k.trim()).filter(k => k),
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await createProject(payload);
      onCreated();
      onClose();
    } catch (err: any) {
      setError('Failed to create project. Please try again.');
      console.error(err);
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