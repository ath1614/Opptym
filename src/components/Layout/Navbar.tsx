import React, { useEffect, useRef } from 'react';
import { Bell, User, LogOut, Search, Settings, HelpCircle } from 'lucide-react';
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
    <header className="glass border-b border-white/20 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Page Title & Breadcrumb */}
          <div className="flex items-center space-x-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 gradient-text">
                {getPageTitle(activeTab)}
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Welcome back, <span className="text-blue-600 font-semibold">{getUserDisplayName(user)}</span>
              </p>
            </div>
          </div>

          {/* Right Section - Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-strong border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New submission completed</p>
                        <p className="text-xs text-gray-600">Your project was submitted to 5 directories</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">SEO score improved</p>
                        <p className="text-xs text-gray-600">Your project score increased by 15 points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Help */}
            <button 
              onClick={handleHelpClick}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold text-sm">{getUserInitials(user)}</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{getUserShortName(user)}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-4 h-4 text-gray-400 transition-colors">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Enhanced Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-strong border border-gray-100 z-50 transform origin-top-right">
                  {/* User Info Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-soft">
                        <span className="text-white font-bold">{getUserInitials(user)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getUserDisplayName(user)}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user?.subscription === 'pro' ? 'bg-purple-100 text-purple-800' :
                            user?.subscription === 'business' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatSubscriptionName(user?.subscription)} Plan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
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