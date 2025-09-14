import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { getUserDisplayName, getUserInitials, getUserProfilePhoto } from '../../utils/userUtils';

interface NavbarProps {
  onMobileMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuClick }) => {
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-2 rounded-md text-primary-400 dark:text-primary-500 hover:text-accent-600 dark:hover:text-accent-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors duration-200 mr-3"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round"/>
                <circle cx="26" cy="14" r="3" fill="#0ea5e9"/>
                <path d="M 26 14 A 18 18 0 0 1 20 2" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="26" r="3" fill="#0284c7"/>
                <path d="M 14 26 A 18 18 0 0 1 20 38" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ml-2 sm:ml-3">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
                OPPTYM
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle - Hidden on small screens */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Language Switcher - Hidden on small screens */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>


            {/* Profile dropdown */}
            <div className="relative">
              <div>
                <button
                  type="button"
                  className="max-w-xs bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg rounded-lg flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 p-2 hover:bg-white dark:hover:bg-primary-800 transition-all duration-200 shadow-soft hover:shadow-medium"
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
                  <div className="hidden md:ml-3 md:block">
                    <div className="text-sm font-medium text-primary-800 dark:text-primary-200 truncate max-w-32">
                      {userDisplayName}
                    </div>
                    <div className="text-xs font-medium text-primary-500 dark:text-primary-400 truncate max-w-32">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="hidden md:ml-1 md:block h-4 w-4 text-primary-400 dark:text-primary-500" aria-hidden="true" />
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