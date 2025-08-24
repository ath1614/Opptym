import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  FolderOpen, 
  BarChart3, 
  Globe, 
  FileText, 
  Settings, 
  User, 
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Users,
  Database,
  Activity,
  Award,
  BookOpen,
  Megaphone,
  CreditCard,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    const name = user.username || user.firstName || user.email || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = (user: any) => {
    if (!user) return 'User';
    return user.username || user.firstName || user.email?.split('@')[0] || 'User';
  };

  const getUserSubscription = (user: any) => {
    if (!user?.subscription) return 'Free';
    return user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1);
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription.toLowerCase()) {
      case 'business':
        return 'from-purple-500 to-purple-600';
      case 'pro':
        return 'from-blue-500 to-blue-600';
      case 'starter':
        return 'from-green-500 to-green-600';
      case 'enterprise':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      description: 'Overview & Analytics'
    },
    {
      id: 'projects',
      label: t('sidebar.projects'),
      icon: FolderOpen,
      color: 'from-green-500 to-green-600',
      description: 'Manage Projects'
    },
    {
      id: 'tools',
      label: t('sidebar.tools'),
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      description: 'SEO Analysis Tools'
    },
    {
      id: 'directory',
      label: t('sidebar.directory'),
      icon: Globe,
      color: 'from-orange-500 to-orange-600',
      description: 'Directory Submissions'
    },
    {
      id: 'reports',
      label: t('sidebar.reports'),
      icon: FileText,
      color: 'from-red-500 to-red-600',
      description: 'Performance Reports'
    }
  ];

  const secondaryMenuItems = [
    {
      id: 'pricing',
      label: t('sidebar.pricing'),
      icon: CreditCard,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Plans & Billing'
    },
    {
      id: 'profile',
      label: t('sidebar.profile'),
      icon: User,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Account Settings'
    }
  ];

  // Admin-only items
  const adminMenuItems = user?.isAdmin ? [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      description: 'System Administration'
    }
  ] : [];

  const allMenuItems = [...menuItems, ...secondaryMenuItems, ...adminMenuItems];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 z-50
        h-screen
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
        bg-white/90 dark:bg-primary-900/90 backdrop-blur-xl border-r border-white/30 dark:border-primary-700/30 shadow-glass-lg
        overflow-hidden
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-primary-700/20">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
                  Opptym
                </h1>
                <p className="text-xs text-primary-600 dark:text-primary-400">SEO Platform</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 dark:bg-primary-800/50 backdrop-blur-sm border border-white/20 dark:border-primary-700/20 text-primary-600 dark:text-primary-400 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/20 dark:border-primary-700/20">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-semibold text-sm">{getUserInitials(user)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-800 dark:text-primary-200 truncate">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 truncate">{user?.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getSubscriptionColor(getUserSubscription(user))}`}></div>
                  <span className="text-xs text-primary-600 dark:text-primary-400">
                    {getUserSubscription(user)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-semibold text-sm">{getUserInitials(user)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {allMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-glow' 
                    : 'text-primary-700 dark:text-primary-300 hover:bg-white/50 dark:hover:bg-primary-800/50 hover:text-accent-600 dark:hover:text-accent-400'
                  }
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`
                  ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-r ' + item.color + ' group-hover:shadow-glow'
                  }
                `}>
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 dark:border-primary-700/20">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group
              text-primary-700 dark:text-primary-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <div className={`
              ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg flex items-center justify-center transition-all duration-200
              bg-gradient-to-r from-red-500 to-red-600 group-hover:shadow-glow
            `}>
              <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            </div>
            
            {!isCollapsed && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-white/90 dark:bg-primary-900/90 backdrop-blur-lg border border-white/20 dark:border-primary-700/20 rounded-xl shadow-glass flex items-center justify-center text-primary-700 dark:text-primary-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}