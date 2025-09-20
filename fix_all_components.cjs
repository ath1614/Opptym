const fs = require('fs');
const path = require('path');

const components = [
  'src/components/Submissions/BusinessListing.tsx',
  'src/components/Submissions/LocalBusiness.tsx',
  'src/components/Submissions/Australia.tsx',
  'src/components/Submissions/ArticlePlatforms.tsx'
];

components.forEach(componentPath => {
  try {
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // Fix malformed JSX structure
    content = content.replace(
      /{\s*{\/\* Unified Submission Stats \*\/}\s*<UnifiedSubmissionStats \/>/g,
      '          {/* Unified Submission Stats */}\n          <UnifiedSubmissionStats />'
    );
    
    // Remove any remaining old stats cards after UnifiedSubmissionStats
    const lines = content.split('\n');
    const newLines = [];
    let skipUntilDirectoryGrid = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<UnifiedSubmissionStats />')) {
        newLines.push(line);
        skipUntilDirectoryGrid = true;
        continue;
      }
      
      if (skipUntilDirectoryGrid) {
        if (line.includes('DirectoryGrid') || line.includes('</div>') && line.trim() === '</div>') {
          skipUntilDirectoryGrid = false;
          newLines.push(line);
        }
        // Skip old stats cards
        continue;
      }
      
      newLines.push(line);
    }
    
    content = newLines.join('\n');
    
    fs.writeFileSync(componentPath, content);
    console.log(`✅ Fixed ${componentPath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${componentPath}:`, error.message);
  }
});

console.log('🎉 All components fixed!');
