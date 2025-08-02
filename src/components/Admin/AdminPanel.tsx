import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  Database, 
  Settings, 
  BarChart3, 
  Upload, 
  Download,
  Search,
  Filter,
  MoreVertical,
  Ban,
  Trash2,
  Eye,
  Edit3,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  FileText,
  Target,
  Star,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Modal, Button, Input, Select } from 'antd';
import EmployeeManagement from './EmployeeManagement';
import DirectoryManagement from './DirectoryManagement';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'basic' | 'premium';
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  lastActive: string;
  projectsCount: number;
  submissionsCount: number;
}

interface AdminDirectory {
  id: string;
  name: string;
  domain: string;
  category: string;
  pageRank: number;
  status: 'active' | 'inactive';
  submissionCount: number;
  successRate: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalSubmissions: number;
  revenue: number;
  successRate: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>({ totalUsers: 0, activeUsers: 0, totalProjects: 0, totalSubmissions: 0, revenue: 0, successRate: 0 });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>({ username: '', email: '', password: '', isAdmin: false, subscription: 'free', status: 'active' });
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: any; action: 'activate' | 'suspend' | 'ban' | 'delete' } | null>(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [newDirectory, setNewDirectory] = useState<any>({ name: '', domain: '', category: '', pageRank: 0, status: 'active' });

  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', email: '', password: '', isAdmin: false, subscription: 'free', status: 'active' });
    setShowUserModal(true);
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ ...user, password: '' });
    setShowUserModal(true);
  };

  const handleUserFormChange = (field: string, value: any) => {
    setUserForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleUserFormSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        // Update user
        await axios.put(`http://localhost:5050/api/admin/users/${editingUser._id}`, userForm, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        // Create user
        await axios.post('http://localhost:5050/api/admin/users', userForm, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      setShowUserModal(false);
      // Refresh users
      const res = await axios.get('http://localhost:5050/api/admin/users', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUsers(res.data);
      setPopup({ message: editingUser ? 'User updated successfully' : 'User created successfully', type: 'success' });
    } catch (err) {
      console.error('Error saving user:', err);
      setPopup({ message: 'Failed to save user', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectoryFormSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5050/api/admin/directories', newDirectory, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setShowDirectoryModal(false);
      setNewDirectory({ name: '', domain: '', category: '', pageRank: 0, status: 'active' });
      // Refresh directories
      const res = await axios.get('http://localhost:5050/api/admin/directories', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setDirectories(res.data);
      setPopup({ message: 'Directory created successfully', type: 'success' });
      setTimeout(() => setPopup(null), 3000);
    } catch (err) {
      console.error('Error creating directory:', err);
      setPopup({ message: 'Failed to create directory', type: 'error' });
      setTimeout(() => setPopup(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [usersRes, dirsRes, statsRes, projectsRes, submissionsRes] = await Promise.all([
          axios.get('http://localhost:5050/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5050/api/admin/directories', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5050/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5050/api/admin/projects', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5050/api/admin/submissions', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUsers(usersRes.data);
        setDirectories(dirsRes.data);
        
        // Process directory stats
        const dirStats = Array.isArray(dirsRes.data) ? dirsRes.data.map((name: string, i: number) => {
          const count = submissionsRes.data.filter((s: any) => s.siteName === name).length;
          return { name, count, successRate: Math.random() * 100 };
        }) : [];
        
        setSystemStats(statsRes.data);
        setProjects(projectsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setPopup({ message: 'Failed to load admin data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5050/api/admin/users/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.map(u => u._id === id ? res.data : u));
      setPopup({ message: 'User updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating user:', error);
      setPopup({ message: 'Failed to update user', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5050/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u._id !== id));
      setPopup({ message: 'User deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setPopup({ message: 'Failed to delete user', type: 'error' });
    }
  };

  // Remove all mock data and use real data from state for stats, directories, etc.

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'projects', name: 'Projects', icon: Globe },
    { id: 'submissions', name: 'Submissions', icon: FileText },
    { id: 'directories', name: 'Directories', icon: Database },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (action === 'suspend') {
        await Promise.all(selectedUsers.map(id =>
          axios.put(`http://localhost:5050/api/admin/users/${id}`, { status: 'suspended' }, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ));
      } else if (action === 'delete') {
        await Promise.all(selectedUsers.map(id =>
          axios.delete(`http://localhost:5050/api/admin/users/${id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ));
      } else if (action === 'activate') {
        await Promise.all(selectedUsers.map(id =>
          axios.put(`http://localhost:5050/api/admin/users/${id}`, { status: 'active' }, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ));
      } else if (action === 'ban') {
        await Promise.all(selectedUsers.map(id =>
          axios.put(`http://localhost:5050/api/admin/users/${id}`, { status: 'banned' }, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ));
      }
      // Refresh users
      const res = await axios.get('http://localhost:5050/api/admin/users', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUsers(res.data);
      setSelectedUsers([]);
      setPopup({ message: `${action.charAt(0).toUpperCase() + action.slice(1)} applied to ${selectedUsers.length} users`, type: 'success' });
      setTimeout(() => setPopup(null), 3000);
    } catch (err) {
      console.error('Bulk action error:', err);
      setPopup({ message: 'Bulk action failed', type: 'error' });
      setTimeout(() => setPopup(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format date safely
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  // In the Users tab, compute selected users' statuses
  const selectedStatuses = selectedUsers.map(id => {
    const u = users.find(u => u._id === id);
    return u ? u.status : null;
  });
  const allSelectedAre = (status: string) => selectedStatuses.length > 0 && selectedStatuses.every(s => s === status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Manage users, directories, and system settings</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 rounded-lg">
          <Shield className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">Admin Access</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{(systemStats.totalUsers ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{(systemStats.activeUsers ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-purple-600">{(systemStats.totalProjects ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold text-orange-600">{(systemStats.totalSubmissions ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${(systemStats.revenue ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{(systemStats.successRate ?? 0)}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
              <div className="space-y-4">
                {Array.isArray(users) && users.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">Last active: {formatDate(user.lastActive)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Directories</h3>
              <div className="space-y-4">
                {directories.slice(0, 5).map((directory) => (
                  <div key={directory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{directory.name}</p>
                        <p className="text-xs text-gray-600">{directory.submissionCount} submissions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{directory.pageRank}</span>
                      </div>
                      <p className="text-xs text-green-600">{directory.successRate}% success</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">{users.length} total users</p>
              </div>
              <button onClick={openCreateUser} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create User</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="flex space-x-2">
                    {!allSelectedAre('suspended') && (
                      <button
                        onClick={() => handleBulkAction('suspend')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        Suspend ({selectedUsers.length})
                      </button>
                    )}
                    {!allSelectedAre('active') && (
                      <button
                        onClick={() => handleBulkAction('activate')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Activate ({selectedUsers.length})
                      </button>
                    )}
                    {!allSelectedAre('banned') && (
                      <button
                        onClick={() => handleBulkAction('ban')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Ban ({selectedUsers.length})
                      </button>
                    )}
                    <button
                      onClick={() => handleBulkAction('delete')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete ({selectedUsers.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(users.map(u => u._id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(users) && users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user._id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription)}`}>
                          {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.projectsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.submissionsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative group">
                          <button className="p-1 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2" onClick={e => { e.stopPropagation(); openEditUser(user); }}><Edit3 className="w-3 h-3" /><span>Edit</span></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Projects Management Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                <p className="text-sm text-gray-600 mt-1">{projects.length} total projects</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(projects) && projects.map((project) => {
                    const projectUser = users.find(u => u._id === project.userId);
                    const projectSubmissions = submissions.filter(s => s.projectId === project._id);
                    return (
                      <tr key={project._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{project.title || 'Untitled Project'}</div>
                              <div className="text-sm text-gray-500">{project.url || 'No URL'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{projectUser?.username || 'Unknown User'}</div>
                              <div className="text-xs text-gray-500">{projectUser?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {projectSubmissions.length} submissions
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative group">
                            <button className="p-1 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2">
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Submissions Management Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submission Management</h3>
                <p className="text-sm text-gray-600 mt-1">{submissions.length} total submissions</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Types</option>
                  <option value="directory">Directory</option>
                  <option value="social">Social Media</option>
                  <option value="other">Other</option>
                </select>
                
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(submissions) && submissions.map((sub) => {
                    const submissionUser = users.find(u => u._id === sub.userId);
                    const submissionProject = projects.find(p => p._id === sub.projectId);
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{submissionUser?.username || 'Unknown User'}</div>
                              <div className="text-xs text-gray-500">{submissionUser?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{submissionProject?.title || 'Unknown Project'}</div>
                          <div className="text-xs text-gray-500">{submissionProject?.url || 'No URL'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sub.submissionType === 'directory' ? 'bg-blue-100 text-blue-800' :
                            sub.submissionType === 'social' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.submissionType || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sub.siteName || 'Unknown Site'}</div>
                          <div className="text-xs text-gray-500">{sub.siteUrl || 'No URL'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sub.status === 'success' ? 'bg-green-100 text-green-800' :
                            sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            sub.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sub.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative group">
                            <button className="p-1 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2">
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Directories Tab */}
      {activeTab === 'directories' && (
        <DirectoryManagement />
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <EmployeeManagement />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* General Settings */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        defaultValue="SEO Automation Toolkit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue="support@seoautomation.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default User Role
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Require Email Verification</p>
                        <p className="text-sm text-gray-600">New users must verify their email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Rate Limiting</p>
                        <p className="text-sm text-gray-600">Limit API requests per user</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Management */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Plan Management</h4>
                  <div className="space-y-4">
                    {[
                      { id: 'free', name: 'Free Trial', projects: 1, submissions: 10, price: 0 },
                      { id: 'starter', name: 'Starter Pack', projects: 1, submissions: 100, price: 999 },
                      { id: 'pro', name: 'Pro Pack', projects: 5, submissions: 500, price: 3999 },
                      { id: 'business', name: 'Business Pack', projects: 10, submissions: 1000, price: 8999 }
                    ].map((plan) => (
                      <div key={plan.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">{plan.name}</h5>
                          <span className="text-sm font-medium text-gray-600">₹{plan.price}/month</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Projects</label>
                            <input
                              type="number"
                              defaultValue={plan.projects}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Submissions</label>
                            <input
                              type="number"
                              defaultValue={plan.submissions}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            defaultValue={plan.price}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stripe Configuration */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Payment Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stripe Publishable Key
                      </label>
                      <input
                        type="text"
                        defaultValue="pk_test_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stripe Secret Key
                      </label>
                      <input
                        type="password"
                        defaultValue="sk_test_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <input
                        type="password"
                        defaultValue="whsec_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Configuration */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">AI Form Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Provider
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="huggingface">Hugging Face (Free)</option>
                        <option value="openai">OpenAI (Paid)</option>
                        <option value="ollama">Ollama (Local)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your API key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable AI Form Detection</p>
                        <p className="text-sm text-gray-600">Use AI to automatically detect form fields</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                      </label>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>AI Form Analysis:</strong> Automatically detects and maps form fields on any website using AI, eliminating the need for manual field mapping.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Modal */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button onClick={() => setShowDirectoryModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
            <h2 className="text-xl font-bold mb-4">Add New Directory</h2>
            <form onSubmit={e => { e.preventDefault(); handleDirectoryFormSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Directory Name</label>
                <input 
                  type="text" 
                  value={newDirectory.name} 
                  onChange={e => setNewDirectory({...newDirectory, name: e.target.value})} 
                  className="w-full border rounded px-3 py-2" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domain</label>
                <input 
                  type="text" 
                  value={newDirectory.domain} 
                  onChange={e => setNewDirectory({...newDirectory, domain: e.target.value})} 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={newDirectory.category} 
                  onChange={e => setNewDirectory({...newDirectory, category: e.target.value})} 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Page Rank (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={newDirectory.pageRank} 
                  onChange={e => setNewDirectory({...newDirectory, pageRank: parseInt(e.target.value)})} 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  value={newDirectory.status} 
                  onChange={e => setNewDirectory({...newDirectory, status: e.target.value})} 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Add Directory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button onClick={() => setShowUserModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={e => { e.preventDefault(); handleUserFormSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" value={userForm.username} onChange={e => handleUserFormChange('username', e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={e => handleUserFormChange('email', e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password {editingUser && <span className="text-xs text-gray-400">(leave blank to keep unchanged)</span>}</label>
                <input type="password" value={userForm.password} onChange={e => handleUserFormChange('password', e.target.value)} className="w-full border rounded px-3 py-2" required={!editingUser} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subscription</label>
                <select value={userForm.subscription} onChange={e => handleUserFormChange('subscription', e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={userForm.status} onChange={e => handleUserFormChange('status', e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked={userForm.isAdmin} onChange={e => handleUserFormChange('isAdmin', e.target.checked)} id="isAdmin" className="mr-2" />
                <label htmlFor="isAdmin" className="text-sm">Admin</label>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
            </form>
          </div>
        </div>
      )}

      {popup && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{popup.message}</div>
      )}
    </div>
  );
}