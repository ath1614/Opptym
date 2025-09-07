import React, { useState } from 'react';
import { getAllClassifications, directoriesData } from '../config/directoriesConfig';

export default function DebugAdminPanel() {
  const [testData, setTestData] = useState<any>(null);

  const testAdminPanel = () => {
    try {
      console.log('🧪 Testing Admin Panel functionality...');
      
      const classifications = getAllClassifications();
      const totalDirectories = Object.keys(directoriesData).reduce((total, key) => total + directoriesData[key].length, 0);
      
      const data = {
        classifications: classifications,
        classificationCount: classifications.length,
        totalDirectories: totalDirectories,
        directoriesByClassification: Object.entries(directoriesData).map(([classification, dirs]) => ({
          classification,
          count: dirs.length,
          sampleDirectories: dirs.slice(0, 3).map(dir => ({
            name: dir.name,
            url: dir.url,
            description: dir.description
          }))
        })),
        timestamp: new Date().toISOString()
      };
      
      setTestData(data);
      console.log('✅ Admin Panel test successful:', data);
      
    } catch (error) {
      console.error('❌ Admin Panel test failed:', error);
    }
  };

  const testClassificationConsistency = () => {
    try {
      console.log('🧪 Testing classification consistency...');
      
      const classifications = getAllClassifications();
      const frontendClassifications = [
        'Directory Submission',
        'Article Submission', 
        'Press Release',
        'BookMarking',
        'Business Listing',
        'Classified',
        'More SEO'
      ];
      
      const consistencyCheck = {
        configClassifications: classifications,
        frontendClassifications: frontendClassifications,
        missingInConfig: frontendClassifications.filter(cls => !classifications.includes(cls)),
        missingInFrontend: classifications.filter(cls => !frontendClassifications.includes(cls)),
        isConsistent: frontendClassifications.every(cls => classifications.includes(cls)) && 
                     classifications.every(cls => frontendClassifications.includes(cls))
      };
      
      console.log('✅ Classification consistency check:', consistencyCheck);
      return consistencyCheck;
      
    } catch (error) {
      console.error('❌ Classification consistency check failed:', error);
      return null;
    }
  };

  const consistencyCheck = testClassificationConsistency();

  return (
    <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">🔍 DEBUG: Admin Panel System</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={testAdminPanel}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Test Admin Panel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classification Consistency */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🔄 Classification Consistency</h3>
          {consistencyCheck ? (
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${consistencyCheck.isConsistent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Status:</strong> {consistencyCheck.isConsistent ? '✅ Consistent' : '❌ Inconsistent'}
              </div>
              <div>
                <strong>Config Classifications ({consistencyCheck.configClassifications.length}):</strong>
                <ul className="mt-1 space-y-1">
                  {consistencyCheck.configClassifications.map((cls, index) => (
                    <li key={index} className="text-xs">• {cls}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Frontend Classifications ({consistencyCheck.frontendClassifications.length}):</strong>
                <ul className="mt-1 space-y-1">
                  {consistencyCheck.frontendClassifications.map((cls, index) => (
                    <li key={index} className="text-xs">• {cls}</li>
                  ))}
                </ul>
              </div>
              {consistencyCheck.missingInConfig.length > 0 && (
                <div className="p-2 bg-red-100 text-red-800 rounded">
                  <strong>Missing in Config:</strong> {consistencyCheck.missingInConfig.join(', ')}
                </div>
              )}
              {consistencyCheck.missingInFrontend.length > 0 && (
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
                  <strong>Missing in Frontend:</strong> {consistencyCheck.missingInFrontend.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Consistency check failed</p>
          )}
        </div>

        {/* Admin Panel Data */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">📊 Admin Panel Data</h3>
          {testData ? (
            <div className="space-y-2 text-sm">
              <p><strong>Total Classifications:</strong> {testData.classificationCount}</p>
              <p><strong>Total Directories:</strong> {testData.totalDirectories}</p>
              <div>
                <strong>Directories by Classification:</strong>
                <ul className="mt-1 space-y-1">
                  {testData.directoriesByClassification.map((item: any, index: number) => (
                    <li key={index} className="text-xs">
                      • {item.classification}: {item.count} directories
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No test data available</p>
          )}
        </div>
      </div>

      {/* Sample Directories */}
      {testData && (
        <div className="mt-6 bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">📝 Sample Directories by Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testData.directoriesByClassification.map((item: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 mb-2">{item.classification} ({item.count})</h4>
                <div className="space-y-1">
                  {item.sampleDirectories.map((dir: any, dirIndex: number) => (
                    <div key={dirIndex} className="text-xs text-gray-600">
                      <div className="font-medium">{dir.name}</div>
                      <div className="text-blue-600">{dir.url}</div>
                      {dir.description && (
                        <div className="text-gray-500">{dir.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Data (Click to expand)</summary>
        <div className="mt-2 space-y-4">
          <div>
            <h4 className="font-medium">Test Data:</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Consistency Check:</h4>
            <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(consistencyCheck, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
