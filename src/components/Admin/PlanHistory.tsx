import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  User, 
  Edit, 
  Eye, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Search
} from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface PlanHistoryEntry {
  id: string;
  planId: string;
  planName: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'feature_added' | 'feature_removed' | 'price_changed';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  reason?: string;
  version: number;
  isRollbackable: boolean;
}

interface PlanHistoryFilters {
  planId?: string;
  action?: string;
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

const PlanHistory: React.FC = () => {
  const [historyEntries, setHistoryEntries] = useState<PlanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PlanHistoryEntry | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [filters, setFilters] = useState<PlanHistoryFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  useEffect(() => {
    loadHistoryEntries();
    loadAvailablePlans();
  }, [filters]);

  const loadHistoryEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.planId) queryParams.append('planId', filters.planId);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.changedBy) queryParams.append('changedBy', filters.changedBy);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await axios.get(`/api/admin/plans/history?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryEntries(response.data);
    } catch (error) {
      console.error('Error loading plan history:', error);
      // Mock data for demonstration
      setHistoryEntries([
        {
          id: '1',
          planId: 'plan_1',
          planName: 'Pro Pack',
          action: 'price_changed',
          changes: [
            { field: 'price.monthly', oldValue: 2999, newValue: 3999 },
            { field: 'price.yearly', oldValue: 29990, newValue: 39990 }
          ],
          changedBy: { id: 'admin_1', name: 'Admin User', email: 'admin@opptym.com' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          reason: 'Price increase due to new features',
          version: 3,
          isRollbackable: true
        },
        {
          id: '2',
          planId: 'plan_2',
          planName: 'Starter Pack',
          action: 'feature_added',
          changes: [
            { field: 'features', oldValue: ['Basic SEO Tools'], newValue: ['Basic SEO Tools', 'Email Support'] }
          ],
          changedBy: { id: 'admin_1', name: 'Admin User', email: 'admin@opptym.com' },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          version: 2,
          isRollbackable: true
        },
        {
          id: '3',
          planId: 'plan_3',
          planName: 'Business Pack',
          action: 'created',
          changes: [
            { field: 'name', oldValue: null, newValue: 'Business Pack' },
            { field: 'price.monthly', oldValue: null, newValue: 8999 },
            { field: 'features', oldValue: null, newValue: ['All Pro Features', 'Priority Support', 'Custom Integrations'] }
          ],
          changedBy: { id: 'admin_1', name: 'Admin User', email: 'admin@opptym.com' },
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          version: 1,
          isRollbackable: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/pricing-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailablePlans(response.data);
    } catch (error) {
      console.error('Error loading plans:', error);
      setAvailablePlans([
        { _id: 'plan_1', name: 'Pro Pack' },
        { _id: 'plan_2', name: 'Starter Pack' },
        { _id: 'plan_3', name: 'Business Pack' }
      ]);
    }
  };

  const rollbackToVersion = async (entry: PlanHistoryEntry) => {
    try {
      setRollbackLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/plans/${entry.planId}/rollback`, {
        version: entry.version,
        reason: `Rollback to version ${entry.version}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup(`Successfully rolled back to version ${entry.version}`, 'success');
      setShowRollbackModal(false);
      loadHistoryEntries();
    } catch (error: any) {
      console.error('Error rolling back plan:', error);
      showPopup(error.response?.data?.error || 'Failed to rollback plan', 'error');
    } finally {
      setRollbackLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'updated': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'deleted': return <X className="w-4 h-4 text-red-500" />;
      case 'activated': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'deactivated': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'feature_added': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'feature_removed': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'price_changed': return <DollarSign className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'activated': return 'bg-green-100 text-green-800';
      case 'deactivated': return 'bg-red-100 text-red-800';
      case 'feature_added': return 'bg-green-100 text-green-800';
      case 'feature_removed': return 'bg-red-100 text-red-800';
      case 'price_changed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const filteredEntries = historyEntries.filter(entry => {
    if (!searchTerm) return true;
    return (
      entry.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.changedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan History</h2>
          <p className="text-gray-600 dark:text-gray-400">Track all changes made to pricing plans</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Search plans, users, actions..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan
            </label>
            <select
              value={filters.planId || ''}
              onChange={(e) => setFilters({ ...filters, planId: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Plans</option>
              {availablePlans.map(plan => (
                <option key={plan._id} value={plan._id}>{plan.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="activated">Activated</option>
              <option value="deactivated">Deactivated</option>
              <option value="feature_added">Feature Added</option>
              <option value="feature_removed">Feature Removed</option>
              <option value="price_changed">Price Changed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* History Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            History Entries ({filteredEntries.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Changes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Changed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.planName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          v{entry.version}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(entry.action)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {entry.changes.length} change{entry.changes.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.changes.slice(0, 2).map(change => change.field).join(', ')}
                      {entry.changes.length > 2 && ` +${entry.changes.length - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.changedBy.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.changedBy.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {entry.isRollbackable && (
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowRollbackModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plan Change Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Entry Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan Name
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.planName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">v{selectedEntry.version}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action
                  </label>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(selectedEntry.action)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedEntry.action)}`}>
                      {selectedEntry.action.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Changed By
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.changedBy.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{selectedEntry.changedBy.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date & Time
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </div>
                </div>
                {selectedEntry.reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason
                    </label>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.reason}</div>
                  </div>
                )}
              </div>

              {/* Changes */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Changes Made</h4>
                <div className="space-y-3">
                  {selectedEntry.changes.map((change, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{change.field}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Change #{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Previous Value
                          </label>
                          <div className="text-sm text-gray-900 dark:text-gray-100 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {formatChangeValue(change.oldValue)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Value
                          </label>
                          <div className="text-sm text-gray-900 dark:text-gray-100 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            {formatChangeValue(change.newValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rollback Plan
              </h3>
              <button
                onClick={() => setShowRollbackModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Warning
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This will rollback the plan "{selectedEntry.planName}" to version {selectedEntry.version}. 
                  All changes made after this version will be lost.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rollback Reason
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for rollback..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rollbackToVersion(selectedEntry)}
                disabled={rollbackLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rollbackLoading ? 'Rolling back...' : 'Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanHistory;
