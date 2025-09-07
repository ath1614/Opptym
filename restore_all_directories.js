import fs from 'fs';
import path from 'path';

console.log('🚀 Restoring all directories to config file...');

// Read all JSON files
const jsonFiles = [
  'directory_submission_classification.json',
  'article_submission_classification.json', 
  'press_release_classification.json',
  'bookmarking_classification.json',
  'business_listing_classification.json',
  'classified_classification.json',
  'more_seo_classification.json'
];

const directoriesData = {};

// Process each JSON file
for (const file of jsonFiles) {
  if (fs.existsSync(file)) {
    console.log(`📁 Processing ${file}...`);
    const content = fs.readFileSync(file, 'utf8');
    
    // Try to parse as regular JSON first, then as JSONL if that fails
    let directories;
    try {
      directories = JSON.parse(content);
    } catch (error) {
      // If JSON parsing fails, try JSONL format (one JSON object per line)
      console.log(`  📝 Parsing as JSONL format...`);
      const lines = content.trim().split('\n');
      directories = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (lineError) {
          console.log(`  ⚠️ Skipping invalid line: ${line.substring(0, 100)}...`);
          return null;
        }
      }).filter(dir => dir !== null);
    }
    
    // Group by classification
    for (const dir of directories) {
      const classification = dir.classification;
      if (!directoriesData[classification]) {
        directoriesData[classification] = [];
      }
      
      // Convert to Directory interface format
      directoriesData[classification].push({
        name: dir.name,
        url: dir.url,
        description: `Directory submission platform`,
        category: 'business',
        country: 'Global',
        priority: Math.floor(Math.random() * 30) + 70, // Random priority 70-100
        daScore: Math.floor(Math.random() * 50) + 20, // Random DA score 20-70
        pageRank: Math.floor(Math.random() * 5) + 1, // Random PR 1-5
        isPremium: Math.random() > 0.8, // 20% premium
        status: 'active'
      });
    }
    
    console.log(`✅ ${file}: ${directories.length} directories processed`);
  } else {
    console.log(`❌ ${file} not found`);
  }
}

// Generate the config file content
const configContent = `// Central Directories Configuration
export interface Directory {
  name: string;
  url: string;
  description?: string;
  category?: string;
  country?: string;
  priority?: number;
  daScore?: number;
  pageRank?: number;
  isPremium?: boolean;
  status?: 'active' | 'inactive' | 'pending';
}

export interface DirectoriesData {
  [classification: string]: Directory[];
}

export const directoriesData: DirectoriesData = ${JSON.stringify(directoriesData, null, 2)};

// Helper functions
export const getDirectoriesByClassification = (classification: string): Directory[] => {
  return directoriesData[classification] || [];
};

export const getAllClassifications = (): string[] => {
  return Object.keys(directoriesData);
};

export const getTotalDirectoriesCount = (): number => {
  return Object.values(directoriesData).reduce((total, dirs) => total + dirs.length, 0);
};

export const addDirectory = (classification: string, directory: Directory): void => {
  if (!directoriesData[classification]) {
    directoriesData[classification] = [];
  }
  directoriesData[classification].push(directory);
};

export const removeDirectory = (classification: string, directoryName: string): void => {
  if (directoriesData[classification]) {
    directoriesData[classification] = directoriesData[classification].filter(
      dir => dir.name !== directoryName
    );
  }
};
`;

// Write the config file
fs.writeFileSync('src/config/directoriesConfig.ts', configContent);

// Show summary
console.log('\n🎉 All directories restored!');
console.log('📊 Summary:');
for (const [classification, directories] of Object.entries(directoriesData)) {
  console.log(`  ${classification}: ${directories.length} directories`);
}
console.log(`\n📈 Total directories: ${Object.values(directoriesData).reduce((total, dirs) => total + dirs.length, 0)}`);
console.log('✅ Config file updated: src/config/directoriesConfig.ts');
