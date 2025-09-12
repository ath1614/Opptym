/**
 * User Profile Service
 * Manages persistent user profile data for form pre-filling
 */

export interface UserProfile {
  id: string;
  businessName: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  description: string;
  category: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  preferences: {
    autoFill: boolean;
    showInstructions: boolean;
    defaultCategory: string;
  };
  lastUpdated: Date;
}

export interface ProfileUpdateResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export class UserProfileService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    // Dynamic API URL detection
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return 'https://api.opptym.com';
    }
    return 'https://api.opptym.com';
  }

  /**
   * Get user profile from server
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, return default
          return this.getDefaultProfile();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.profile || this.getDefaultProfile();

    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Return cached profile or default
      return this.getCachedProfile() || this.getDefaultProfile();
    }
  }

  /**
   * Update user profile on server
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<ProfileUpdateResult> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the updated profile
      this.cacheProfile(data.profile);

      return {
        success: true,
        profile: data.profile
      };

    } catch (error) {
      console.error('Failed to update user profile:', error);
      
      // Try to cache locally as fallback
      const currentProfile = await this.getUserProfile();
      const updatedProfile = { ...currentProfile, ...profile, lastUpdated: new Date() };
      this.cacheProfile(updatedProfile);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get default profile template
   */
  private getDefaultProfile(): UserProfile {
    return {
      id: 'default',
      businessName: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      description: '',
      category: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: ''
      },
      preferences: {
        autoFill: true,
        showInstructions: true,
        defaultCategory: 'Business'
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Cache profile locally
   */
  private cacheProfile(profile: UserProfile): void {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to cache profile:', error);
    }
  }

  /**
   * Get cached profile
   */
  private getCachedProfile(): UserProfile | null {
    try {
      const cached = localStorage.getItem('userProfile');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached profile:', error);
      return null;
    }
  }

  /**
   * Convert profile to project data format
   */
  profileToProjectData(profile: UserProfile): any {
    return {
      name: profile.businessName,
      email: profile.email,
      phone: profile.phone,
      companyName: profile.businessName,
      url: profile.website,
      description: profile.description,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      pincode: profile.zipCode,
      category: profile.category,
      socialMedia: profile.socialMedia
    };
  }

  /**
   * Convert project data to profile format
   */
  projectDataToProfile(projectData: any): Partial<UserProfile> {
    return {
      businessName: projectData.companyName || projectData.name || '',
      website: projectData.url || '',
      email: projectData.email || '',
      phone: projectData.phone || '',
      address: projectData.address || '',
      city: projectData.city || '',
      state: projectData.state || '',
      country: projectData.country || '',
      zipCode: projectData.pincode || '',
      description: projectData.description || '',
      category: projectData.category || '',
      socialMedia: projectData.socialMedia || {}
    };
  }

  /**
   * Auto-save profile from form data
   */
  async autoSaveFromForm(formData: any): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile();
      const updatedFields = this.projectDataToProfile(formData);
      
      // Only update if there are meaningful changes
      const hasChanges = Object.keys(updatedFields).some(key => {
        const currentValue = (currentProfile as any)[key];
        const newValue = updatedFields[key as keyof UserProfile];
        return currentValue !== newValue && newValue && newValue.toString().trim() !== '';
      });

      if (hasChanges) {
        await this.updateUserProfile(updatedFields);
        console.log('✅ Profile auto-saved from form data');
      }
    } catch (error) {
      console.warn('Failed to auto-save profile:', error);
    }
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletion(profile: UserProfile): number {
    const requiredFields = [
      'businessName', 'website', 'email', 'phone', 'address', 
      'city', 'state', 'country', 'description'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = (profile as any)[field];
      return value && value.toString().trim() !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  /**
   * Get profile suggestions for improvement
   */
  getProfileSuggestions(profile: UserProfile): string[] {
    const suggestions: string[] = [];

    if (!profile.businessName) {
      suggestions.push('Add your business name for better recognition');
    }

    if (!profile.website) {
      suggestions.push('Include your website URL for directory listings');
    }

    if (!profile.description) {
      suggestions.push('Add a business description to attract more customers');
    }

    if (!profile.socialMedia.facebook && !profile.socialMedia.twitter && !profile.socialMedia.linkedin) {
      suggestions.push('Add social media links to increase your online presence');
    }

    if (!profile.address || !profile.city) {
      suggestions.push('Complete your address for local directory submissions');
    }

    return suggestions;
  }
}

export default UserProfileService;
