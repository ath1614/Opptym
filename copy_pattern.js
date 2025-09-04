const fs = require('fs');

// Read the working ArticlePlatforms component
const articlePlatformsContent = fs.readFileSync('src/components/Submissions/ArticlePlatforms.tsx', 'utf8');

// Component configurations
const components = [
  {
    file: 'src/components/Submissions/QAPlatforms.tsx',
    classification: 'Q&A',
    color: 'pink',
    icon: 'HelpCircle',
    title: 'Q&A Platforms',
    description: 'Submit to question and answer platforms',
    oldTitle: 'Q&A Platforms'
  },
  {
    file: 'src/components/Submissions/SocialMedia.tsx',
    classification: 'Social',
    color: 'blue',
    icon: 'Share2',
    title: 'Social Media',
    description: 'Submit to social media platforms',
    oldTitle: 'Social Media'
  }
];

// Function to update a component
function updateComponent(config) {
  console.log(`Updating ${config.file}...`);
  
  // Read current content
  let content = fs.readFileSync(config.file, 'utf8');
  
  // Add X import
  content = content.replace(
    /} from 'lucide-react';/,
    `  X\n} from 'lucide-react';`
  );
  
  // Add directories state
  content = content.replace(
    /const \[projects, setProjects\] = useState<Project\[\]>\(\[\]\);/,
    `const [projects, setProjects] = useState<Project[]>([]);
  const [directories, setDirectories] = useState<any[]>([]);`
  );
  
  // Add bookmarklet modal state
  content = content.replace(
    /const \[showCreateForm, setShowCreateForm\] = useState\(false\);/,
    `const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);`
  );
  
  // Add fetchDirectories to useEffect
  content = content.replace(
    /fetchProjects\(\);/,
    `fetchProjects();
    fetchDirectories();`
  );
  
  // Add fetchDirectories function (after fetchProjects)
  const fetchDirectoriesFunction = `
  const fetchDirectories = async () => {
    try {
      const token = localStorage.getItem('token');
      // Map frontend classification to database classification
      const dbClassification = '${config.classification}'; // ${config.title.toLowerCase()} maps to ${config.classification} in database
      const response = await axios.get(\`/api/directories?classification=\${dbClassification}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      
      setDirectories(response.data);
    } catch (error) {
      console.error('Error fetching directories:', error);
      setDirectories([]);
    }
  };`;
  
  content = content.replace(
    /const fetchProjects = async \(\) => \{[\s\S]*?\};/,
    `const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projects', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };${fetchDirectoriesFunction}`
  );
  
  // Add filteredDirectories function
  const filteredDirectoriesFunction = `
  const filteredDirectories = directories.filter(directory => {
    const directoryName = directory.name || '';
    const searchLower = searchTerm.toLowerCase();
    
    return directoryName.toLowerCase().includes(searchLower);
  });`;
  
  content = content.replace(
    /const filteredSubmissions = submissions\.filter\(submission => \{[\s\S]*?\}\);/,
    `const filteredSubmissions = submissions.filter(submission => {
    // Safe search with null checks
    const platformName = submission.platformName || '';
    const searchLower = searchTerm.toLowerCase();
    
    return platformName.toLowerCase().includes(searchLower);
  });${filteredDirectoriesFunction}`
  );
  
  // Write updated content
  fs.writeFileSync(config.file, content);
  console.log(`✅ Updated ${config.file}`);
}

// Update all components
components.forEach(updateComponent);

console.log('🎉 All components updated successfully!');
