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
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  // Try full name first (only if both firstName and lastName exist and are different)
  if (user.firstName && user.lastName && user.firstName.trim() !== user.lastName.trim()) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  // Try first name only
  if (user.firstName) {
    return user.firstName;
  }
  
  // Try username
  if (user.username) {
    return user.username;
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
 */
export const getUserShortName = (user: User | null): string => {
  if (!user) return 'User';
  
  if (user.username) {
    return user.username;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  // If both firstName and lastName exist and are different, use both initials
  if (user.firstName && user.lastName && user.firstName.trim() !== user.lastName.trim()) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  // If only firstName exists, use first two letters if available
  if (user.firstName) {
    if (user.firstName.length >= 2) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    return user.firstName[0].toUpperCase();
  }
  
  // If username exists, use first two letters if available
  if (user.username) {
    if (user.username.length >= 2) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.username[0].toUpperCase();
  }
  
  // If email exists, use first two letters if available
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix.length >= 2) {
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return emailPrefix[0].toUpperCase();
  }
  
  return 'U';
}; 