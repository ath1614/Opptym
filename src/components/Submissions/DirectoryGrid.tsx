import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Search, Filter, Grid, List, X } from 'lucide-react';

interface Directory {
  _id: string;
  name: string;
  domain: string;
  description?: string;
  pageRank?: number;
  daScore?: number;
  spamScore?: number;
  submissionUrl: string;
  category: string;
  country: string;
}

interface DirectoryGridProps {
  directories: Directory[];
  loading?: boolean;
  onBookmarkletClick?: () => void;
  theme?: {
    primary: string;
    primaryHover: string;
    primaryBg: string;
    primaryText: string;
  };
  title?: string;
  emptyMessage?: string;
  classification?: string;
  onSubmissionCreated?: () => void;
  submissions?: any[];
  viewMode?: 'grid' | 'list';
}

export default function DirectoryGrid({ 
  directories, 
  loading = false, 
  onBookmarkletClick, 
  theme = {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryBg: 'bg-blue-50',
    primaryText: 'text-blue-600'
  }, 
  title = 'Directories', 
  emptyMessage = 'No directories found',
  classification,
  onSubmissionCreated,
  submissions = [],
  viewMode = 'grid'
}: DirectoryGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'daScore' | 'pageRank'>('daScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(viewMode);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [bookmarkletToken, setBookmarkletToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Filter and sort directories
  const filteredAndSortedDirectories = useMemo(() => {
    let filtered = directories.filter(directory => {
      const searchLower = searchTerm.toLowerCase();
      return (
        directory.name.toLowerCase().includes(searchLower) ||
        directory.domain.toLowerCase().includes(searchLower) ||
        (directory.description && directory.description.toLowerCase().includes(searchLower))
      );
    });

    // Sort directories
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'daScore':
          aValue = a.daScore || 0;
          bValue = b.daScore || 0;
          break;
        case 'pageRank':
          aValue = a.pageRank || 0;
          bValue = b.pageRank || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [directories, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDirectories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDirectories = filteredAndSortedDirectories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate unique bookmarklet token
  const generateBookmarkletToken = async () => {
    setIsGeneratingToken(true);
    try {
      // Generate a unique token with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const token = `${timestamp}_${randomString}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Store token in sessionStorage (single-use, expires on browser close)
      sessionStorage.setItem('opptym_bookmarklet_token', token);
      sessionStorage.setItem('opptym_bookmarklet_used', 'false');
      
      setBookmarkletToken(token);
    } catch (error) {
      console.error('Error generating bookmarklet token:', error);
      alert('Failed to generate bookmarklet token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Check if bookmarklet has been used
  const isBookmarkletUsed = () => {
    return sessionStorage.getItem('opptym_bookmarklet_used') === 'true';
  };

  // Mark bookmarklet as used
  const markBookmarkletAsUsed = () => {
    sessionStorage.setItem('opptym_bookmarklet_used', 'true');
    setBookmarkletToken(null);
  };

  const handleSort = (field: 'name' | 'daScore' | 'pageRank') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const SortButton = ({ field, children }: { field: 'name' | 'daScore' | 'pageRank'; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
        sortBy === field
          ? `${theme.primaryBg} ${theme.primaryText}`
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span>{children}</span>
      {sortBy === field && (
        <span className="text-xs">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading directories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedDirectories.length)} of {filteredAndSortedDirectories.length} directories
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setInternalViewMode(internalViewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-lg transition-colors ${
              internalViewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={internalViewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          >
            {internalViewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search directories by name, domain, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <SortButton field="daScore">DA Score</SortButton>
          <SortButton field="pageRank">Page Rank</SortButton>
          <SortButton field="name">Name</SortButton>
        </div>
      </div>

      {/* Directories Display */}
      {filteredAndSortedDirectories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">{emptyMessage}</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm ? 'Try adjusting your search terms' : 'No directories available for this classification'}
          </p>
        </div>
      ) : (
        <>
          {/* Grid/List View */}
          <div className={internalViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
          }>
            {currentDirectories.map((directory) => (
              <div
                key={directory._id}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                  internalViewMode === 'list' ? 'flex items-center justify-between' : ''
                }`}
              >
                {internalViewMode === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{directory.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{directory.domain}</p>
                        {directory.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{directory.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        {directory.pageRank && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PR {directory.pageRank}</span>
                        )}
                        {directory.daScore && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DA {directory.daScore}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <a
                        href={directory.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Visit <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      <button
                        onClick={() => setShowBookmarkletModal(true)}
                        className={`text-sm ${theme.primary} text-white px-3 py-1 rounded hover:${theme.primaryHover} transition-colors`}
                      >
                        Fill Form
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{directory.name}</h4>
                          <p className="text-sm text-gray-600">{directory.domain}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {directory.pageRank && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PR {directory.pageRank}</span>
                          )}
                          {directory.daScore && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DA {directory.daScore}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={directory.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Visit <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      <button
                        onClick={() => setShowBookmarkletModal(true)}
                        className={`text-sm ${theme.primary} text-white px-3 py-1 rounded hover:${theme.primaryHover} transition-colors`}
                      >
                        Fill Form
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? `${theme.primaryBg} ${theme.primaryText}`
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Secure Bookmarklet Modal */}
      {showBookmarkletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🔒 Secure Opptym Bookmarklet</h3>
              <button
                onClick={() => {
                  setShowBookmarkletModal(false);
                  setBookmarkletToken(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isBookmarkletUsed() ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚫</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Bookmarklet Already Used</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This bookmarklet has already been used and is no longer valid. Each bookmarklet can only be used once for security purposes.
                </p>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('opptym_bookmarklet_used');
                    setShowBookmarkletModal(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : !bookmarkletToken ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate Secure Bookmarklet</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Generate a secure, single-use bookmarklet for directory submissions. This bookmarklet can only be used once and will expire after use.
                </p>
                <button
                  onClick={generateBookmarkletToken}
                  disabled={isGeneratingToken}
                  className={`${theme.primary} text-white px-6 py-3 rounded-lg hover:${theme.primaryHover} transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isGeneratingToken ? 'Generating...' : 'Generate Bookmarklet'}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>⚠️ Security Notice:</strong> This bookmarklet can only be used once and will expire after use. Drag it to your bookmarks bar now.
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={`javascript:(function(){var token='${bookmarkletToken}';var script=document.createElement('script');script.src=window.location.origin+'/bookmarklet.js?token='+token;document.head.appendChild(script);})();`}
                      className={`${theme.primary} text-white px-4 py-2 rounded-lg hover:${theme.primaryHover} transition-colors text-sm font-medium cursor-move select-none`}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', e.currentTarget.href);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Drag this button to your bookmarks bar! This bookmarklet can only be used once.');
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        alert('Right-clicking is disabled for security. Please drag the bookmarklet to your bookmarks bar.');
                      }}
                      onSelectStart={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      onMouseDown={(e) => {
                        if (e.button === 2) { // Right click
                          e.preventDefault();
                          return false;
                        }
                      }}
                    >
                      🔒 Secure Bookmarklet
                    </a>
                  </div>
                  
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Security:</strong> Copying this bookmarklet is disabled. It can only be used once and will expire after use.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Drag the "🔒 Secure Bookmarklet" button to your browser's bookmarks bar</li>
                    <li>Visit any directory website (Google My Business, Yelp, etc.)</li>
                    <li>Click the bookmarklet in your bookmarks bar to auto-fill the submission form</li>
                    <li>Review and submit your listing</li>
                    <li><strong>Note:</strong> The bookmarklet will expire after one use</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
