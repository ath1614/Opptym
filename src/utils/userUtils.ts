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
  subscription?: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  role?: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer' | 'employee';
  isAdmin?: boolean;
  isOwner?: boolean;
  isEmployee?: boolean;
}

/**
 * Get the display name for a user
 * Priority: firstName + lastName > username > email > 'User'
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  // Try full name first
  if (user.firstName && user.lastName) {
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
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.firstName) {
    return user.firstName[0].toUpperCase();
  }
  
  if (user.username) {
    return user.username[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return 'U';
}; 