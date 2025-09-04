const fs = require('fs');
const path = require('path');

// Component configurations
const components = [
  {
    file: 'src/components/Submissions/Australia.tsx',
    classification: 'Local',
    color: 'red',
    icon: 'MapPin',
    title: 'Australia',
    description: 'Submit to Australian local business directories'
  },
  {
    file: 'src/components/Submissions/ClassifiedAds.tsx',
    classification: 'Classified',
    color: 'indigo',
    icon: 'Tag',
    title: 'Classified Ads',
    description: 'Submit to classified advertisement platforms'
  },
  {
    file: 'src/components/Submissions/QAPlatforms.tsx',
    classification: 'Q&A',
    color: 'pink',
    icon: 'MessageCircle',
    title: 'Q&A Platforms',
    description: 'Submit to question and answer platforms'
  },
  {
    file: 'src/components/Submissions/SocialMedia.tsx',
    classification: 'Social',
    color: 'blue',
    icon: 'Share2',
    title: 'Social Media',
    description: 'Submit to social media platforms'
  },
  {
    file: 'src/components/Submissions/LocalBusiness.tsx',
    classification: 'Local',
    color: 'green',
    icon: 'Building',
    title: 'Local Business',
    description: 'Submit to local business directories'
  }
];

// Template for the directory section
const directorySectionTemplate = (config) => `
      {/* Available ${config.title} Platforms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available ${config.title} Platforms</h3>
            <p className="text-gray-600 text-sm">Click "Fill Form" to get the bookmarklet for each platform</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Platforms: {filteredDirectories.length}</span>
            <span>Your Submissions: {filteredSubmissions.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-${config.color}-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading platforms...</p>
          </div>
        ) : filteredDirectories.length === 0 ? (
          <div className="text-center py-8">
            <${config.icon} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No ${config.title.toLowerCase()} platforms available</p>
            <p className="text-sm text-gray-500">Contact admin to add ${config.title.toLowerCase()} platforms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectories.map((directory) => (
              <div key={directory._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{directory.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{directory.domain}</p>
                    {directory.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{directory.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {directory.pageRank && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PR {directory.pageRank}</span>
                    )}
                    {directory.daScore && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DA {directory.daScore}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <a
                      href={directory.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </a>
                  </div>
                  <button
                    onClick={() => setShowBookmarkletModal(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Fill Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>`;

// Template for bookmarklet modal
const bookmarkletModalTemplate = (config) => `
      {/* Bookmarklet Modal */}
      {showBookmarkletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Fill Form Bookmarklet</h2>
              <button
                onClick={() => setShowBookmarkletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-${config.color}-50 to-indigo-50 rounded-lg border border-${config.color}-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">${config.title} Bookmarklet</h3>
                    <p className="text-gray-600 text-sm">
                      Drag the button below to your bookmarks bar for instant ${config.title.toLowerCase()} submissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href="javascript:(function(){var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js';document.head.appendChild(script);})();"
                      className="bg-${config.color}-600 text-white px-4 py-2 rounded-lg hover:bg-${config.color}-700 transition-colors text-sm font-medium cursor-move"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', e.currentTarget.href);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        showPopup('Drag this button to your bookmarks bar!', 'info');
                      }}
                    >
                      📌 ${config.title} Bookmarklet
                    </a>
                    <button
                      onClick={() => {
                        const bookmarkletCode = \`javascript:(function(){var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js';document.head.appendChild(script);})();\`;
                        navigator.clipboard.writeText(bookmarkletCode).then(() => {
                          showPopup('Bookmarklet code copied to clipboard!', 'success');
                        }).catch(() => {
                          showPopup('Failed to copy to clipboard', 'error');
                        });
                      }}
                      className="text-${config.color}-600 hover:text-${config.color}-800 text-sm font-medium"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg border border-${config.color}-100">
                  <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Drag the "📌 ${config.title} Bookmarklet" button to your browser's bookmarks bar</li>
                    <li>Visit any ${config.title.toLowerCase()} platform</li>
                    <li>Click the bookmarklet in your bookmarks bar to auto-fill the submission form</li>
                    <li>Review and submit your ${config.title.toLowerCase()}</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The bookmarklet will automatically detect form fields on ${config.title.toLowerCase()} platforms and fill them with your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}`;

console.log('Component update script created. This would update all remaining components with directory functionality.');
console.log('Components to update:', components.map(c => c.file));
