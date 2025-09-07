import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Restoring full directoriesConfig.ts with all 2800+ directories...');

// Read all JSON files
const jsonFiles = {
  'Directory Submission': 'directory_submission_classification.json',
  'Article Submission': 'article_submission_classification.json', 
  'Press Release': 'press_release_classification.json',
  'BookMarking': 'bookmarking_classification.json',
  'Business Listing': 'business_listing_classification.json',
  'Classified': 'classified_classification.json',
  'More SEO': 'more_seo_classification.json'
};

let totalDirectories = 0;
const directoriesData = {};

// Process each JSON file
Object.entries(jsonFiles).forEach(([classification, filename]) => {
  try {
    const filePath = path.join(__dirname, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse JSON array or JSONL format
    const directories = [];
    
    try {
      // Try JSON array format first
      const jsonData = JSON.parse(content);
      if (Array.isArray(jsonData)) {
        jsonData.forEach(entry => {
          directories.push({
            name: entry.name || 'Unknown Directory',
            url: entry.url || '#',
            description: entry.description || `Directory for ${classification}`,
            category: entry.category || 'general',
            country: entry.country || 'Global',
            priority: entry.priority || 50,
            daScore: entry.daScore || 30,
            pageRank: entry.pageRank || 2,
            isPremium: entry.isPremium || false,
            status: entry.status || 'active'
          });
        });
      } else {
        console.warn(`⚠️  ${filename} is not a JSON array`);
      }
    } catch (parseError) {
      // If JSON array parsing fails, try JSONL format
      try {
        const lines = content.trim().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            try {
              const entry = JSON.parse(line);
              directories.push({
                name: entry.name || 'Unknown Directory',
                url: entry.url || '#',
                description: entry.description || `Directory for ${classification}`,
                category: entry.category || 'general',
                country: entry.country || 'Global',
                priority: entry.priority || 50,
                daScore: entry.daScore || 30,
                pageRank: entry.pageRank || 2,
                isPremium: entry.isPremium || false,
                status: entry.status || 'active'
              });
            } catch (lineParseError) {
              console.warn(`⚠️  Skipping invalid JSON line in ${filename}:`, line.substring(0, 100));
            }
          }
        });
      } catch (jsonlError) {
        console.error(`❌ Error parsing ${filename} as JSONL:`, jsonlError.message);
      }
    }
    
    directoriesData[classification] = directories;
    totalDirectories += directories.length;
    console.log(`✅ ${classification}: ${directories.length} directories`);
    
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    directoriesData[classification] = [];
  }
});

// Generate the TypeScript config file
const configContent = `// Central Directories Configuration
// This file contains all directory data for SEO task classifications
// TODO: Replace with database integration when stability improves

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
export function getDirectoriesByClassification(classification: string): Directory[] {
  return directoriesData[classification] || [];
}

export function getAllClassifications(): string[] {
  return Object.keys(directoriesData);
}

export function getTotalDirectoriesCount(): number {
  return Object.keys(directoriesData).reduce((total, key) => total + directoriesData[key].length, 0);
}

export function addDirectory(classification: string, directory: Directory): boolean {
  if (!directoriesData[classification]) {
    directoriesData[classification] = [];
  }
  
  // Check if directory already exists
  const exists = directoriesData[classification].some(dir => 
    dir.name === directory.name && dir.url === directory.url
  );
  
  if (!exists) {
    directoriesData[classification].push(directory);
    return true;
  }
  
  return false;
}

export function removeDirectory(classification: string, directoryName: string): boolean {
  if (!directoriesData[classification]) {
    return false;
  }
  
  const initialLength = directoriesData[classification].length;
  directoriesData[classification] = directoriesData[classification].filter(
    dir => dir.name !== directoryName
  );
  
  return directoriesData[classification].length < initialLength;
}
`;

// Write the config file
const configPath = path.join(__dirname, 'src', 'config', 'directoriesConfig.ts');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`🎉 Successfully restored directoriesConfig.ts!`);
console.log(`📊 Total directories: ${totalDirectories}`);
console.log(`📁 File size: ${(fs.statSync(configPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`📝 Config file written to: ${configPath}`);
