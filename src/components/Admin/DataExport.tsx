import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Database, 
  Users, 
  Globe, 
  FileText as FileIcon,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Eye,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface ExportJob {
  id: string;
  type: 'users' | 'projects' | 'submissions' | 'directories' | 'analytics' | 'all';
  format: 'csv' | 'json' | 'excel' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
  filters?: any;
  fields?: string[];
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: string[];
  filters: any[];
  format: string;
  isDefault: boolean;
}

const DataExport: React.FC = () => {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'users' | 'projects' | 'submissions' | 'directories' | 'analytics' | 'all'>('users');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Predefined export templates
  const exportTemplates: ExportTemplate[] = [
    {
      id: 'users_complete',
      name: 'Complete User Export',
      description: 'Export all user data including profile information',
      type: 'users',
      fields: ['name', 'email', 'subscription', 'status', 'createdAt', 'lastActive', 'projectsCount'],
      filters: [],
      format: 'csv',
      isDefault: true
    },
    {
      id: 'projects_analytics',
      name: 'Project Analytics Export',
      description: 'Export project performance and analytics data',
      type: 'projects',
      fields: ['name', 'url', 'status', 'createdAt', 'submissionsCount', 'successRate'],
      filters: [],
      format: 'excel',
      isDefault: true
    },
    {
      id: 'submissions_report',
      name: 'Submissions Report',
      description: 'Export submission data with success rates',
      type: 'submissions',
      fields: ['siteName', 'status', 'submittedAt', 'completedAt', 'category', 'successRate'],
      filters: [],
      format: 'csv',
      isDefault: true
    },
    {
      id: 'directories_list',
      name: 'Directory List Export',
      description: 'Export all directory information',
      type: 'directories',
      fields: ['name', 'domain', 'category', 'pageRank', 'daScore', 'submissionCount'],
      filters: [],
      format: 'json',
      isDefault: true
    }
  ];

  useEffect(() => {
    loadExportJobs();
    loadAvailableFields();
  }, []);

  const loadExportJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/export/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExportJobs(response.data);
    } catch (error) {
      console.error('Error loading export jobs:', error);
      // Mock data for demonstration
      setExportJobs([
        {
          id: '1',
          type: 'users',
          format: 'csv',
          status: 'completed',
          progress: 100,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3500000).toISOString(),
          downloadUrl: '/api/admin/export/download/1'
        },
        {
          id: '2',
          type: 'projects',
          format: 'excel',
          status: 'processing',
          progress: 65,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ]);
    }
  };

  const loadAvailableFields = () => {
    const fieldMap: { [key: string]: string[] } = {
      users: ['name', 'email', 'username', 'subscription', 'status', 'createdAt', 'lastActive', 'projectsCount', 'submissionsCount', 'isAdmin'],
      projects: ['name', 'url', 'status', 'createdAt', 'updatedAt', 'submissionsCount', 'successRate', 'category'],
      submissions: ['siteName', 'status', 'submittedAt', 'completedAt', 'category', 'successRate', 'errorMessage', 'projectId'],
      directories: ['name', 'domain', 'category', 'pageRank', 'daScore', 'spamScore', 'submissionCount', 'successRate', 'isPremium'],
      analytics: ['date', 'totalUsers', 'activeUsers', 'totalProjects', 'totalSubmissions', 'successRate', 'revenue']
    };
    setAvailableFields(fieldMap[selectedType] || []);
    setSelectedFields(fieldMap[selectedType] || []);
  };

  useEffect(() => {
    loadAvailableFields();
  }, [selectedType]);

  const startExport = async () => {
    if (selectedFields.length === 0) {
      showPopup('Please select at least one field to export', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/export/start', {
        type: selectedType,
        format: selectedFormat,
        fields: selectedFields,
        filters: filters
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setExportJobs([response.data, ...exportJobs]);
      setShowExportModal(false);
      showPopup('Export job started successfully!', 'success');
      
      // Start polling for updates
      pollExportStatus(response.data.id);
    } catch (error: any) {
      console.error('Error starting export:', error);
      showPopup(error.response?.data?.error || 'Failed to start export', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pollExportStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/admin/export/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? response.data : job
        ));

        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling export status:', error);
        clearInterval(interval);
      }
    }, 2000);

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const downloadExport = async (job: ExportJob) => {
    if (!job.downloadUrl) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(job.downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${job.type}_${new Date(job.completedAt || job.createdAt).toISOString().split('T')[0]}.${job.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showPopup('Export downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading export:', error);
      showPopup(error.response?.data?.error || 'Failed to download export', 'error');
    }
  };

  const handlePreviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/export/preview', {
        type: selectedType,
        fields: selectedFields,
        filters: filters,
        limit: 10
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Error previewing data:', error);
      showPopup(error.response?.data?.error || 'Failed to preview data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'projects': return <Globe className="w-4 h-4" />;
      case 'submissions': return <FileIcon className="w-4 h-4" />;
      case 'directories': return <Database className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Export</h2>
          <p className="text-gray-600 dark:text-gray-400">Export your data in various formats</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>New Export</span>
        </button>
      </div>

      {/* Export Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Export Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                {getTypeIcon(template.type)}
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
              <button
                onClick={() => {
                  setSelectedType(template.type as any);
                  setSelectedFormat(template.format as any);
                  setSelectedFields(template.fields);
                  setShowExportModal(true);
                }}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {exportJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(job.type)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {job.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100 uppercase">
                      {job.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {job.status === 'completed' && job.downloadUrl ? (
                      <button
                        onClick={() => downloadExport(job)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Download
                      </button>
                    ) : job.status === 'failed' ? (
                      <span className="text-red-600 dark:text-red-400">Failed</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Processing...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Export</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="users">Users</option>
                    <option value="projects">Projects</option>
                    <option value="submissions">Submissions</option>
                    <option value="directories">Directories</option>
                    <option value="analytics">Analytics</option>
                    <option value="all">All Data</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Format
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fields to Export
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                  {availableFields.map((field) => (
                    <label key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields([...selectedFields, field]);
                          } else {
                            setSelectedFields(selectedFields.filter(f => f !== field));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePreviewData}
                disabled={loading || selectedFields.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startExport}
                  disabled={loading || selectedFields.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {previewData.headers?.map((header: string, index: number) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {previewData.rows?.map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell: any, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExport;
