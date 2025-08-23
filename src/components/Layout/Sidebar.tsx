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
  Menu,
  Sparkles
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
    color: 'from-accent-500 to-accent-600'
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    icon: FolderOpen,
    color: 'from-success-500 to-success-600'
  },
  { 
    id: 'tools', 
    label: 'SEO Tools', 
    icon: Wrench,
    color: 'from-primary-500 to-primary-600'
  },
  { 
    id: 'directory', 
    label: 'Submissions', 
    icon: Send,
    color: 'from-warning-500 to-warning-600'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: FileText,
    color: 'from-accent-500 to-primary-600'
  },
  { 
    id: 'pricing', 
    label: 'Pricing', 
    icon: CreditCard,
    color: 'from-success-500 to-accent-600'
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: Settings,
    color: 'from-primary-500 to-accent-600'
  },
];

const adminItems = [
  { 
    id: 'admin', 
    label: 'Admin', 
    icon: Shield,
    color: 'from-error-500 to-error-600'
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
          className="p-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-glass border border-white/20 text-primary-600 hover:text-accent-600 transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      )}

      {/* Sidebar */}
      <aside className={`
        sidebar fixed md:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-glass
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
                    Opptym
                  </h1>
                  <p className="text-xs text-primary-600">SEO Platform</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 text-primary-600 hover:text-accent-600 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Info */}
          {!isCollapsed && (
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-glow">
                  <span className="text-white font-semibold text-sm">{getUserInitials(user)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-primary-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
                    w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-glow' 
                      : 'text-primary-600 hover:text-accent-600 hover:bg-white/50'
                    }
                    animate-fade-in-up
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r ' + item.color + ' group-hover:shadow-glow'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-white/20">
              <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary-600 font-medium">System Online</span>
                </div>
                <p className="text-xs text-primary-500 mt-1">All services running smoothly</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}