import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Wrench,
  Send,
  FileText,
  CreditCard,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserDisplayName, getUserInitials } from '../../utils/userUtils';
import Logo from '../ui/Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    icon: FolderOpen,
    color: 'from-green-500 to-emerald-600'
  },
  { 
    id: 'tools', 
    label: 'SEO Tools', 
    icon: Wrench,
    color: 'from-purple-500 to-pink-600'
  },
  { 
    id: 'directory', 
    label: 'Submissions', 
    icon: Send,
    color: 'from-orange-500 to-red-600'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: FileText,
    color: 'from-indigo-500 to-purple-600'
  },
  { 
    id: 'pricing', 
    label: 'Pricing', 
    icon: CreditCard,
    color: 'from-teal-500 to-cyan-600'
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: Settings,
    color: 'from-gray-500 to-slate-600'
  },
];

const adminItems = [
  { 
    id: 'admin', 
    label: 'Admin', 
    icon: Shield,
    color: 'from-red-500 to-pink-600'
  },
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const allMenuItems = isAdmin ? [...menuItems, ...adminItems] : menuItems;

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.sidebar')) return;
      setIsMobileOpen(false);
    };
    if (isMobileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 bg-white rounded-xl shadow-soft border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar fixed md:static z-40 top-0 left-0 h-full bg-white/95 backdrop-blur-sm shadow-strong border-r border-gray-100 transition-all duration-300 flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex
        `}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center cursor-pointer">
                <Logo size="lg" showText={true} />
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full cursor-pointer">
                <Logo size="md" showText={false} />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg hover:bg-white/50 transition-all duration-300 text-gray-600 hover:text-gray-900 ${
                isCollapsed ? 'absolute -right-2 top-6' : ''
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile - Only show when expanded */}
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{getUserInitials(user)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName(user)}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu - Single navigation for both states */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {allMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full group relative transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  } rounded-lg flex items-center ${
                    isCollapsed ? 'justify-center p-2' : 'p-3 space-x-3'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active Indicator - Only show when expanded */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                  )}
                  
                  <div className={`bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center ${
                    isCollapsed ? 'w-8 h-8' : 'w-6 h-6'
                  }`}>
                    <Icon className={`text-white ${isCollapsed ? 'w-4 h-4' : 'w-3 h-3'}`} />
                  </div>
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}