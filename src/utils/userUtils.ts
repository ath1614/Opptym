interface User {
  id?: string; // Changed to optional to match useAuth.ts payload
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  timezone?: string;
  bio?: string;
  subscription?: 'free' | 'test' | 'starter' | 'pro' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  role?: 'user' | 'admin';
  isAdmin?: boolean;
  isOwner?: boolean;
  isEmployee?: boolean;
}

/**
 * Get the display name for a user
 * Priority: firstName + lastName > firstName > username > email > 'User'
 * Ensures no duplicate names are shown
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  // If both firstName and lastName exist and are different, use full name
  if (user.firstName && user.lastName && user.firstName.trim() !== user.lastName.trim()) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  // If only firstName exists and it's different from username, use firstName
  if (user.firstName && user.firstName !== user.username) {
    return user.firstName;
  }
  
  // If username exists and it's different from firstName, use username
  if (user.username && user.username !== user.firstName) {
    return user.username;
  }
  
  // If firstName and username are the same, just use firstName
  if (user.firstName) {
    return user.firstName;
  }
  
  // Try email (show first part before @)
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  // Fallback
  return 'User';
};

/**
 * Get the short display name (for compact spaces)
 * Priority: username > firstName > email > 'User'
 * Ensures no duplicate names are shown
 */
export const getUserShortName = (user: User | null): string => {
  if (!user) return 'User';
  
  // If username exists and it's different from firstName, use username
  if (user.username && user.username !== user.firstName) {
    return user.username;
  }
  
  // If firstName exists and it's different from username, use firstName
  if (user.firstName && user.firstName !== user.username) {
    return user.firstName;
  }
  
  // If they're the same, use either one
  if (user.firstName || user.username) {
    return user.firstName || user.username || 'User';
  }
  
  // Try email (show first part before @)
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Get user initials for avatar display
 * Ensures no duplicate letters are shown
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  // If both firstName and lastName exist and are different, use both initials
  if (user.firstName && user.lastName && user.firstName.trim() !== user.lastName.trim()) {
    const firstInitial = user.firstName[0]?.toUpperCase() || '';
    const lastInitial = user.lastName[0]?.toUpperCase() || '';
    if (firstInitial && lastInitial && firstInitial !== lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    // If initials are the same, just use one
    return firstInitial || 'U';
  }
  
  // If only firstName exists, use first two letters if available and different
  if (user.firstName) {
    if (user.firstName.length >= 2) {
      const first = user.firstName[0]?.toUpperCase() || '';
      const second = user.firstName[1]?.toUpperCase() || '';
      if (first && second && first !== second) {
        return `${first}${second}`;
      }
      // If first two letters are the same, just use one
      return first || 'U';
    }
    return user.firstName[0]?.toUpperCase() || 'U';
  }
  
  // If username exists, use first two letters if available and different
  if (user.username) {
    if (user.username.length >= 2) {
      const first = user.username[0]?.toUpperCase() || '';
      const second = user.username[1]?.toUpperCase() || '';
      if (first && second && first !== second) {
        return `${first}${second}`;
      }
      // If first two letters are the same, just use one
      return first || 'U';
    }
    return user.username[0]?.toUpperCase() || 'U';
  }
  
  // If email exists, use first two letters if available and different
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix.length >= 2) {
      const first = emailPrefix[0]?.toUpperCase() || '';
      const second = emailPrefix[1]?.toUpperCase() || '';
      if (first && second && first !== second) {
        return `${first}${second}`;
      }
      // If first two letters are the same, just use one
      return first || 'U';
    }
    return emailPrefix[0]?.toUpperCase() || 'U';
  }
  
  return 'U';
}; 