// Central Directories Configuration
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

export const directoriesData: DirectoriesData = {
  "Directory Submission": [
    { name: "Blahoo Directory", url: "https://www.blahoo.net/", description: "Free directory submission", category: "business", country: "Global", priority: 85, daScore: 45, pageRank: 3, isPremium: false, status: "active" },
    { name: "DMOZ Alternative", url: "https://www.dmoz-odp.org/", description: "Open directory project", category: "business", country: "Global", priority: 90, daScore: 60, pageRank: 4, isPremium: false, status: "active" },
    { name: "Business Directory Hub", url: "https://businessdirectoryhub.com/", description: "Professional directory", category: "business", country: "Global", priority: 75, daScore: 35, pageRank: 2, isPremium: false, status: "active" }
  ],
  "Article Submission": [
    { name: "Medium", url: "https://medium.com/", description: "Article publishing platform", category: "technology", country: "Global", priority: 95, daScore: 90, pageRank: 8, isPremium: false, status: "active" },
    { name: "HubPages", url: "https://hubpages.com/", description: "Article publishing platform", category: "general", country: "Global", priority: 85, daScore: 70, pageRank: 6, isPremium: false, status: "active" }
  ],
  "Press Release": [
    { name: "PRLog", url: "https://www.prlog.org/", description: "Free press release service", category: "news", country: "Global", priority: 90, daScore: 75, pageRank: 6, isPremium: false, status: "active" },
    { name: "PRWeb", url: "https://www.prweb.com/", description: "Professional press release", category: "news", country: "Global", priority: 95, daScore: 85, pageRank: 7, isPremium: true, status: "active" }
  ],
  "BookMarking": [
    { name: "Bookmarking.info", url: "https://bookmarking.info/", description: "Social bookmarking", category: "social", country: "Global", priority: 75, daScore: 50, pageRank: 4, isPremium: false, status: "active" },
    { name: "Reddit", url: "https://www.reddit.com/", description: "Social news platform", category: "social", country: "Global", priority: 95, daScore: 90, pageRank: 8, isPremium: false, status: "active" }
  ],
  "Business Listing": [
    { name: "Google My Business", url: "https://business.google.com/", description: "Google business listing", category: "business", country: "Global", priority: 100, daScore: 95, pageRank: 9, isPremium: false, status: "active" },
    { name: "Yelp", url: "https://www.yelp.com/", description: "Business review platform", category: "business", country: "Global", priority: 90, daScore: 80, pageRank: 7, isPremium: false, status: "active" }
  ],
  "Classified": [
    { name: "Gumtree", url: "https://www.gumtree.com/", description: "Classified ads platform", category: "classified", country: "Global", priority: 85, daScore: 70, pageRank: 6, isPremium: false, status: "active" },
    { name: "Craigslist", url: "https://www.craigslist.org/", description: "Local classified ads", category: "classified", country: "Global", priority: 90, daScore: 80, pageRank: 7, isPremium: false, status: "active" }
  ],
  "More SEO": [
    { name: "WordPress", url: "https://wordpress.com/", description: "Web 2.0 platform", category: "web2.0", country: "Global", priority: 95, daScore: 90, pageRank: 8, isPremium: false, status: "active" },
    { name: "Blogger", url: "https://www.blogger.com/", description: "Blog platform", category: "web2.0", country: "Global", priority: 90, daScore: 85, pageRank: 7, isPremium: false, status: "active" }
  ]
};

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
  const exists = directoriesData[classification].some(dir => dir.name === directory.name && dir.url === directory.url);
  if (!exists) {
    directoriesData[classification].push(directory);
    return true;
  }
  return false;
}

export function removeDirectory(classification: string, directoryName: string): boolean {
  if (!directoriesData[classification]) return false;
  const initialLength = directoriesData[classification].length;
  directoriesData[classification] = directoriesData[classification].filter(dir => dir.name !== directoryName);
  return directoriesData[classification].length < initialLength;
}
