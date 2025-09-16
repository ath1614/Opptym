import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye, 
  Trash2,
  Plus,
  FileSpreadsheet,
  Database,
  Settings,
  Info,
  Loader,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface ImportedDirectory {
  name: string;
  domain: string;
  description?: string;
  category: string;
  country: string;
  classification: string;
  pageRank: number;
  daScore: number;
  spamScore: number;
  isPremium: boolean;
  requiresApproval: boolean;
  submissionUrl: string;
  contactEmail?: string;
  submissionGuidelines?: string;
  requiredFields: string[];
  priority: number;
  freeUserLimit: number;
  starterUserLimit: number;
  proUserLimit: number;
  businessUserLimit: number;
  enterpriseUserLimit: number;
  status: 'pending' | 'valid' | 'invalid' | 'duplicate';
  errors?: string[];
  rowIndex: number;
}

interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  errors: string[];
  duplicates: string[];
}

const BulkDirectoryImport: React.FC = () => {
  const [importedDirectories, setImportedDirectories] = useState<ImportedDirectory[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'import' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredFields = [
    'name', 'domain', 'category', 'classification', 'submissionUrl'
  ];

  const optionalFields = [
    'description', 'country', 'pageRank', 'daScore', 'spamScore', 
    'isPremium', 'requiresApproval', 'contactEmail', 'submissionGuidelines',
    'requiredFields', 'priority', 'freeUserLimit', 'starterUserLimit',
    'proUserLimit', 'businessUserLimit', 'enterpriseUserLimit'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      showPopup('Please select a CSV or Excel file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showPopup('File size must be less than 10MB', 'error');
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/directories/parse-import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const directories = response.data.directories.map((dir: any, index: number) => ({
        ...dir,
        rowIndex: index + 1,
        status: dir.errors && dir.errors.length > 0 ? 'invalid' : 'valid'
      }));

      setImportedDirectories(directories);
      setValidationErrors(response.data.errors || []);
      setCurrentStep('validate');
      setShowPreview(true);
      showPopup(`File parsed successfully. Found ${directories.length} directories.`, 'success');
    } catch (error: any) {
      console.error('Error parsing file:', error);
      showPopup(error.response?.data?.error || 'Failed to parse file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateDirectories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/directories/validate-import', {
        directories: importedDirectories
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const validatedDirectories = response.data.directories.map((dir: any) => ({
        ...dir,
        status: dir.errors && dir.errors.length > 0 ? 'invalid' : 
                dir.isDuplicate ? 'duplicate' : 'valid'
      }));

      setImportedDirectories(validatedDirectories);
      setValidationErrors(response.data.errors || []);
      showPopup('Validation completed', 'success');
    } catch (error: any) {
      console.error('Error validating directories:', error);
      showPopup(error.response?.data?.error || 'Failed to validate directories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const importDirectories = async () => {
    try {
      setImporting(true);
      const validDirectories = importedDirectories.filter(dir => dir.status === 'valid');
      
      if (validDirectories.length === 0) {
        showPopup('No valid directories to import', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/directories/bulk-import', {
        directories: validDirectories
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setImportResult(response.data);
      setCurrentStep('complete');
      showPopup(`Successfully imported ${response.data.importedRows} directories`, 'success');
    } catch (error: any) {
      console.error('Error importing directories:', error);
      showPopup(error.response?.data?.error || 'Failed to import directories', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        name: 'Example Directory',
        domain: 'https://example.com',
        description: 'Example directory description',
        category: 'business',
        country: 'Global',
        classification: 'Directory Submission',
        pageRank: 3,
        daScore: 30,
        spamScore: 2,
        isPremium: false,
        requiresApproval: true,
        submissionUrl: 'https://example.com/submit',
        contactEmail: 'contact@example.com',
        submissionGuidelines: 'Please follow our submission guidelines',
        requiredFields: 'name,email,website',
        priority: 10,
        freeUserLimit: 0,
        starterUserLimit: 5,
        proUserLimit: 20,
        businessUserLimit: 50,
        enterpriseUserLimit: -1
      }
    ];

    const csvContent = [
      Object.keys(templateData[0]).join(','),
      ...templateData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'directory_import_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const removeDirectory = (index: number) => {
    setImportedDirectories(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'duplicate': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      case 'duplicate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validCount = importedDirectories.filter(dir => dir.status === 'valid').length;
  const invalidCount = importedDirectories.filter(dir => dir.status === 'invalid').length;
  const duplicateCount = importedDirectories.filter(dir => dir.status === 'duplicate').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Directory Import</h2>
          <p className="text-gray-600 dark:text-gray-400">Import multiple directories from CSV or Excel files</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          {[
            { id: 'upload', label: 'Upload File', icon: Upload },
            { id: 'validate', label: 'Validate Data', icon: CheckCircle },
            { id: 'import', label: 'Import Directories', icon: Database },
            { id: 'complete', label: 'Complete', icon: CheckCircle }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = ['upload', 'validate', 'import', 'complete'].indexOf(currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isActive ? 'bg-blue-600 text-white' : 
                  isCompleted ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Directory File
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload a CSV or Excel file containing directory information
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Choose File'}
            </button>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Step */}
      {currentStep === 'validate' && showPreview && (
        <div className="space-y-6">
          {/* Validation Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Validation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importedDirectories.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {validCount}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">Valid</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {invalidCount}
                </div>
                <div className="text-sm text-red-800 dark:text-red-300">Invalid</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {duplicateCount}
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-300">Duplicates</div>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-red-800 dark:text-red-300">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Directory Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Directory Preview
                </h3>
                <button
                  onClick={validateDirectories}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Re-validate'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Classification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {importedDirectories.slice(0, 50).map((directory, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(directory.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(directory.status)}`}>
                            {directory.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {directory.name}
                        </div>
                        {directory.errors && directory.errors.length > 0 && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            {directory.errors[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {directory.domain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {directory.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {directory.classification}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeDirectory(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedDirectories.length > 50 && (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing first 50 rows of {importedDirectories.length} total rows
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('upload')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>
            <button
              onClick={() => setCurrentStep('import')}
              disabled={validCount === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Import {validCount} Valid Directories
            </button>
          </div>
        </div>
      )}

      {/* Import Step */}
      {currentStep === 'import' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              {importing ? (
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              ) : (
                <Database className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {importing ? 'Importing Directories...' : 'Ready to Import'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {importing 
                ? 'Please wait while we import your directories' 
                : `About to import ${validCount} valid directories`
              }
            </p>
            
            {!importing && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentStep('validate')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Back to Validation
                </button>
                <button
                  onClick={importDirectories}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Import
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Step */}
      {currentStep === 'complete' && importResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Import Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your directory import has been completed successfully
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importResult.totalRows}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult.importedRows}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResult.invalidRows}
                </div>
                <div className="text-sm text-red-800 dark:text-red-300">Invalid</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {importResult.duplicateRows}
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-300">Duplicates</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setCurrentStep('upload');
                setImportedDirectories([]);
                setImportResult(null);
                setShowPreview(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Import More Directories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkDirectoryImport;
