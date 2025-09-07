import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DebugDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DebugDashboard: Fetching dashboard data...');
      
      // Fetch projects
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Projects:', projectsResponse.data);
      
      // Fetch submissions
      const submissionsResponse = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Submissions:', submissionsResponse.data);
      
      // Fetch subscription
      const subscriptionResponse = await axios.get('/api/subscription/details', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Subscription:', subscriptionResponse.data);
      
      // Fetch analytics
      const analyticsResponse = await axios.get('/api/analytics/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('📊 Analytics:', analyticsResponse.data);
      
      const data = {
        projects: {
          count: projectsResponse.data.length,
          data: projectsResponse.data
        },
        submissions: {
          count: submissionsResponse.data.length,
          data: submissionsResponse.data,
          byStatus: {
            success: submissionsResponse.data.filter((s: any) => s.status === 'success').length,
            pending: submissionsResponse.data.filter((s: any) => s.status === 'pending').length,
            failed: submissionsResponse.data.filter((s: any) => s.status === 'failed').length
          }
        },
        subscription: subscriptionResponse.data,
        analytics: analyticsResponse.data,
        timestamp: new Date().toISOString()
      };
      
      setDashboardData(data);
      console.log('✅ DebugDashboard: Data fetched successfully', data);
      
    } catch (err: any) {
      console.error('❌ DebugDashboard: Error fetching data', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCounterUpdate = async () => {
    try {
      console.log('🧪 Testing counter update...');
      
      // Create a test submission
      const testSubmission = {
        directoryName: 'Test Directory',
        directoryUrl: 'https://test.com',
        projectId: dashboardData?.projects?.data?.[0]?._id || 'test-project',
        status: 'pending',
        classification: 'Directory Submission'
      };
      
      const response = await axios.post('/api/submissions', testSubmission, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Test submission created:', response.data);
      
      // Refresh dashboard data
      setTimeout(() => {
        fetchDashboardData();
        // Also trigger global refresh if available
        if ((window as any).refreshDashboardData) {
          (window as any).refreshDashboardData();
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Error creating test submission:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create test submission');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-red-800 mb-4">🔍 DEBUG: Dashboard Counters</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        <button
          onClick={testCounterUpdate}
          disabled={loading || !dashboardData}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Counter Update
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">📁 Projects</h3>
            <p><strong>Count:</strong> {dashboardData.projects.count}</p>
            <div className="mt-2">
              <strong>Projects:</strong>
              <ul className="text-sm text-gray-600 mt-1">
                {dashboardData.projects.data.slice(0, 3).map((project: any, index: number) => (
                  <li key={index}>• {project.title || project.companyName || 'Untitled'}</li>
                ))}
                {dashboardData.projects.count > 3 && (
                  <li>• ... and {dashboardData.projects.count - 3} more</li>
                )}
              </ul>
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">📤 Submissions</h3>
            <p><strong>Total Count:</strong> {dashboardData.submissions.count}</p>
            <div className="mt-2">
              <strong>By Status:</strong>
              <ul className="text-sm text-gray-600 mt-1">
                <li>✅ Success: {dashboardData.submissions.byStatus.success}</li>
                <li>⏳ Pending: {dashboardData.submissions.byStatus.pending}</li>
                <li>❌ Failed: {dashboardData.submissions.byStatus.failed}</li>
              </ul>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">💳 Subscription</h3>
            <p><strong>Plan:</strong> {dashboardData.subscription.subscription}</p>
            <p><strong>Status:</strong> {dashboardData.subscription.status}</p>
            <p><strong>Submissions Used:</strong> {dashboardData.subscription.currentUsage?.submissionsUsed || 0} / {dashboardData.subscription.limits?.submissions || 'N/A'}</p>
            <p><strong>Projects Used:</strong> {dashboardData.subscription.currentUsage?.projectsUsed || 0} / {dashboardData.subscription.limits?.projects || 'N/A'}</p>
          </div>

          {/* Analytics */}
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
            {dashboardData.analytics ? (
              <div>
                <p><strong>Total Projects:</strong> {dashboardData.analytics.totalProjects || 'N/A'}</p>
                <p><strong>Total Submissions:</strong> {dashboardData.analytics.totalSubmissions || 'N/A'}</p>
                <p><strong>Success Rate:</strong> {dashboardData.analytics.successRate || 'N/A'}%</p>
                <p><strong>Backlinks Gained:</strong> {dashboardData.analytics.backlinksGained || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No analytics data available</p>
            )}
          </div>
        </div>
      )}

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Data (Click to expand)</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
