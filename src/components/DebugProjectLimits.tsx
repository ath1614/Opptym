import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DebugProjectLimits() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DebugProjectLimits: Fetching data...');
      
      // Fetch subscription details
      const subscriptionResponse = await axios.get('/api/subscription/details', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Subscription:', subscriptionResponse.data);
      
      // Fetch projects
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Projects:', projectsResponse.data);
      
      setSubscriptionData(subscriptionResponse.data);
      setProjectsData(projectsResponse.data);
      
    } catch (err: any) {
      console.error('❌ DebugProjectLimits: Error fetching data', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testProjectCreation = async () => {
    try {
      console.log('🧪 Testing project creation...');
      
      const testProject = {
        name: 'Test Project',
        companyName: 'Test Company',
        businessPhone: '1234567890',
        whatsapp: '1234567890',
        description: 'Test project for debugging',
        buildingName: 'Test Building',
        address1: 'Test Address 1',
        address2: 'Test Address 2',
        address3: 'Test Address 3',
        district: 'Test District',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pincode: '123456',
        articleTitle: 'Test Article',
        articleContent: 'Test content',
        authorName: 'Test Author',
        authorBio: 'Test bio',
        tags: 'test,debug',
        productName: 'Test Product',
        price: '100',
        condition: 'new',
        productImageUrl: 'https://example.com/image.jpg',
        facebook: 'https://facebook.com/test',
        twitter: 'https://twitter.com/test',
        instagram: 'https://instagram.com/test',
        linkedin: 'https://linkedin.com/test',
        youtube: 'https://youtube.com/test',
        businessHours: '9-5',
        establishedYear: '2024',
        logoUrl: 'https://example.com/logo.jpg',
        title: 'Test Project Title',
        url: 'https://example.com'
      };
      
      const response = await axios.post('/api/projects', testProject, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Test project created:', response.data);
      
      // Refresh data
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Error creating test project:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create test project');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isProjectLimitReached = () => {
    if (!subscriptionData || !projectsData) return false;
    const currentUsage = projectsData.length;
    const limit = subscriptionData.limits?.projects || 2;
    return currentUsage >= limit;
  };

  return (
    <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-green-800 mb-4">🔍 DEBUG: Project Limits</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        <button
          onClick={testProjectCreation}
          disabled={loading || isProjectLimitReached()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Project Creation
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {subscriptionData && projectsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Limits */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">💳 Subscription Limits</h3>
            <p><strong>Plan:</strong> {subscriptionData.subscription}</p>
            <p><strong>Status:</strong> {subscriptionData.status}</p>
            <p><strong>Project Limit:</strong> {subscriptionData.limits?.projects || 'N/A'}</p>
            <p><strong>Submission Limit:</strong> {subscriptionData.limits?.submissions || 'N/A'}</p>
            <p><strong>SEO Tools Limit:</strong> {subscriptionData.limits?.tools || 'N/A'}</p>
          </div>

          {/* Current Usage */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">📊 Current Usage</h3>
            <p><strong>Projects Created:</strong> {projectsData.length}</p>
            <p><strong>Projects Used:</strong> {subscriptionData.currentUsage?.projectsUsed || 0}</p>
            <p><strong>Submissions Used:</strong> {subscriptionData.currentUsage?.submissionsUsed || 0}</p>
            <p><strong>SEO Tools Used:</strong> {subscriptionData.currentUsage?.seoToolsUsed || 0}</p>
          </div>

          {/* Limit Status */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">🚫 Limit Status</h3>
            <div className="space-y-2">
              <div className={`p-2 rounded ${isProjectLimitReached() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <strong>Projects:</strong> {isProjectLimitReached() ? 'LIMIT REACHED' : 'Within Limit'}
                <br />
                <span className="text-sm">
                  {projectsData.length} / {subscriptionData.limits?.projects || 2}
                </span>
              </div>
              
              <div className={`p-2 rounded ${
                (subscriptionData.currentUsage?.submissionsUsed || 0) >= (subscriptionData.limits?.submissions || 5)
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                <strong>Submissions:</strong> {
                  (subscriptionData.currentUsage?.submissionsUsed || 0) >= (subscriptionData.limits?.submissions || 5)
                    ? 'LIMIT REACHED' 
                    : 'Within Limit'
                }
                <br />
                <span className="text-sm">
                  {subscriptionData.currentUsage?.submissionsUsed || 0} / {subscriptionData.limits?.submissions || 5}
                </span>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">📁 Projects List</h3>
            {projectsData.length > 0 ? (
              <div className="space-y-2">
                {projectsData.map((project: any, index: number) => (
                  <div key={project._id || index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{project.title || project.name || 'Untitled'}</div>
                    <div className="text-gray-600">{project.companyName || 'No company'}</div>
                    <div className="text-gray-500 text-xs">
                      Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No projects found</p>
            )}
          </div>
        </div>
      )}

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Data (Click to expand)</summary>
        <div className="mt-2 space-y-4">
          <div>
            <h4 className="font-medium">Subscription Data:</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(subscriptionData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Projects Data:</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(projectsData, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
