import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { getUserDisplayName, getUserInitials } from '../../utils/userUtils';

interface NavbarProps {
  onNotificationClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNotificationClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDisplayName = user ? getUserDisplayName(user) : '';
  const userInitials = user ? getUserInitials(user) : '';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/opptym.png"
                alt="OPPTYM"
              />
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
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">{t('navbar.notifications')}</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <div>
                <button
                  type="button"
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50 dark:lg:hover:bg-gray-700"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                    {userInitials}
                  </div>
                  <div className="hidden lg:ml-3 lg:block">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {t('navbar.welcomeBack')}, {userDisplayName}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="hidden lg:ml-1 lg:block h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    {t('navbar.profile')}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    {t('navbar.settings')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
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