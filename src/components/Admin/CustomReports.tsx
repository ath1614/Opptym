import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  Globe,
  Database,
  Settings,
  Eye,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'projects' | 'submissions' | 'directories' | 'analytics' | 'custom';
  fields: string[];
  filters: ReportFilter[];
  chartType: 'bar' | 'pie' | 'line' | 'table';
  isCustom: boolean;
  createdAt: string;
  createdBy: string;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  label: string;
}

interface ReportData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRows: number;
    totalColumns: number;
    generatedAt: string;
  };
}

const CustomReports: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    fields: [],
    filters: [],
    chartType: 'table',
    isCustom: true
  });

  // Predefined report templates
  const predefinedTemplates: ReportTemplate[] = [
    {
      id: 'user_analytics',
      name: 'User Analytics Report',
      description: 'Comprehensive user statistics and growth metrics',
      category: 'users',
      fields: ['name', 'email', 'subscription', 'status', 'joinDate', 'lastActive', 'projectsCount'],
      filters: [
        { field: 'subscription', operator: 'in', value: ['free', 'basic', 'premium'], label: 'Subscription Plan' },
        { field: 'status', operator: 'equals', value: 'active', label: 'Status' }
      ],
      chartType: 'bar',
      isCustom: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: 'project_performance',
      name: 'Project Performance Report',
      description: 'Project creation and usage statistics',
      category: 'projects',
      fields: ['name', 'url', 'status', 'createdAt', 'submissionsCount', 'successRate'],
      filters: [
        { field: 'status', operator: 'equals', value: 'active', label: 'Status' }
      ],
      chartType: 'line',
      isCustom: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: 'submission_analytics',
      name: 'Submission Analytics Report',
      description: 'Directory submission success rates and statistics',
      category: 'submissions',
      fields: ['siteName', 'status', 'submittedAt', 'completedAt', 'successRate', 'category'],
      filters: [
        { field: 'status', operator: 'in', value: ['success', 'failed', 'pending'], label: 'Status' }
      ],
      chartType: 'pie',
      isCustom: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: 'directory_performance',
      name: 'Directory Performance Report',
      description: 'Directory usage and success metrics',
      category: 'directories',
      fields: ['name', 'domain', 'category', 'pageRank', 'daScore', 'submissionCount', 'successRate'],
      filters: [
        { field: 'category', operator: 'in', value: ['business', 'general', 'niche'], label: 'Category' }
      ],
      chartType: 'bar',
      isCustom: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/reports/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates([...predefinedTemplates, ...response.data]);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use predefined templates if API fails
      setTemplates(predefinedTemplates);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (template: ReportTemplate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/reports/generate', {
        templateId: template.id,
        filters: template.filters,
        fields: template.fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReportData(response.data);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
      showPopup('Report generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating report:', error);
      showPopup(error.response?.data?.error || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!reportData || !selectedTemplate) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/reports/export', {
        templateId: selectedTemplate.id,
        data: reportData,
        format
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showPopup(`Report exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (error: any) {
      console.error('Error exporting report:', error);
      showPopup(error.response?.data?.error || 'Failed to export report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description) {
      showPopup('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/reports/templates', newTemplate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplates([...templates, response.data]);
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'custom',
        fields: [],
        filters: [],
        chartType: 'table',
        isCustom: true
      });
      showPopup('Report template saved successfully!', 'success');
    } catch (error: any) {
      console.error('Error saving template:', error);
      showPopup(error.response?.data?.error || 'Failed to save template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="w-5 h-5" />;
      case 'projects': return <Globe className="w-5 h-5" />;
      case 'submissions': return <FileText className="w-5 h-5" />;
      case 'directories': return <Database className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'line': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">Generate and export custom reports for your data</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(template.category)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getChartIcon(template.chartType)}
                {template.isCustom && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Fields:</strong> {template.fields.length} selected
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Filters:</strong> {template.filters.length} applied
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => generateReport(template)}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Report Template</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter template description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTemplate.category || 'custom'}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="users">Users</option>
                    <option value="projects">Projects</option>
                    <option value="submissions">Submissions</option>
                    <option value="directories">Directories</option>
                    <option value="analytics">Analytics</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chart Type
                  </label>
                  <select
                    value={newTemplate.chartType || 'table'}
                    onChange={(e) => setNewTemplate({ ...newTemplate, chartType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="table">Table</option>
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="line">Line Chart</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showPreviewModal && reportData && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name} - Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Options */}
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export as:</span>
              <button
                onClick={() => exportReport('csv')}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportReport('pdf')}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportReport('excel')}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>

            {/* Report Summary */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Total Rows:</strong> {reportData.summary.totalRows}
                </span>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Total Columns:</strong> {reportData.summary.totalColumns}
                </span>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Generated:</strong> {new Date(reportData.summary.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Report Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {reportData.headers.map((header, index) => (
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
                  {reportData.rows.slice(0, 100).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell, cellIndex) => (
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
              {reportData.rows.length > 100 && (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing first 100 rows of {reportData.rows.length} total rows
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReports;
