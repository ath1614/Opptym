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

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings State - Removed marketing emails and security settings
  const [settings, setSettings] = useState({
    // Removed marketingEmails, twoFactorAuth, sessionTimeout
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

  // First handlePhotoUpload function removed - using the updated version below

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

  // handleSettingChange function removed as marketing and security settings were removed

  // Profile Photo Upload Functions
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        return;
      }
      
      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;
    
    setPhotoUploading(true);
    setErrorMessage('');
    
    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const photoUrl = e.target?.result as string;
          
          const token = localStorage.getItem('token');
          const response = await axios.put('/api/auth/photo', { photoUrl }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          setSuccessMessage('Profile photo updated successfully!');
          await refreshUser(); // Refresh user data
          
          // Clear photo state
          setProfilePhoto(null);
          setPhotoPreview(null);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
          setErrorMessage(error.response?.data?.error || 'Failed to upload profile photo');
        } finally {
          setPhotoUploading(false);
        }
      };
      reader.readAsDataURL(profilePhoto);
    } catch (error: any) {
      setErrorMessage('Failed to process image file');
      setPhotoUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoUploading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/photo', { photoUrl: '' }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccessMessage('Profile photo removed successfully!');
      await refreshUser(); // Refresh user data
      
      // Clear photo state
      setProfilePhoto(null);
      setPhotoPreview(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to remove profile photo');
    } finally {
      setPhotoUploading(false);
    }
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
                  {photoPreview || getUserProfilePhoto(user as any) ? (
                    <div className="w-32 h-32 rounded-2xl shadow-lg overflow-hidden">
                      <img 
                        src={photoPreview || getUserProfilePhoto(user as any) || undefined} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">{getUserInitials(user as any)}</span>
                    </div>
                  )}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center md:text-left space-y-3">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {getUserDisplayName(user as any)}
                  </h4>
                  <p className="text-gray-600 text-lg">{user?.email}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={handlePhotoUpload}
                        disabled={photoUploading}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {photoUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{photoUploading ? 'Uploading...' : 'Save Photo'}</span>
                      </button>
                    )}
                    {getUserProfilePhoto(user as any) && (
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        disabled={photoUploading}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  {profilePhoto && (
                    <p className="text-sm text-gray-500">
                      Selected: {profilePhoto.name}
                    </p>
                  )}
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

            {/* Marketing and Security settings removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}