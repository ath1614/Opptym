import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserLimits {
  subscription: string;
  planLimits: {
    projects: number;
    submissions: number;
    tools: number;
    apiCalls: number;
  };
  usage: {
    projectsUsed: number;
    submissionsUsed: number;
    seoToolsUsed: number;
    apiCallsUsed: number;
  };
  features: {
    canCreateProjects: boolean;
    canSubmitDirectories: boolean;
    canUseSeoTools: boolean;
    canAccessAnalytics: boolean;
  };
  isInTrialPeriod: boolean;
  trialDaysLeft: number;
}

export default function FreeUserRestrictionsTest() {
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserLimits();
  }, []);

  const fetchUserLimits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserLimits(response.data);
    } catch (error) {
      console.error('Error fetching user limits:', error);
    }
  };

  const addTestResult = (test: string, result: string, details: any = {}) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const testProjectCreation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const testProject = {
        title: 'Test Project for Free User Restrictions',
        url: 'https://test-example.com',
        category: 'Test',
        email: 'test@example.com',
        name: 'Test User',
        companyName: 'Test Company',
        phone: '1234567890',
        description: 'This is a test project to verify free user restrictions'
      };

      const response = await axios.post('/api/projects', testProject, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addTestResult(
        'Project Creation',
        'SUCCESS',
        { projectId: response.data._id, message: 'Project created successfully' }
      );
    } catch (error: any) {
      const isLimitExceeded = error.response?.status === 429 || error.response?.status === 403;
      addTestResult(
        'Project Creation',
        isLimitExceeded ? 'LIMIT_EXCEEDED' : 'ERROR',
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          requiresUpgrade: error.response?.data?.requiresUpgrade
        }
      );
    }
    setLoading(false);
  };

  const testSubmissionCreation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // First get a project to submit
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (projectsResponse.data.length === 0) {
        addTestResult(
          'Submission Creation',
          'NO_PROJECTS',
          { message: 'No projects available to test submission' }
        );
        setLoading(false);
        return;
      }

      const testSubmission = {
        projectId: projectsResponse.data[0]._id,
        siteName: 'Test Directory',
        submissionType: 'directory',
        status: 'pending'
      };

      const response = await axios.post('/api/submissions', testSubmission, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addTestResult(
        'Submission Creation',
        'SUCCESS',
        { submissionId: response.data._id, message: 'Submission created successfully' }
      );
    } catch (error: any) {
      const isLimitExceeded = error.response?.status === 429 || error.response?.status === 403;
      addTestResult(
        'Submission Creation',
        isLimitExceeded ? 'LIMIT_EXCEEDED' : 'ERROR',
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          requiresUpgrade: error.response?.data?.requiresUpgrade
        }
      );
    }
    setLoading(false);
  };

  const testSeoToolUsage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/tools/seo-analyzer', {
        url: 'https://example.com'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addTestResult(
        'SEO Tool Usage',
        'SUCCESS',
        { message: 'SEO tool used successfully' }
      );
    } catch (error: any) {
      const isLimitExceeded = error.response?.status === 429 || error.response?.status === 403;
      addTestResult(
        'SEO Tool Usage',
        isLimitExceeded ? 'LIMIT_EXCEEDED' : 'ERROR',
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          requiresUpgrade: error.response?.data?.requiresUpgrade
        }
      );
    }
    setLoading(false);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  if (!userLimits) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Free User Restrictions Test</h2>
        <p>Loading user limits...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Free User Restrictions Test</h2>
      
      {/* User Limits Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current User Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Subscription:</strong> {userLimits.subscription}</p>
            <p><strong>Trial Status:</strong> {userLimits.isInTrialPeriod ? `Active (${userLimits.trialDaysLeft} days left)` : 'Expired'}</p>
          </div>
          <div>
            <p><strong>Projects:</strong> {userLimits.usage.projectsUsed}/{userLimits.planLimits.projects === -1 ? '∞' : userLimits.planLimits.projects}</p>
            <p><strong>Submissions:</strong> {userLimits.usage.submissionsUsed}/{userLimits.planLimits.submissions === -1 ? '∞' : userLimits.planLimits.submissions}</p>
            <p><strong>SEO Tools:</strong> {userLimits.usage.seoToolsUsed}/{userLimits.planLimits.tools === -1 ? '∞' : userLimits.planLimits.tools}</p>
            <p><strong>API Calls:</strong> {userLimits.usage.apiCallsUsed}/{userLimits.planLimits.apiCalls === -1 ? '∞' : userLimits.planLimits.apiCalls}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold">Feature Access:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <p className={userLimits.features.canCreateProjects ? 'text-green-600' : 'text-red-600'}>
              Create Projects: {userLimits.features.canCreateProjects ? '✅' : '❌'}
            </p>
            <p className={userLimits.features.canSubmitDirectories ? 'text-green-600' : 'text-red-600'}>
              Submit Directories: {userLimits.features.canSubmitDirectories ? '✅' : '❌'}
            </p>
            <p className={userLimits.features.canUseSeoTools ? 'text-green-600' : 'text-red-600'}>
              Use SEO Tools: {userLimits.features.canUseSeoTools ? '✅' : '❌'}
            </p>
            <p className={userLimits.features.canAccessAnalytics ? 'text-green-600' : 'text-red-600'}>
              Access Analytics: {userLimits.features.canAccessAnalytics ? '✅' : '❌'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Restrictions</h3>
        <div className="flex gap-4">
          <button
            onClick={testProjectCreation}
            disabled={loading || !userLimits.features.canCreateProjects}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Test Project Creation
          </button>
          <button
            onClick={testSubmissionCreation}
            disabled={loading || !userLimits.features.canSubmitDirectories}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Test Submission Creation
          </button>
          <button
            onClick={testSeoToolUsage}
            disabled={loading || !userLimits.features.canUseSeoTools}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-400"
          >
            Test SEO Tool Usage
          </button>
          <button
            onClick={clearTestResults}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.result === 'SUCCESS' ? 'bg-green-50 border-green-500' :
                  result.result === 'LIMIT_EXCEEDED' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.result}</p>
                    {result.details.message && (
                      <p className="text-sm mt-1">{result.details.message}</p>
                    )}
                    {result.details.requiresUpgrade && (
                      <p className="text-sm text-orange-600 font-semibold">Upgrade required!</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
