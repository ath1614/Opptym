import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Filter, Globe, MoreVertical, Eye, Edit3, Trash2, Loader2, AlertCircle
} from 'lucide-react';

import {
  getProjects,
  deleteProject as apiDeleteProject,
  getProjectById
} from '../../lib/api';

import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';
import ProjectDetails from '../Reports/ProjectDetails';

type Project = {
  _id: string;
  name: string;
  companyName: string;
  businessPhone: string;
  whatsapp: string;
  description: string;
  buildingName: string;
  address1: string;
  address2: string;
  address3: string;
  district: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  articleTitle: string;
  articleContent: string;
  authorName: string;
  authorBio: string;
  tags: string;
  productName: string;
  price: string;
  condition: string;
  productImageUrl: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  businessHours: string;
  establishedYear: string;
  logoUrl: string;
  title: string;
  url: string;
  category?: string;
  status?: string;
  email?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  targetKeywords?: string[];
  sitemapUrl?: string;
  robotsTxtUrl?: string;
  metaTagReport?: object;
  keywordDensityReport?: object;
  backlinkReport?: object;
  brokenLinksReport?: object;
  sitemapReport?: object;
  robotsReport?: object;
  keywordTrackerReport?: object;
  pageSpeedReport?: object;
  schemaReport?: object;
  altTextReport?: object;
  canonicalReport?: object;
  submissions?: {
    siteName: string;
    submissionType: string;
    submittedAt: string;
  }[];
};

const MyProjects = () => {
  // State management with proper initialization
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Fetch projects with proper error handling
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects();
      console.log('Projects fetched:', res);
      // Ensure we always have an array
      const projectsData = Array.isArray(res) ? res : [];
      setProjects(projectsData);
    } catch (err: any) {
      console.error('❌ Error fetching projects:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load projects');
      setProjects([]); // Ensure projects is always an array
    } finally {
      setLoading(false);
    }
  };

  // Safe delete function
  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await apiDeleteProject(id);
      // Safe filtering with fallback to empty array
      setProjects(prevProjects => {
        const currentProjects = Array.isArray(prevProjects) ? prevProjects : [];
        return currentProjects.filter((p) => p._id !== id);
      });
    } catch (err: any) {
      console.error('❌ Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Safe status color function
  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Safe filtering with multiple fallbacks
  const filteredProjects = React.useMemo(() => {
    try {
      // Ensure projects is an array
      const projectsArray = Array.isArray(projects) ? projects : [];
      
      return projectsArray.filter((project) => {
        // Safe string operations
        const title = project?.title || '';
        const status = project?.status || '';
        
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
    } catch (error) {
      console.error('Error filtering projects:', error);
      return [];
    }
  }, [projects, searchTerm, filterStatus]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-red-800 font-medium">Error loading projects</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600">Manage your SEO projects and track their performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-500 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            {projects.length === 0 
              ? "You haven't created any projects yet. Create your first project to get started."
              : "No projects match your current filters. Try adjusting your search or filters."
            }
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-sky-500 hover:to-blue-800 transition-all flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Project</span>
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title || 'Untitled Project'}</h3>
                      <p className="text-sm text-gray-500">{project.url || 'No URL'}</p>
                      {project.status && (
                        <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === project._id ? null : project._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenDropdown(openDropdown === project._id ? null : project._id);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Project options"
                      aria-expanded={openDropdown === project._id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {openDropdown === project._id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-32 z-10" role="menu">
                        <button
                          onClick={async () => {
                            try {
                              const res = await getProjectById(project._id);
                              setSelectedProject(res);
                              setOpenDropdown(null);
                            } catch (err) {
                              console.error('❌ Failed to load project details:', err);
                              alert('Failed to load project details. Please try again.');
                            }
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => {
                            setEditProject(project);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                              handleDelete(project._id);
                              setOpenDropdown(null);
                            }
                          }}
                          disabled={deleting === project._id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2 disabled:opacity-50"
                        >
                          {deleting === project._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>{deleting === project._id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600">Category: {project.category || 'General'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Create Project */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchProjects}
        />
      )}

      {/* Modal - Edit Project */}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={fetchProjects}
        />
      )}

      {/* Modal - View Project Details */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 overflow-y-auto max-h-screen shadow-lg">
            <ProjectDetails project={selectedProject} />
            <div className="pt-4 text-right">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-lg hover:from-sky-500 hover:to-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;