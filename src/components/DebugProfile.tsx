import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserDisplayName, getUserInitials } from '../utils/userUtils';
import axios from 'axios';

export default function DebugProfile() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DebugProfile: Fetching profile data...');
      
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('📊 Profile data:', response.data);
      setProfileData(response.data);
      
    } catch (err: any) {
      console.error('❌ DebugProfile: Error fetching profile data', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testPhotoUpload = async () => {
    try {
      console.log('🧪 Testing photo upload...');
      
      // Create a test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      const dataURL = canvas.toDataURL('image/png');
      
      const response = await axios.put('/api/auth/photo', {
        photoUrl: dataURL
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Test photo uploaded:', response.data);
      
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
      
      // Refresh profile data
      setTimeout(() => {
        fetchProfileData();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Error uploading test photo:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload test photo');
    }
  };

  const testProfileUpdate = async () => {
    try {
      console.log('🧪 Testing profile update...');
      
      const testData = {
        username: `testuser_${Date.now()}`,
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        company: 'Test Company',
        website: 'https://test.com',
        timezone: 'UTC',
        bio: 'Test bio for debugging'
      };
      
      const response = await axios.put('/api/auth/profile', testData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Profile updated:', response.data);
      
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
      
      // Refresh profile data
      setTimeout(() => {
        fetchProfileData();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">🔍 DEBUG: Profile System</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={fetchProfileData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Profile Data'}
        </button>
        
        <button
          onClick={testProfileUpdate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Profile Update
        </button>
        
        <button
          onClick={testPhotoUpload}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Photo Upload
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Data from Auth Context */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">👤 User Data (Auth Context)</h3>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>First Name:</strong> {user?.firstName || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user?.lastName || 'N/A'}</p>
            <p><strong>Phone:</strong> {user?.phone || 'N/A'}</p>
            <p><strong>Company:</strong> {user?.company || 'N/A'}</p>
            <p><strong>Website:</strong> {user?.website || 'N/A'}</p>
            <p><strong>Bio:</strong> {user?.bio || 'N/A'}</p>
            <p><strong>Profile Photo:</strong> {user?.profilePhoto ? 'Yes' : 'No'}</p>
            <p><strong>Subscription:</strong> {user?.subscription || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
          </div>
        </div>

        {/* Display Name Logic */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🏷️ Display Name Logic</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Display Name:</strong> {displayName}</p>
            <p><strong>Initials:</strong> {initials}</p>
            <div className="mt-4">
              <strong>Logic Test:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• FirstName + LastName: {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}</li>
                <li>• FirstName only: {user?.firstName || 'N/A'}</li>
                <li>• Username: {user?.username || 'N/A'}</li>
                <li>• Email prefix: {user?.email ? user.email.split('@')[0] : 'N/A'}</li>
                <li>• Are firstName and lastName different? {user?.firstName && user?.lastName && user.firstName !== user.lastName ? 'Yes' : 'No'}</li>
                <li>• Are firstName and username different? {user?.firstName && user?.username && user.firstName !== user.username ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Profile Data from API */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">📊 Profile Data (API)</h3>
          {profileData ? (
            <div className="space-y-2 text-sm">
              <p><strong>Username:</strong> {profileData.username || 'N/A'}</p>
              <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
              <p><strong>First Name:</strong> {profileData.firstName || 'N/A'}</p>
              <p><strong>Last Name:</strong> {profileData.lastName || 'N/A'}</p>
              <p><strong>Phone:</strong> {profileData.phone || 'N/A'}</p>
              <p><strong>Company:</strong> {profileData.company || 'N/A'}</p>
              <p><strong>Website:</strong> {profileData.website || 'N/A'}</p>
              <p><strong>Bio:</strong> {profileData.bio || 'N/A'}</p>
              <p><strong>Profile Photo:</strong> {profileData.profilePhoto ? 'Yes' : 'No'}</p>
              <p><strong>Updated At:</strong> {profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No profile data loaded</p>
          )}
        </div>

        {/* Avatar Preview */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🖼️ Avatar Preview</h3>
          <div className="flex items-center space-x-4">
            {user?.profilePhoto ? (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">{initials}</span>
              </div>
            )}
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Data (Click to expand)</summary>
        <div className="mt-2 space-y-4">
          <div>
            <h4 className="font-medium">User Data (Auth Context):</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Profile Data (API):</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
