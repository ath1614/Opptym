import React from 'react';
import { getDirectoriesByClassification, getAllClassifications, getTotalDirectoriesCount } from '@/config/directoriesConfig';

export default function TestConfig() {
  const testConfig = () => {
    try {
      console.log('🧪 Testing config file...');
      
      const classifications = getAllClassifications();
      console.log('📊 Classifications:', classifications);
      
      const totalCount = getTotalDirectoriesCount();
      console.log('📊 Total directories:', totalCount);
      
      const dirSubmissionDirs = getDirectoriesByClassification('Directory Submission');
      console.log('📊 Directory Submission directories:', dirSubmissionDirs);
      console.log('📊 Directory Submission count:', dirSubmissionDirs.length);
      
      return {
        classifications,
        totalCount,
        dirSubmissionCount: dirSubmissionDirs.length,
        dirSubmissionDirs
      };
    } catch (error) {
      console.error('❌ Config test error:', error);
      return { error: error.message };
    }
  };

  const result = testConfig();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Config Test Results</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
