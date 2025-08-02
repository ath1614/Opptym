export interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  subscription?: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  role?: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer' | 'employee';
  isAdmin?: boolean;
  isOwner?: boolean;
  isEmployee?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  url: string;
  keywords: string[];
  description: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  lastUpdated: string;
}

export interface SEOTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'optimization' | 'tracking' | 'utilities';
}

export interface Directory {
  id: string;
  name: string;
  domain: string;
  category: string;
  pageRank: number;
  status: 'active' | 'inactive';
  selected?: boolean;
}

export interface Submission {
  id: string;
  projectId: string;
  directoryId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    projects: number;
    submissions: number;
    tools: boolean;
  };
  popular?: boolean;
}