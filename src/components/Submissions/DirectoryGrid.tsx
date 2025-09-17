import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Search, Grid, List, X } from 'lucide-react';
import { Directory } from '../../config/directoriesConfig';
import ProjectSelectionModal from '../Modals/ProjectSelectionModal';
import { showPopup } from '../../utils/popup';
import { useAuth } from '../../hooks/useAuth';

interface DirectoryGridProps {
  directories: Directory[];
  loading?: boolean;
  theme?: {
    primary: string;
    primaryHover: string;
    primaryBg: string;
    primaryText: string;
  };
  title?: string;
  emptyMessage?: string;
  classification?: string;
  viewMode?: 'grid' | 'list';
  onSubmissionCreated?: () => void;
}

export default function DirectoryGrid({ 
  directories, 
  loading = false, 
  theme = {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryBg: 'bg-blue-50',
    primaryText: 'text-blue-600'
  }, 
  title = 'Directories', 
  emptyMessage = 'No directories found',
  classification,
  viewMode = 'grid',
  onSubmissionCreated
}: DirectoryGridProps) {
  const { user } = useAuth();
  const displayDirectories = directories || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'daScore' | 'pageRank'>('daScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(viewMode);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [bookmarkletToken, setBookmarkletToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [showProjectSelection, setShowProjectSelection] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<Directory | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Filter and sort directories
  const filteredAndSortedDirectories = useMemo(() => {
    let filtered = displayDirectories.filter(directory => {
      const searchLower = searchTerm.toLowerCase();
      return (
        directory.name.toLowerCase().includes(searchLower) ||
        (directory.url && directory.url.toLowerCase().includes(searchLower)) ||
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
  }, [displayDirectories, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDirectories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDirectories = filteredAndSortedDirectories.slice(startIndex, endIndex);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate unique bookmarklet token with project data
  const generateBookmarkletToken = async () => {
    console.log('generateBookmarkletToken called with:', { selectedProject, selectedDirectory });
    
    if (!selectedProject) {
      showPopup('❌ No project selected. Please select a project first.', 'warning');
      setShowBookmarkletModal(false);
      setShowProjectSelection(true);
      return;
    }

    if (!selectedDirectory) {
      showPopup('❌ No directory selected. Please select a directory first.', 'warning');
      setShowBookmarkletModal(false);
      return;
    }

    // Validate project data
    const requiredFields = ['name', 'email', 'companyName', 'url'];
    const missingFields = requiredFields.filter(field => 
      !selectedProject[field] || selectedProject[field] === ''
    );

    if (missingFields.length > 0) {
      showPopup(`❌ Project "${selectedProject.title}" is missing required fields: ${missingFields.join(', ')}. Please edit your project or select a different one.`, 'error');
      setShowBookmarkletModal(false);
      setShowProjectSelection(true);
      return;
    }

    // Validate directory data
    if (!selectedDirectory.name || !selectedDirectory.url) {
      showPopup(`❌ Directory data is incomplete. Missing: ${!selectedDirectory.name ? 'name' : ''} ${!selectedDirectory.url ? 'url' : ''}`, 'error');
      setShowBookmarkletModal(false);
      return;
    }

    setIsGeneratingToken(true);
    try {
      // Get auth token
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        showPopup('❌ Please log in to generate bookmarklet tokens.', 'error');
        setIsGeneratingToken(false);
        return;
      }

      // Generate bookmarklet token from server
      const response = await fetch('https://api.opptym.com/api/bookmarklet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          projectId: selectedProject._id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate bookmarklet token');
      }

      const { token: bookmarkletToken, expiresAt, maxUsage, usageCount, rateLimitSeconds } = result.data;
      
      // Store token and project data in sessionStorage
      sessionStorage.setItem('opptym_bookmarklet_token', bookmarkletToken);
      sessionStorage.setItem('opptym_bookmarklet_used', 'false');
      sessionStorage.setItem('opptym_bookmarklet_project', JSON.stringify(selectedProject));
      sessionStorage.setItem('opptym_bookmarklet_directory', JSON.stringify(selectedDirectory));
      
      console.log('Generated bookmarklet token:', bookmarkletToken);
      console.log('Project data:', selectedProject);
      console.log('Directory data:', selectedDirectory);
      console.log('Token details:', { expiresAt, maxUsage, usageCount, rateLimitSeconds });
      
      setBookmarkletToken(bookmarkletToken);
      
      // Test bookmarklet functionality
      testBookmarkletFunctionality(bookmarkletToken, selectedProject, selectedDirectory);
    } catch (error) {
      console.error('Error generating bookmarklet token:', error);
      showPopup('❌ Failed to generate bookmarklet token. Please try again.', 'error');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Generate unique bookmarklet token with project data (using parameters)
  const generateBookmarkletTokenWithData = async (project: any, directory: any) => {
    console.log('generateBookmarkletTokenWithData called with:', { project, directory });

    if (!project) {
      showPopup('❌ No project selected. Please select a project first.', 'warning');
      setShowBookmarkletModal(false);
      setShowProjectSelection(true);
      return;
    }

    if (!directory) {
      showPopup('❌ No directory selected. Please select a directory first.', 'warning');
      setShowBookmarkletModal(false);
      return;
    }

    // Validate project data
    const requiredFields = ['name', 'email', 'companyName', 'url'];
    const missingFields = requiredFields.filter(field => 
      !project[field] || project[field] === ''
    );

    if (missingFields.length > 0) {
      showPopup(`❌ Project "${project.title}" is missing required fields: ${missingFields.join(', ')}. Please edit your project or select a different one.`, 'error');
      setShowBookmarkletModal(false);
      setShowProjectSelection(true);
      return;
    }

    // Validate directory data
    if (!directory.name) {
      showPopup(`❌ Directory data is incomplete. Missing: name`, 'error');
      setShowBookmarkletModal(false);
      return;
    }
    
    // Note: URL is optional for bookmarklet functionality
    if (!directory.url) {
      console.warn('Directory has no URL, but continuing with bookmarklet generation');
    }

    setIsGeneratingToken(true);
    try {
      // Get auth token
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        showPopup('❌ Please log in to generate bookmarklet tokens.', 'error');
        setIsGeneratingToken(false);
        return;
      }

      // Generate bookmarklet token from server
      const response = await fetch('https://api.opptym.com/api/bookmarklet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          projectId: project._id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate bookmarklet token');
      }

      const { token: bookmarkletToken, expiresAt, maxUsage, usageCount, rateLimitSeconds } = result.data;
      
      // Store token and project data in sessionStorage
      sessionStorage.setItem('opptym_bookmarklet_token', bookmarkletToken);
      sessionStorage.setItem('opptym_bookmarklet_used', 'false');
      sessionStorage.setItem('opptym_bookmarklet_project', JSON.stringify(project));
      sessionStorage.setItem('opptym_bookmarklet_directory', JSON.stringify(directory));
      
      console.log('Generated bookmarklet token:', bookmarkletToken);
      console.log('Project data:', project);
      console.log('Directory data:', directory);
      console.log('Token details:', { expiresAt, maxUsage, usageCount, rateLimitSeconds });
      
      setBookmarkletToken(bookmarkletToken);
      
      // Test bookmarklet functionality
      testBookmarkletFunctionality(bookmarkletToken, project, directory);
    } catch (error) {
      console.error('Error generating bookmarklet token:', error);
      showPopup('❌ Failed to generate bookmarklet token. Please try again.', 'error');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Global function for bookmarklet to call when submission is created
  React.useEffect(() => {
    (window as any).opptymSubmissionCreated = () => {
      console.log('Submission created callback triggered');
      if (onSubmissionCreated) {
        onSubmissionCreated();
      }
    };
    
    return () => {
      delete (window as any).opptymSubmissionCreated;
    };
  }, [onSubmissionCreated]);

  // Test bookmarklet functionality
  const testBookmarkletFunctionality = (token: string, project: any, directory: any) => {
    console.log('=== COMPREHENSIVE BOOKMARKLET TEST ===');
    console.log('Token:', token);
    console.log('Project:', project);
    console.log('Directory:', directory);
    
    // Test URL generation
    const projectJson = JSON.stringify(project);
    const directoryJson = JSON.stringify(directory);
    const encodedProject = encodeURIComponent(projectJson);
    const encodedDirectory = encodeURIComponent(directoryJson);
    
    console.log('Data encoding test:');
    console.log('- Project JSON length:', projectJson.length);
    console.log('- Directory JSON length:', directoryJson.length);
    console.log('- Encoded project length:', encodedProject.length);
    console.log('- Encoded directory length:', encodedDirectory.length);
    
    const bookmarkletUrl = `javascript:(function(){console.log('Bookmarklet clicked!');var token='${token}';var projectData=${projectJson};var directoryData=${directoryJson};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(JSON.stringify(projectData))+'&directory='+encodeURIComponent(JSON.stringify(directoryData));console.log('Loading script:',script.src);document.head.appendChild(script);})();`;
    
    console.log('Generated bookmarklet URL length:', bookmarkletUrl.length);
    console.log('Bookmarklet URL preview:', bookmarkletUrl.substring(0, 200) + '...');
    
    // Test URL parameter parsing
    const testUrl = `https://opptym.com/bookmarklet.js?token=${token}&project=${encodedProject}&directory=${encodedDirectory}`;
    const urlParams = new URLSearchParams(testUrl.split('?')[1]);
    const testToken = urlParams.get('token');
    const testProjectParam = urlParams.get('project');
    const testDirectoryParam = urlParams.get('directory');
    
    console.log('URL parameter parsing test:');
    console.log('- Token matches:', testToken === token);
    console.log('- Project param exists:', !!testProjectParam);
    console.log('- Directory param exists:', !!testDirectoryParam);
    
    // Test JSON parsing with robust error handling
    try {
      let parsedProject = null;
      let parsedDirectory = null;
      
      if (testProjectParam) {
        try {
          parsedProject = JSON.parse(decodeURIComponent(testProjectParam));
        } catch (decodeError) {
          console.warn('Project decode failed, trying alternative methods...');
          try {
            // Try with unescape as fallback
            parsedProject = JSON.parse(unescape(testProjectParam));
          } catch (unescapeError) {
            console.warn('Project unescape failed, trying manual replacement...');
            // Manual replacement of common URI encoding issues
            const manualDecoded = testProjectParam
              .replace(/%22/g, '"')
              .replace(/%7B/g, '{')
              .replace(/%7D/g, '}')
              .replace(/%5B/g, '[')
              .replace(/%5D/g, ']')
              .replace(/%2C/g, ',')
              .replace(/%3A/g, ':')
              .replace(/%20/g, ' ')
              .replace(/%2F/g, '/')
              .replace(/%2B/g, '+')
              .replace(/%3F/g, '?')
              .replace(/%3D/g, '=')
              .replace(/%26/g, '&')
              .replace(/%23/g, '#')
              .replace(/%25/g, '%');
            parsedProject = JSON.parse(manualDecoded);
          }
        }
      }
      
      if (testDirectoryParam) {
        try {
          parsedDirectory = JSON.parse(decodeURIComponent(testDirectoryParam));
        } catch (decodeError) {
          console.warn('Directory decode failed, trying alternative methods...');
          try {
            // Try with unescape as fallback
            parsedDirectory = JSON.parse(unescape(testDirectoryParam));
          } catch (unescapeError) {
            console.warn('Directory unescape failed, trying manual replacement...');
            // Manual replacement of common URI encoding issues
            const manualDecoded = testDirectoryParam
              .replace(/%22/g, '"')
              .replace(/%7B/g, '{')
              .replace(/%7D/g, '}')
              .replace(/%5B/g, '[')
              .replace(/%5D/g, ']')
              .replace(/%2C/g, ',')
              .replace(/%3A/g, ':')
              .replace(/%20/g, ' ')
              .replace(/%2F/g, '/')
              .replace(/%2B/g, '+')
              .replace(/%3F/g, '?')
              .replace(/%3D/g, '=')
              .replace(/%26/g, '&')
              .replace(/%23/g, '#')
              .replace(/%25/g, '%');
            parsedDirectory = JSON.parse(manualDecoded);
          }
        }
      }
      
      console.log('JSON parsing test:');
      console.log('- Project parsed successfully:', !!parsedProject);
      console.log('- Directory parsed successfully:', !!parsedDirectory);
      console.log('- Project name matches:', parsedProject?.name === project.name);
      console.log('- Directory name matches:', parsedDirectory?.name === directory.name);
    } catch (e) {
      console.error('JSON parsing test failed:', e);
    }
    
    // Test data validation
    const requiredProjectFields = ['name', 'email', 'companyName', 'url'];
    const missingFields = requiredProjectFields.filter(field => !project[field] || project[field] === '');
    
    console.log('Project validation:', {
      hasAllRequiredFields: missingFields.length === 0,
      missingFields: missingFields,
      projectData: {
        name: project.name,
        email: project.email,
        companyName: project.companyName,
        url: project.url
      }
    });
    
    console.log('Directory validation:', {
      hasName: !!directory.name,
      hasUrl: !!directory.url,
      directoryData: {
        name: directory.name,
        url: directory.url
      }
    });
    
    console.log('=== END COMPREHENSIVE BOOKMARKLET TEST ===');
  };

  // Check if bookmarklet has been used
  const isBookmarkletUsed = () => {
    return sessionStorage.getItem('opptym_bookmarklet_used') === 'true';
  };


  // Handle Fill Form button click - show project selection first
  const handleFillFormClick = (directory: Directory) => {
    console.log('Fill Form clicked for directory:', directory);
    setSelectedDirectory(directory);
    setShowProjectSelection(true);
  };

  // Handle project selection from modal
  const handleProjectSelected = (project: any) => {
    console.log('DirectoryGrid: Project selected:', project);
    console.log('DirectoryGrid: Selected directory preserved:', selectedDirectory);
    setSelectedProject(project);
    setShowProjectSelection(false);
    setShowBookmarkletModal(true);
    console.log('DirectoryGrid: Modal states updated - project selection closed, bookmarklet modal opened');
    console.log('DirectoryGrid: About to generate bookmarklet with:', { project, selectedDirectory });
    
    // Generate bookmarklet token automatically after project selection
    // Pass project and directory directly to avoid state timing issues
    setTimeout(() => {
      generateBookmarkletTokenWithData(project, selectedDirectory);
    }, 100);
  };

  // Close project selection modal
  const handleCloseProjectSelection = () => {
    setShowProjectSelection(false);
    // Don't clear selectedDirectory here - it should persist until bookmarklet is used
  };

  // Close bookmarklet modal and clear selections
  const handleCloseBookmarkletModal = () => {
    setShowBookmarkletModal(false);
    setBookmarkletToken(null);
    setSelectedProject(null);
    setSelectedDirectory(null);
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
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4' 
            : 'space-y-3'
          }>
            {currentDirectories.map((directory, index) => (
              <div
                key={`${directory.name}-${directory.url || 'no-url'}-${index}`}
                className={`group border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
                  internalViewMode === 'list' ? 'flex items-center justify-between' : ''
                }`}
              >
                {internalViewMode === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{directory.name}</h4>
                        {directory.url ? (
                          <a
                            href={directory.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={directory.url}
                            className="text-xs text-blue-600 hover:text-blue-800 mb-1 block truncate max-w-full"
                          >
                            {directory.url.length > 35 ? `${directory.url.substring(0, 35)}...` : directory.url}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 mb-1 block">No URL available</span>
                        )}
                        {directory.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{directory.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                        {directory.pageRank && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">PR {directory.pageRank}</span>
                        )}
                        {directory.daScore && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">DA {directory.daScore}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {directory.url ? (
                        <a
                          href={directory.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center whitespace-nowrap"
                        >
                          Visit <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No URL</span>
                      )}
                      <button
                        onClick={() => handleFillFormClick(directory)}
                        className={`text-xs ${theme.primary} text-white px-2 py-1 rounded hover:${theme.primaryHover} transition-colors`}
                      >
                        Fill Form
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{directory.name}</h4>
                          {directory.url ? (
                            <a
                              href={directory.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={directory.url}
                              className="text-sm text-blue-600 hover:text-blue-800 block truncate max-w-[400px]"
                            >
                              {directory.url.length > 50 ? `${directory.url.substring(0, 50)}...` : directory.url}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">No URL available</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {directory.pageRank && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">PR {directory.pageRank}</span>
                          )}
                          {directory.daScore && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">DA {directory.daScore}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {directory.url ? (
                        <a
                          href={directory.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Visit <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No URL</span>
                      )}
                      <button
                        onClick={() => handleFillFormClick(directory)}
                        className={`text-xs ${theme.primary} text-white px-2 py-1 rounded hover:${theme.primaryHover} transition-colors`}
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🔒 Secure Opptym Bookmarklet</h3>
                {selectedProject && (
                  <div className="mt-1 text-sm text-blue-600">
                    📋 Project: <strong>{selectedProject.title}</strong>
                  </div>
                )}
                {selectedDirectory && (
                  <div className="text-sm text-gray-600">
                    🎯 Directory: <strong>{selectedDirectory.name}</strong>
                  </div>
                )}
              </div>
              <button
                onClick={handleCloseBookmarkletModal}
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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>⚠️ Security Notice:</strong> This bookmarklet can only be used once and will expire after use. Drag it to your bookmarks bar now.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Directory: <strong>{selectedDirectory?.name}</strong> | URL: <strong>{selectedDirectory?.url}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowBookmarkletModal(false);
                        setShowProjectSelection(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Change Project
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={`javascript:(function(){console.log('Bookmarklet clicked!');var token='${bookmarkletToken}';var projectData=${JSON.stringify(selectedProject)};var directoryData=${JSON.stringify(selectedDirectory)};console.log('Token:',token,'Project:',projectData,'Directory:',directoryData);var script=document.createElement('script');script.src='https://opptym.com/bookmarklet.js?token='+token+'&project='+encodeURIComponent(JSON.stringify(projectData))+'&directory='+encodeURIComponent(JSON.stringify(directoryData));console.log('Loading script:',script.src);document.head.appendChild(script);})();`}
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
                      onDragStart={(e: any) => {
                        e.dataTransfer.setData('text/plain', e.currentTarget.href);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={(e: any) => {
                        e.preventDefault();
                        showPopup('Drag this button to your bookmarks bar! This bookmarklet can only be used once.', 'info');
                      }}
                      onContextMenu={(e: any) => {
                        e.preventDefault();
                        showPopup('Right-clicking is disabled for security. Please drag the bookmarklet to your bookmarks bar.', 'warning');
                      }}
                      onMouseDown={(e: any) => {
                        if (e.button === 2) { // Right click
                          e.preventDefault();
                          return false;
                        }
                      }}
                    >
                      🔒 Secure Bookmarklet
                    </a>
                    
                    <a
                      href={selectedDirectory?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        console.log('Visit Website clicked:', selectedDirectory?.url);
                        if (!selectedDirectory?.url) {
                          showPopup('No URL available for this directory', 'warning');
                          return false;
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                    
                    <button
                      onClick={() => {
                        console.log('Testing bookmarklet functionality...');
                        if (bookmarkletToken && selectedProject && selectedDirectory) {
                          testBookmarkletFunctionality(bookmarkletToken, selectedProject, selectedDirectory);
                        } else {
                          showPopup('Missing bookmarklet data. Please generate bookmarklet first.', 'warning');
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      🧪 Test Bookmarklet
                    </button>
                    
                    {!bookmarkletToken && (
                      <button
                        onClick={generateBookmarkletToken}
                        disabled={isGeneratingToken}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        {isGeneratingToken ? '⏳ Generating...' : '🔄 Generate Bookmarklet'}
                      </button>
                    )}
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
                    <li>Click "Visit Website" to open the directory website in a new tab</li>
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

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={showProjectSelection}
        onClose={handleCloseProjectSelection}
        onProjectSelected={handleProjectSelected}
        directoryName={selectedDirectory?.name || ''}
        classification={classification || ''}
      />
    </div>
  );
}
