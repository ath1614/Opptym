import React, { useState, useEffect } from 'react';
import { getDirectoriesByClassification, getAllClassifications, directoriesData } from '../config/directoriesConfig';

export default function DebugDirectoriesFlow() {
  const [stepResults, setStepResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runFullTrace = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log('🔍 === STARTING FULL DIRECTORY FLOW TRACE ===');

      // Step 1: Check config file data
      console.log('📋 Step 1: Checking config file data...');
      results.step1_configData = {
        allClassifications: getAllClassifications(),
        totalDirectories: Object.keys(directoriesData).reduce((total, key) => total + directoriesData[key].length, 0),
        directoriesByClassification: Object.entries(directoriesData).map(([classification, dirs]) => ({
          classification,
          count: dirs.length,
          sampleDirectories: dirs.slice(0, 2).map(dir => ({ name: dir.name, url: dir.url }))
        }))
      };
      console.log('✅ Step 1 - Config data:', results.step1_configData);

      // Step 2: Test getDirectoriesByClassification function
      console.log('📋 Step 2: Testing getDirectoriesByClassification function...');
      const testClassifications = ['Directory Submission', 'Article Submission', 'Press Release'];
      results.step2_functionTest = {};
      
      testClassifications.forEach(classification => {
        const dirs = getDirectoriesByClassification(classification);
        results.step2_functionTest[classification] = {
          count: dirs.length,
          directories: dirs.map(dir => ({ name: dir.name, url: dir.url }))
        };
        console.log(`✅ ${classification}: ${dirs.length} directories`, dirs);
      });

      // Step 3: Simulate DirectorySubmission component logic
      console.log('📋 Step 3: Simulating DirectorySubmission component logic...');
      const directorySubmissionDirs = getDirectoriesByClassification('Directory Submission');
      results.step3_componentSimulation = {
        classification: 'Directory Submission',
        directoriesReceived: directorySubmissionDirs.length,
        directories: directorySubmissionDirs,
        isEmpty: directorySubmissionDirs.length === 0,
        hasData: directorySubmissionDirs.length > 0
      };
      console.log('✅ Step 3 - Component simulation:', results.step3_componentSimulation);

      // Step 4: Test DirectoryGrid props
      console.log('📋 Step 4: Testing DirectoryGrid props...');
      results.step4_directoryGridProps = {
        directories: directorySubmissionDirs,
        directoriesLength: directorySubmissionDirs.length,
        firstDirectory: directorySubmissionDirs[0] || null,
        allDirectoriesValid: directorySubmissionDirs.every(dir => dir.name && dir.url)
      };
      console.log('✅ Step 4 - DirectoryGrid props:', results.step4_directoryGridProps);

      // Step 5: Check for rendering issues
      console.log('📋 Step 5: Checking for rendering issues...');
      results.step5_renderingCheck = {
        hasDirectories: directorySubmissionDirs.length > 0,
        directoriesArray: directorySubmissionDirs,
        canRender: directorySubmissionDirs.length > 0 && directorySubmissionDirs.every(dir => dir.name && dir.url),
        potentialIssues: []
      };

      // Check for potential issues
      if (directorySubmissionDirs.length === 0) {
        results.step5_renderingCheck.potentialIssues.push('No directories found for Directory Submission');
      }
      if (directorySubmissionDirs.some(dir => !dir.name || !dir.url)) {
        results.step5_renderingCheck.potentialIssues.push('Some directories missing name or URL');
      }

      console.log('✅ Step 5 - Rendering check:', results.step5_renderingCheck);

      setStepResults(results);
      console.log('🎉 === FULL TRACE COMPLETE ===', results);

    } catch (error) {
      console.error('❌ Error during trace:', error);
      results.error = error.message;
      setStepResults(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runFullTrace();
  }, []);

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-red-800 mb-4">🔍 DEBUG: Complete Directory Flow Trace</h2>
      
      <div className="mb-4">
        <button
          onClick={runFullTrace}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Tracing...' : 'Re-run Full Trace'}
        </button>
      </div>

      {Object.keys(stepResults).length > 0 && (
        <div className="space-y-6">
          {/* Step 1: Config Data */}
          {stepResults.step1_configData && (
            <div className="bg-white p-4 rounded border">
              <h3 className="text-lg font-semibold mb-2">📋 Step 1: Config File Data</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Total Classifications:</strong> {stepResults.step1_configData.allClassifications.length}</p>
                <p><strong>Total Directories:</strong> {stepResults.step1_configData.totalDirectories}</p>
                <div>
                  <strong>Directories by Classification:</strong>
                  <ul className="mt-1 space-y-1">
                    {stepResults.step1_configData.directoriesByClassification.map((item: any, index: number) => (
                      <li key={index} className="text-xs">
                        • {item.classification}: {item.count} directories
                        {item.sampleDirectories.map((dir: any, dirIndex: number) => (
                          <div key={dirIndex} className="ml-4 text-gray-600">
                            - {dir.name} ({dir.url})
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Function Test */}
          {stepResults.step2_functionTest && (
            <div className="bg-white p-4 rounded border">
              <h3 className="text-lg font-semibold mb-2">📋 Step 2: Function Test</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(stepResults.step2_functionTest).map(([classification, data]: [string, any]) => (
                  <div key={classification} className="p-2 bg-gray-50 rounded">
                    <strong>{classification}:</strong> {data.count} directories
                    {data.directories.map((dir: any, index: number) => (
                      <div key={index} className="ml-4 text-gray-600">
                        - {dir.name} ({dir.url})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Component Simulation */}
          {stepResults.step3_componentSimulation && (
            <div className="bg-white p-4 rounded border">
              <h3 className="text-lg font-semibold mb-2">📋 Step 3: Component Simulation</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Classification:</strong> {stepResults.step3_componentSimulation.classification}</p>
                <p><strong>Directories Received:</strong> {stepResults.step3_componentSimulation.directoriesReceived}</p>
                <p><strong>Is Empty:</strong> {stepResults.step3_componentSimulation.isEmpty ? '❌ YES' : '✅ NO'}</p>
                <p><strong>Has Data:</strong> {stepResults.step3_componentSimulation.hasData ? '✅ YES' : '❌ NO'}</p>
                <div>
                  <strong>Directories:</strong>
                  <ul className="mt-1 space-y-1">
                    {stepResults.step3_componentSimulation.directories.map((dir: any, index: number) => (
                      <li key={index} className="text-xs">
                        • {dir.name} - {dir.url}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: DirectoryGrid Props */}
          {stepResults.step4_directoryGridProps && (
            <div className="bg-white p-4 rounded border">
              <h3 className="text-lg font-semibold mb-2">📋 Step 4: DirectoryGrid Props</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Directories Length:</strong> {stepResults.step4_directoryGridProps.directoriesLength}</p>
                <p><strong>First Directory:</strong> {stepResults.step4_directoryGridProps.firstDirectory ? 
                  `${stepResults.step4_directoryGridProps.firstDirectory.name} (${stepResults.step4_directoryGridProps.firstDirectory.url})` : 
                  'None'
                }</p>
                <p><strong>All Directories Valid:</strong> {stepResults.step4_directoryGridProps.allDirectoriesValid ? '✅ YES' : '❌ NO'}</p>
              </div>
            </div>
          )}

          {/* Step 5: Rendering Check */}
          {stepResults.step5_renderingCheck && (
            <div className="bg-white p-4 rounded border">
              <h3 className="text-lg font-semibold mb-2">📋 Step 5: Rendering Check</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Has Directories:</strong> {stepResults.step5_renderingCheck.hasDirectories ? '✅ YES' : '❌ NO'}</p>
                <p><strong>Can Render:</strong> {stepResults.step5_renderingCheck.canRender ? '✅ YES' : '❌ NO'}</p>
                {stepResults.step5_renderingCheck.potentialIssues.length > 0 && (
                  <div>
                    <strong>Potential Issues:</strong>
                    <ul className="mt-1 space-y-1">
                      {stepResults.step5_renderingCheck.potentialIssues.map((issue: string, index: number) => (
                        <li key={index} className="text-red-600">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {stepResults.error && (
            <div className="bg-red-100 p-4 rounded border border-red-300">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-700">{stepResults.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Raw Results */}
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">🔧 Raw Results (Click to expand)</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(stepResults, null, 2)}
        </pre>
      </details>
    </div>
  );
}
