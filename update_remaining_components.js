const fs = require('fs');
const path = require('path');

const components = [
  'src/components/Submissions/Australia.tsx',
  'src/components/Submissions/LocalBusiness.tsx',
  'src/components/Submissions/PressRelease.tsx',
  'src/components/Submissions/ArticlePlatforms.tsx',
  'src/components/Submissions/BusinessListing.tsx',
  'src/components/Submissions/BookMarking.tsx'
];

components.forEach(componentPath => {
  try {
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // Add import for UnifiedSubmissionStats
    if (!content.includes('UnifiedSubmissionStats')) {
      content = content.replace(
        /import DirectoryGrid from '\.\/DirectoryGrid';/,
        "import DirectoryGrid from './DirectoryGrid';\nimport UnifiedSubmissionStats from './UnifiedSubmissionStats';"
      );
    }
    
    // Replace stats cards with unified component
    const statsCardsRegex = /\/\* Stats Cards \*\/[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    if (statsCardsRegex.test(content)) {
      content = content.replace(
        statsCardsRegex,
        '      {/* Unified Submission Stats */}\n      <UnifiedSubmissionStats />'
      );
    }
    
    fs.writeFileSync(componentPath, content);
    console.log(`✅ Updated ${componentPath}`);
  } catch (error) {
    console.error(`❌ Error updating ${componentPath}:`, error.message);
  }
});

console.log('🎉 All components updated!');