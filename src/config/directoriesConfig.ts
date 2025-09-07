// Central Directories Configuration
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

export const directoriesData: DirectoriesData = {
  "Directory Submission": [
    {
      name: "Blahoo Directory",
      url: "https://www.blahoo.net/",
      description: "Free directory submission with instant approval",
      category: "business",
      country: "Global",
      priority: 85,
      daScore: 45,
      pageRank: 3,
      isPremium: false,
      status: "active"
    },
    {
      name: "DMOZ Alternative",
      url: "https://www.dmoz-odp.org/",
      description: "Open directory project alternative",
      category: "business",
      country: "Global",
      priority: 90,
      daScore: 60,
      pageRank: 4,
      isPremium: false,
      status: "active"
    },
    {
      name: "Business Directory Hub",
      url: "https://businessdirectoryhub.com/",
      description: "Professional business directory",
      category: "business",
      country: "Global",
      priority: 75,
      daScore: 35,
      pageRank: 2,
      isPremium: false,
      status: "active"
    },
    {
      name: "Global Directory Network",
      url: "https://globaldirectorynetwork.com/",
      description: "Worldwide directory submission",
      category: "business",
      country: "Global",
      priority: 80,
      daScore: 40,
      pageRank: 3,
      isPremium: false,
      status: "active"
    },
    {
      name: "Directory World",
      url: "https://directoryworld.net/",
      description: "Comprehensive directory listing",
      category: "business",
      country: "Global",
      priority: 70,
      daScore: 30,
      pageRank: 2,
      isPremium: false,
      status: "active"
    }
  ],

  "Article Submission": [
    {
      name: "Medium",
      url: "https://medium.com/",
      description: "Popular article publishing platform",
      category: "technology",
      country: "Global",
      priority: 95,
      daScore: 90,
      pageRank: 8,
      isPremium: false,
      status: "active"
    },
    {
      name: "HubPages",
      url: "https://hubpages.com/",
      description: "Article writing and publishing platform",
      category: "business",
      country: "Global",
      priority: 85,
      daScore: 70,
      pageRank: 6,
      isPremium: false,
      status: "active"
    },
    {
      name: "EzineArticles",
      url: "https://ezinearticles.com/",
      description: "Article directory and submission site",
      category: "business",
      country: "Global",
      priority: 80,
      daScore: 65,
      pageRank: 5,
      isPremium: false,
      status: "active"
    }
  ],

  "Press Release": [
    {
      name: "PRLog",
      url: "https://www.prlog.org/",
      description: "Free press release distribution",
      category: "business",
      country: "Global",
      priority: 90,
      daScore: 75,
      pageRank: 6,
      isPremium: false,
      status: "active"
    },
    {
      name: "PRWeb",
      url: "https://www.prweb.com/",
      description: "Professional press release service",
      category: "business",
      country: "Global",
      priority: 95,
      daScore: 85,
      pageRank: 7,
      isPremium: true,
      status: "active"
    }
  ],

  "BookMarking": [
    {
      name: "Bookmarking.info",
      url: "https://bookmarking.info/",
      description: "Social bookmarking platform",
      category: "technology",
      country: "Global",
      priority: 80,
      daScore: 65,
      pageRank: 5,
      isPremium: false,
      status: "active"
    },
    {
      name: "Delicious",
      url: "https://delicious.com/",
      description: "Popular social bookmarking site",
      category: "technology",
      country: "Global",
      priority: 90,
      daScore: 80,
      pageRank: 7,
      isPremium: false,
      status: "active"
    }
  ],

  "Business Listing": [
    {
      name: "Google My Business",
      url: "https://business.google.com/",
      description: "Google's business listing platform",
      category: "business",
      country: "Global",
      priority: 100,
      daScore: 95,
      pageRank: 9,
      isPremium: false,
      status: "active"
    },
    {
      name: "Yelp",
      url: "https://www.yelp.com/",
      description: "Business review and listing platform",
      category: "business",
      country: "Global",
      priority: 95,
      daScore: 85,
      pageRank: 8,
      isPremium: false,
      status: "active"
    }
  ],

  "Classified": [
    {
      name: "The West Classifieds",
      url: "https://www.thewestclassifieds.com.au/",
      description: "Australian classified advertising",
      category: "business",
      country: "Australia",
      priority: 85,
      daScore: 70,
      pageRank: 5,
      isPremium: false,
      status: "active"
    },
    {
      name: "Gumtree Australia",
      url: "https://www.gumtree.com.au/",
      description: "Popular Australian classifieds",
      category: "business",
      country: "Australia",
      priority: 90,
      daScore: 80,
      pageRank: 6,
      isPremium: false,
      status: "active"
    }
  ],

  "More SEO": [
    {
      name: "WordPress.com",
      url: "https://wordpress.com/",
      description: "Web 2.0 blog platform",
      category: "Web 2.0 Submission",
      country: "Global",
      priority: 95,
      daScore: 90,
      pageRank: 8,
      isPremium: false,
      status: "active"
    },
    {
      name: "Quora",
      url: "https://www.quora.com/",
      description: "Question and answer platform",
      category: "Q & A Websites",
      country: "Global",
      priority: 95,
      daScore: 90,
      pageRank: 8,
      isPremium: false,
      status: "active"
    }
  ]
};

// Helper function to get directories by classification
export const getDirectoriesByClassification = (classification: string): Directory[] => {
  return directoriesData[classification] || [];
};

// Helper function to get all classifications
export const getAllClassifications = (): string[] => {
  return Object.keys(directoriesData);
};

// Helper function to get total count of directories
export const getTotalDirectoriesCount = (): number => {
  return Object.keys(directoriesData).reduce((total, key) => total + directoriesData[key].length, 0);
};

// Helper function to add a new directory (for admin panel)
export const addDirectory = (classification: string, directory: Directory): boolean => {
  if (!directoriesData[classification]) {
    directoriesData[classification] = [];
  }
  
  // Check if directory already exists
  const exists = directoriesData[classification].some(dir => 
    dir.name === directory.name || dir.url === directory.url
  );
  
  if (!exists) {
    directoriesData[classification].push(directory);
    return true;
  }
  
  return false;
};

// Helper function to remove a directory (for admin panel)
export const removeDirectory = (classification: string, directoryName: string): boolean => {
  if (!directoriesData[classification]) {
    return false;
  }
  
  const initialLength = directoriesData[classification].length;
  directoriesData[classification] = directoriesData[classification].filter(
    dir => dir.name !== directoryName
  );
  
  return directoriesData[classification].length < initialLength;
};
