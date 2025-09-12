import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { getUserDisplayName, getUserInitials, getUserProfilePhoto } from '../../utils/userUtils';

interface NavbarProps {
  onNotificationClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNotificationClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const userDisplayName = user ? getUserDisplayName(user) : '';
  const userInitials = user ? getUserInitials(user) : '';
  const userProfilePhoto = user ? getUserProfilePhoto(user) : null;

  return (
    <nav className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border-b border-primary-200 dark:border-primary-700 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round"/>
                <circle cx="26" cy="14" r="3" fill="#0ea5e9"/>
                <path d="M 26 14 A 18 18 0 0 1 20 2" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="26" r="3" fill="#0284c7"/>
                <path d="M 14 26 A 18 18 0 0 1 20 38" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
                OPPTYM
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  {t('common.search')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-primary-400 dark:text-primary-500" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-primary-200 dark:border-primary-700 rounded-xl leading-5 bg-white/50 dark:bg-primary-800/50 backdrop-blur-sm placeholder-primary-500 dark:placeholder-primary-400 focus:outline-none focus:placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 sm:text-sm text-primary-900 dark:text-primary-100 transition-all duration-200 shadow-soft hover:shadow-medium"
                    placeholder={t('navbar.search')}
                    type="search"
                  />
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onNotificationClick}
              className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg p-2 rounded-xl text-primary-400 dark:text-primary-500 hover:text-accent-600 dark:hover:text-accent-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200 shadow-soft hover:shadow-medium"
            >
              <span className="sr-only">{t('navbar.notifications')}</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <div>
                <button
                  type="button"
                  className="max-w-xs bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-xl flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 lg:p-2 lg:hover:bg-white dark:lg:hover:bg-primary-800 transition-all duration-200 shadow-soft hover:shadow-medium"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {userProfilePhoto ? (
                    <img
                      src={userProfilePhoto}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 flex items-center justify-center text-white text-sm font-medium shadow-glow">
                      {userInitials}
                    </div>
                  )}
                  <div className="hidden lg:ml-3 lg:block">
                    <div className="text-base font-medium text-primary-800 dark:text-primary-200">
                      {t('navbar.welcomeBack')}, {userDisplayName}
                    </div>
                    <div className="text-sm font-medium text-primary-500 dark:text-primary-400">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="hidden lg:ml-1 lg:block h-5 w-5 text-primary-400 dark:text-primary-500" aria-hidden="true" />
                </button>
              </div>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-glass py-1 bg-white/90 dark:bg-primary-800/90 backdrop-blur-lg border border-white/20 dark:border-primary-700/20 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      window.location.hash = 'profile';
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full px-4 py-2 text-sm text-primary-700 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-700 dark:hover:text-accent-400 transition-colors duration-200"
                  >
                    <User className="mr-3 h-5 w-5 text-primary-400 dark:text-primary-500" aria-hidden="true" />
                    {t('navbar.profile')}
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = 'profile';
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full px-4 py-2 text-sm text-primary-700 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-700 dark:hover:text-accent-400 transition-colors duration-200"
                  >
                    <Settings className="mr-3 h-5 w-5 text-primary-400 dark:text-primary-500" aria-hidden="true" />
                    {t('navbar.settings')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full px-4 py-2 text-sm text-primary-700 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-accent-900/20 hover:text-accent-700 dark:hover:text-accent-400 transition-colors duration-200"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-primary-400 dark:text-primary-500" aria-hidden="true" />
                    {t('navbar.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;