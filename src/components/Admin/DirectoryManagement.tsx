import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Search } from 'lucide-react';
import {
  directoriesData, 
  getAllClassifications, 
  Directory 
} from '../../config/directoriesConfig';

interface DirectoryManagementProps {
  onDirectoryUpdate?: () => void;
}

const DirectoryManagement: React.FC<DirectoryManagementProps> = ({ onDirectoryUpdate }) => {
  const [directories, setDirectories] = useState<{ [key: string]: Directory[] }>(directoriesData);
  // const [selectedClassification, setSelectedClassification] = useState<string>('Directory Submission');
  const [editingDirectory, setEditingDirectory] = useState<Directory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');

  const classifications = getAllClassifications();

  // Load directories from config
  useEffect(() => {
    console.log('Loading directories data:', directoriesData);
    console.log('Classifications available:', Object.keys(directoriesData));
    console.log('Total directories:', Object.values(directoriesData).reduce((sum, dirs) => sum + dirs.length, 0));
    setDirectories(directoriesData);
  }, []);

  // Filter directories based on search and classification
  const filteredDirectories = Object.entries(directories).filter(([classification, dirs]) => {
    const matchesClassification = filterClassification === 'all' || classification === filterClassification;
    const matchesSearch = searchTerm === '' || 
      dirs.some(dir => 
        dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir.description && dir.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    // Debug logging
    if (searchTerm) {
      console.log('Search term:', searchTerm);
      console.log('Classification:', classification);
      console.log('Directories in classification:', dirs.length);
      console.log('Matches classification:', matchesClassification);
      console.log('Matches search:', matchesSearch);
    }
    
    return matchesClassification && matchesSearch;
  });


  const handleRemoveDirectory = (classification: string, directoryName: string) => {
    if (window.confirm(`Are you sure you want to remove "${directoryName}"?`)) {
      const updatedDirectories = {
        ...directories,
        [classification]: directories[classification].filter(dir => dir.name !== directoryName)
      };
      setDirectories(updatedDirectories);
      onDirectoryUpdate?.();
      alert('Directory removed successfully!');
    }
  };

  const handleEditDirectory = (classification: string, directory: Directory) => {
    setEditingDirectory({ ...directory, _classification: classification } as Directory & { _classification: string });
  };

  const handleSaveEdit = (updatedDirectory: Directory) => {
    if (editingDirectory) {
      const classification = (editingDirectory as any)._classification || '';
      const updatedDirectories = {
        ...directories,
        [classification]: directories[classification].map(dir => 
          dir.name === editingDirectory.name ? updatedDirectory : dir
        )
      };
      setDirectories(updatedDirectories);
      setEditingDirectory(null);
      onDirectoryUpdate?.();
      alert('Directory updated successfully!');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Directory Management</h2>
          <p className="text-gray-600">View and manage existing directories across all SEO classifications</p>
          <p className="text-sm text-gray-500 mt-1">
            💡 Use the "Create New Directory" button above to add new directories to the database
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-3">
          <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search directories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classifications</option>
            {classifications.map(classification => (
                  <option key={classification} value={classification}>
                    {classification}
                  </option>
                ))}
              </select>
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              {(() => {
                const totalResults = filteredDirectories.reduce((sum, [, dirs]) => sum + dirs.length, 0);
                return totalResults > 0 
                  ? `Found ${totalResults} directories matching "${searchTerm}"`
                  : `No directories found matching "${searchTerm}"`;
              })()}
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Directories List */}
      <div className="space-y-6">
        {filteredDirectories.map(([classification, dirs]: [string, Directory[]]) => (
          <div key={classification} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{classification}</h3>
              <span className="text-sm text-gray-500">{dirs.length} directories</span>
                      </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dirs.map((directory, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{directory.name}</h4>
                      <p className="text-sm text-blue-600 mb-2">{directory.url}</p>
                      {directory.description && (
                        <p className="text-xs text-gray-600 mb-2">{directory.description}</p>
                      )}
                      <div className="flex gap-2 mb-2">
                        {directory.daScore && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            DA {directory.daScore}
                          </span>
                        )}
                        {directory.pageRank && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            PR {directory.pageRank}
                          </span>
                        )}
                        {directory.priority && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Priority {directory.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditDirectory(classification, directory)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit directory"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveDirectory(classification, directory.name)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove directory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
        ))}
      </div>


      {/* Edit Directory Modal */}
      {editingDirectory && (
        <DirectoryForm
          directory={editingDirectory}
          onSave={handleSaveEdit}
          onCancel={() => setEditingDirectory(null)}
          classifications={classifications}
          isEditing={true}
        />
      )}
                </div>
  );
};

interface DirectoryFormProps {
  directory?: Directory & { _classification?: string };
  classification?: string;
  onSave: (directory: Directory) => void;
  onCancel: () => void;
  classifications: string[];
  onClassificationChange?: (classification: string) => void;
  isEditing?: boolean;
}

const DirectoryForm: React.FC<DirectoryFormProps> = ({
  directory,
  classification,
  onSave,
  onCancel,
  classifications,
  onClassificationChange,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Directory>({
    name: directory?.name || '',
    url: directory?.url || '',
    description: directory?.description || '',
    category: directory?.category || 'business',
    country: directory?.country || 'Global',
    priority: directory?.priority || 50,
    daScore: directory?.daScore || 0,
    pageRank: directory?.pageRank || 0,
    isPremium: directory?.isPremium || false,
    status: directory?.status || 'active'
  });

  const [selectedClassification, setSelectedClassification] = useState(
    directory?._classification || classification || 'Directory Submission'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) {
      alert('Name and URL are required');
      return;
    }

    const directoryToSave = {
      ...formData,
      _classification: selectedClassification
    };

    onSave(directoryToSave);
  };

  const handleClassificationChange = (newClassification: string) => {
    setSelectedClassification(newClassification);
    onClassificationChange?.(newClassification);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Directory' : 'Add New Directory'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
                </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classification *
              </label>
                  <select
                value={selectedClassification}
                onChange={(e) => handleClassificationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {classifications.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
                  <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                  />
                </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
                  <input
                    type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
              </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
                <textarea
                  value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
                  </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </select>
        </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
                  <input
                    type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (0-100)
              </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DA Score (0-100)
              </label>
                  <input
                type="number"
                min="0"
                max="100"
                value={formData.daScore}
                onChange={(e) => setFormData({ ...formData, daScore: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Rank (0-10)
              </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pageRank}
                onChange={(e) => setFormData({ ...formData, pageRank: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              </div>

            <div className="flex items-center">
                  <input
                    type="checkbox"
                id="isPremium"
                    checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="mr-2"
                  />
              <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                    Premium Directory
                  </label>
                </div>
              </div>

          <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Directory' : 'Add Directory'}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
};

export default DirectoryManagement;