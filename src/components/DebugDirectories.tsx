import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DebugDirectories() {
  const [directories, setDirectories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  const fetchDirectories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching directories from API...');
      const response = await axios.get('/api/directories', {
        params: selectedClassification !== 'all' ? { classification: selectedClassification } : {}
      });
      
      console.log('🔍 API Response:', response.data);
      console.log('🔍 Directories count:', response.data.length);
      console.log('🔍 First directory:', response.data[0]);
      
      setDirectories(response.data);
    } catch (err: any) {
      console.error('❌ Error fetching directories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectories();
  }, [selectedClassification]);

  const classifications = ['all', 'Directory Submission', 'Article Submission', 'Press Release', 'BookMarking', 'Business Listing', 'Classified', 'More SEO'];

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg m-4">
      <h2 className="text-2xl font-bold text-red-800 mb-4">🔍 DEBUG: Raw Directories Data</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-red-700 mb-2">Filter by Classification:</label>
        <select
          value={selectedClassification}
          onChange={(e) => setSelectedClassification(e.target.value)}
          className="px-3 py-2 border border-red-300 rounded-md"
        >
          {classifications.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
        <button
          onClick={fetchDirectories}
          className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-red-600">Loading directories...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {!loading && !error && (
        <div>
          <p className="text-lg font-semibold text-red-800 mb-4">
            Total Directories: {directories.length}
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-2 border border-red-200 text-left">Name</th>
                  <th className="px-4 py-2 border border-red-200 text-left">URL Field</th>
                  <th className="px-4 py-2 border border-red-200 text-left">SubmissionURL Field</th>
                  <th className="px-4 py-2 border border-red-200 text-left">Classification</th>
                  <th className="px-4 py-2 border border-red-200 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {directories.slice(0, 20).map((dir, index) => (
                  <tr key={index} className="hover:bg-red-50">
                    <td className="px-4 py-2 border border-red-200">{dir.name}</td>
                    <td className="px-4 py-2 border border-red-200">
                      <span className={dir.url ? 'text-green-600' : 'text-red-600'}>
                        {dir.url || 'UNDEFINED'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <span className={dir.submissionUrl ? 'text-green-600' : 'text-red-600'}>
                        {dir.submissionUrl || 'UNDEFINED'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-red-200">{dir.classification}</td>
                    <td className="px-4 py-2 border border-red-200">{dir.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {directories.length > 20 && (
            <p className="mt-4 text-sm text-red-600">
              Showing first 20 of {directories.length} directories
            </p>
          )}
          
          <details className="mt-4">
            <summary className="cursor-pointer text-lg font-semibold text-red-800">Raw JSON Data (First 3)</summary>
            <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(directories.slice(0, 3), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}