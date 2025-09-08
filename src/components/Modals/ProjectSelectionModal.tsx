import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Plus, ExternalLink, User, Building, Globe, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getProjects } from '../../lib/api';

interface Project {
  _id: string;
  title: string;
  url: string;
  name?: string;
  email?: string;
  companyName?: string;
  businessPhone?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelected: (project: Project) => void;
  directoryName: string;
  classification: string;
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  onClose,
  onProjectSelected,
  directoryName,
  classification
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showOnlyReady, setShowOnlyReady] = useState(true);

  // Fetch user projects
  useEffect(() => {
    console.log('ProjectSelectionModal useEffect:', { isOpen, user: !!user });
    if (isOpen && user) {
      console.log('Fetching projects for user:', user.email);
      fetchProjects();
    }
  }, [isOpen, user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsData = await getProjects();
      console.log('Projects fetched in modal:', projectsData);
      
      // Ensure we always have an array
      const projectsArray = Array.isArray(projectsData) ? projectsData : [];
      setProjects(projectsArray);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Validate project data for form filling
  const validateProject = (project: Project) => {
    const errors: string[] = [];
    const requiredFields = [
      { key: 'name', label: 'Contact Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'url', label: 'Website URL' }
    ];

    requiredFields.forEach(field => {
      if (!project[field.key as keyof Project] || project[field.key as keyof Project] === '') {
        errors.push(`${field.label} is required`);
      }
    });

    // Validate email format
    if (project.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.email)) {
      errors.push('Email format is invalid');
    }

    // Validate URL format
    if (project.url && !/^https?:\/\/.+/.test(project.url)) {
      errors.push('Website URL must start with http:// or https://');
    }

    return errors;
  };

  const handleProjectSelect = (project: Project) => {
    console.log('Project selected:', project);
    setSelectedProject(project);
    const errors = validateProject(project);
    console.log('Validation errors:', errors);
    setValidationErrors(errors);
  };

  const handleConfirmSelection = () => {
    console.log('Confirm selection clicked:', { selectedProject, validationErrors });
    if (selectedProject && validationErrors.length === 0) {
      console.log('Calling onProjectSelected with:', selectedProject);
      onProjectSelected(selectedProject);
      onClose();
    } else {
      console.log('Cannot proceed:', { 
        hasProject: !!selectedProject, 
        errorsCount: validationErrors.length,
        errors: validationErrors 
      });
    }
  };

  const getProjectCompleteness = (project: Project) => {
    const requiredFields = ['name', 'email', 'companyName', 'url'];
    const filledFields = requiredFields.filter(field => 
      project[field as keyof Project] && project[field as keyof Project] !== ''
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  if (!isOpen) return null;

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎯 Select Project for Submission
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Choose which project to use for <strong>{directoryName}</strong> submission
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Classification: {classification}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Project Selection Guide</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Only <strong>Ready</strong> projects can be selected for submissions. Complete any incomplete projects by adding missing required fields.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnlyReady"
                checked={showOnlyReady}
                onChange={(e) => setShowOnlyReady(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showOnlyReady" className="text-sm text-blue-700 dark:text-blue-300">
                Show only ready projects
              </label>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Projects
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error}
              </p>
              <button
                onClick={fetchProjects}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Projects Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to create a project first before you can submit to directories.
              </p>
              <button
                onClick={() => {
                  onClose();
                  // Navigate to projects tab
                  window.location.hash = 'projects';
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create New Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project Count */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {(() => {
                    const readyProjects = projects.filter(p => validateProject(p).length === 0);
                    const totalProjects = projects.length;
                    return showOnlyReady 
                      ? `${readyProjects.length} ready project${readyProjects.length !== 1 ? 's' : ''} available`
                      : `${readyProjects.length} ready, ${totalProjects - readyProjects.length} incomplete (${totalProjects} total)`;
                  })()}
                </div>
              </div>
              <div className="grid gap-4">
                {(() => {
                  const filteredProjects = projects.filter(project => {
                    if (showOnlyReady) {
                      const errors = validateProject(project);
                      return errors.length === 0;
                    }
                    return true;
                  });
                  
                  if (filteredProjects.length === 0 && showOnlyReady) {
                    return (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No Ready Projects Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          All your projects are incomplete. Complete them by adding required fields or create a new project.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => setShowOnlyReady(false)}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                          >
                            <AlertCircle className="w-5 h-5" />
                            Show All Projects
                          </button>
                          <button
                            onClick={() => window.open('/projects', '_blank')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Create New Project
                          </button>
                        </div>
                      </div>
                    );
                  }
                  
                  return filteredProjects.map((project) => {
                  const completeness = getProjectCompleteness(project);
                  const isSelected = selectedProject?._id === project._id;
                  const errors = validateProject(project);
                  const isValid = errors.length === 0;

                  return (
                    <div
                      key={project._id}
                      onClick={() => isValid ? handleProjectSelect(project) : null}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        isValid 
                          ? `cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }`
                          : 'cursor-not-allowed opacity-60 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {isValid ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Ready</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Incomplete</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {completeness}% complete
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Globe className="w-4 h-4" />
                              <span className="truncate">{project.url}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Building className="w-4 h-4" />
                              <span className="truncate">{project.companyName || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <User className="w-4 h-4" />
                              <span className="truncate">{project.name || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{project.email || 'Not set'}</span>
                            </div>
                          </div>

                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>

                        <div className="ml-4">
                          <div className={`w-3 h-3 rounded-full ${
                            isSelected ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'
                          }`}></div>
                        </div>
                      </div>

                      {!isValid && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Missing Required Fields:</span>
                          </div>
                          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                            {errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                          <div className="mt-2 text-xs text-red-600 dark:text-red-300 font-medium">
                            ⚠️ Complete this project to use it for submissions
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedProject ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Selected: <strong>{selectedProject.title}</strong></span>
                {validationErrors.length === 0 ? (
                  <span className="text-green-600">• Ready to submit</span>
                ) : (
                  <span className="text-orange-600">• {validationErrors.length} validation error(s)</span>
                )}
              </div>
            ) : (
              <span>Please select a project to continue</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedProject || validationErrors.length > 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              title={!selectedProject ? 'Please select a project' : validationErrors.length > 0 ? `Missing fields: ${validationErrors.join(', ')}` : 'Ready to continue'}
            >
              <ExternalLink className="w-4 h-4" />
              Continue with Bookmarklet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
