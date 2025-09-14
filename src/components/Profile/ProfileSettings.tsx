import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Remove BASE_URL import - use relative paths like other components
import { getUserDisplayName, getUserInitials, getUserProfilePhoto } from '../../utils/userUtils';
import SubscriptionStatus from '../Subscription/SubscriptionStatus';
import { 
  Camera, 
  Save, 
  Lock, 
  Download, 
  Trash2, 
  Bell, 
  Shield, 
  User, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    website: '',
    timezone: 'UTC',
    bio: ''
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings State
  const [settings, setSettings] = useState({
    marketingEmails: false,
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || '',
        website: user.website || '',
        timezone: user.timezone || 'UTC',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/profile`, profileForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage('Profile updated successfully!');
      await refreshUser(); // Refresh user data
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setLoading(true);
          
          // For now, we'll use a simple approach - convert to base64
          // In production, you'd want to upload to a cloud service like AWS S3
          const reader = new FileReader();
          reader.onload = async (event) => {
            const photoUrl = event.target?.result as string;
            
            try {
              const token = localStorage.getItem('token');
              await axios.put('/api/auth/photo', {
                photoUrl
              }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // Update the user object with the new photo
              if (refreshUser) {
                await refreshUser();
              }
              
              setSuccessMessage('Profile photo updated successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error: any) {
              setErrorMessage(error.response?.data?.error || 'Failed to update profile photo');
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error: any) {
          setErrorMessage('Failed to process image file');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/auth/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-data.json';
      a.click();
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Data exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/auth/account`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setSuccessMessage('Account deleted successfully. You will be logged out.');
        setTimeout(() => {
          // Logout and redirect to landing page
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 3000);
      } catch (error: any) {
        setErrorMessage(error.response?.data?.error || 'Failed to delete account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Manage your account settings, profile information, and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 max-w-2xl mx-auto">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Information */}
          <div className="xl:col-span-3 space-y-6">
            {/* Profile Photo */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                  {getUserProfilePhoto(user as any) ? (
                    <div className="w-32 h-32 rounded-2xl shadow-lg overflow-hidden">
                      <img 
                        src={getUserProfilePhoto(user as any) || undefined} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">{getUserInitials(user as any)}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="text-center md:text-left space-y-3">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {getUserDisplayName(user as any)}
                  </h4>
                  <p className="text-gray-600 text-lg">{user?.email}</p>
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <span>Personal Information</span>
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                    <select
                      value={profileForm.timezone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </form>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span>Subscription & Billing</span>
              </h3>
              <SubscriptionStatus />
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <span>Change Password</span>
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors placeholder-gray-400"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors placeholder-gray-400"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span>Account Actions</span>
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                >
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-semibold">Export Data</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-semibold">Delete Account</span>
                </button>
              </div>
            </div>

            {/* Marketing Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-600" />
                </div>
                <span>Marketing</span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Marketing Emails</span>
                  <button
                    onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-orange-600" />
                </div>
                <span>Security</span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Two-Factor Auth</span>
                  <button
                    onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}