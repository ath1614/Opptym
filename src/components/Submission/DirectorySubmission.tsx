import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { getProjects, triggerSubmission } from '../../lib/api';

const directorySites = [
  'Yelp',
  'Hotfrog',
  'Sulekha',
  'YellowPages',
  'JustDial',
  'IndiaMart',
  'BBB',
  'FourSquare',
  'Grotal',
  'CitySearch',
];

const DirectorySubmission = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const handleAutoSubmit = async (siteName: string) => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await triggerSubmission(selectedProject, siteName);
      alert(res.data.message || `✅ Submission triggered for ${siteName}`);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('❌ Failed to submit to ' + siteName);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Directory Submission</h2>
      <p className="text-gray-600">Auto-fill directory listings using your project data</p>

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="border px-4 py-2 rounded-lg w-full max-w-md"
      >
        <option value="">Select a Project</option>
        {projects.map((project: any) => (
          <option key={project._id} value={project._id}>
            {project.title}
          </option>
        ))}
      </select>

      {selectedProject && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {directorySites.map((site) => (
            <div
              key={site}
              onClick={() => handleAutoSubmit(site)}
              className={`bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition cursor-pointer space-y-2 ${
                isSubmitting ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-md font-semibold text-gray-800">{site}</h4>
              </div>
              <p className="text-sm text-gray-500">Click to auto-submit</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectorySubmission;
