import React, { useEffect, useRef } from 'react';
import { Bell, User, LogOut, Search, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserDisplayName, getUserShortName, getUserInitials } from '../../utils/userUtils';
import LanguageSwitcher from '../LanguageSwitcher';

// Force rebuild - Language switcher should be visible in navbar
interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('🔍 Navbar component mounted - LanguageSwitcher should be visible');
  console.log('🔍 Current activeTab:', activeTab);
  console.log('🔍 User data:', user);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    if (setActiveTab) {
      setActiveTab('profile');
    }
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    if (setActiveTab) {
      setActiveTab('profile');
    }
    setShowUserMenu(false);
  };

  const handleHelpClick = () => {
    // Open help modal or navigate to help page
    window.open('https://docs.opptym.com', '_blank');
  };

  const getPageTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      projects: 'My Projects',
      tools: 'SEO Tools',
      directory: 'Directory Submission',
      reports: 'Submission Reports',
      pricing: 'Pricing Plans',
      profile: 'Profile Settings',
      admin: 'Admin Panel'
    };
    return titles[tab] || 'Dashboard';
  };

  const formatSubscriptionName = (subscription?: string) => {
    if (!subscription) return 'Free';
    return subscription.charAt(0).toUpperCase() + subscription.slice(1);
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-glass sticky top-0 z-50 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Page Title & Breadcrumb */}
          <div className="flex items-center space-x-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
                    {getPageTitle(activeTab)}
                  </h1>
                  <p className="text-sm text-primary-600 font-medium">
                    Welcome back, <span className="text-accent-600 font-semibold">{getUserDisplayName(user)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Modern Test Indicator */}
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-glow animate-pulse">
              ✨ NEW UI
            </div>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-primary-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-64 pl-10 pr-3 py-2 border border-primary-200 rounded-xl bg-white/50 backdrop-blur-sm text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all shadow-soft hover:shadow-medium"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white"></span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-glow group-hover:shadow-glow-lg transition-all">
                  {getUserInitials(user)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-primary-900">{getUserShortName(user)}</p>
                  <p className="text-xs text-primary-600">{formatSubscriptionName(user?.subscription)}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-2xl shadow-glass border border-white/20 py-2 animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-primary-100">
                    <p className="text-sm font-medium text-primary-900">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-primary-600">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-accent-50 hover:text-accent-700 transition-colors duration-200"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-accent-50 hover:text-accent-700 transition-colors duration-200"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleHelpClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-accent-50 hover:text-accent-700 transition-colors duration-200"
                    >
                      <HelpCircle className="mr-3 h-4 w-4" />
                      Help & Support
                    </button>
                  </div>
                  
                  <div className="border-t border-primary-100 pt-1">
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors duration-200"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}