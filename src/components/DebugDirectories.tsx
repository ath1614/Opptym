import React from 'react';
import { 
  getDirectoriesByClassification, 
  getAllClassifications, 
  getTotalDirectoriesCount,
  directoriesData 
} from '../config/directoriesConfig';

export default function DebugDirectories() {
  const debugInfo = {
    totalDirectories: getTotalDirectoriesCount(),
    classifications: getAllClassifications(),
    classificationCounts: getAllClassifications().map(classification => ({
      classification,
      count: getDirectoriesByClassification(classification).length,
      directories: getDirectoriesByClassification(classification)
    })),
    rawData: directoriesData
  };

  return (
    <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4">🔍 DEBUG: Directories System</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">📊 Summary</h3>
          <p><strong>Total Directories:</strong> {debugInfo.totalDirectories}</p>
          <p><strong>Classifications:</strong> {debugInfo.classifications.length}</p>
          <p><strong>Classification Names:</strong> {debugInfo.classifications.join(', ')}</p>
        </div>

        {/* Classification Breakdown */}
        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">📋 Classification Breakdown</h3>
          {debugInfo.classificationCounts.map(({ classification, count }) => (
            <div key={classification} className="flex justify-between py-1">
              <span className="font-medium">{classification}:</span>
              <span className="text-blue-600 font-bold">{count} directories</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Directory Lists */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">📝 Detailed Directory Lists</h3>
        {debugInfo.classificationCounts.map(({ classification, directories }) => (
          <div key={classification} className="mb-4 bg-white p-4 rounded border">
            <h4 className="font-semibold text-lg mb-2">{classification} ({directories.length})</h4>
            {directories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {directories.map((dir, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{dir.name}</div>
                    <div className="text-gray-600 text-xs">{dir.url}</div>
                    <div className="text-gray-500 text-xs">{dir.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">❌ No directories found!</p>
            )}
          </div>
        ))}
      </div>

      {/* Raw Data (Collapsible) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Data (Click to expand)</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(debugInfo.rawData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
