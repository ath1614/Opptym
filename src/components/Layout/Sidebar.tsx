import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Home,
  FolderOpen,
  Search,
  FileText,
  BarChart3,
  CreditCard,
  User,
  Shield,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: SidebarItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>(['seoTasks']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      icon: Home
    },
    {
      id: 'projects',
      label: t('sidebar.projects'),
      icon: FolderOpen
    },
    {
      id: 'tools',
      label: t('sidebar.tools'),
      icon: Search
    },
    {
      id: 'seoTasks',
      label: t('sidebar.seoTasks'),
      icon: CheckSquare,
      children: [
        {
          id: 'directory-submission',
          label: 'Directory Submission',
          icon: FileText
        },
        {
          id: 'article-submission',
          label: 'Article Submission',
          icon: FileText
        },
        {
          id: 'press-release',
          label: 'Press Release',
          icon: FileText
        },
        {
          id: 'bookmarking',
          label: 'BookMarking',
          icon: FileText
        },
        {
          id: 'business-listing',
          label: 'Business Listing',
          icon: FileText
        },
        {
          id: 'classified',
          label: 'Classified',
          icon: FileText
        },
        {
          id: 'more-seo',
          label: 'More SEO',
          icon: FileText
        }
      ]
    },
    {
      id: 'reports',
      label: t('sidebar.reports'),
      icon: BarChart3
    },
    {
      id: 'pricing',
      label: t('sidebar.pricing'),
      icon: CreditCard
    },
    {
      id: 'profile',
      label: t('sidebar.profile'),
      icon: User
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpanded(itemId);
    } else {
      // Handle SEO task classifications - they should go to their respective components
      if (['directory-submission', 'article-submission', 'press-release', 'bookmarking', 'business-listing', 'classified', 'more-seo'].includes(itemId)) {
        setActiveTab(itemId); // Go to the specific classification component
      } else {
        setActiveTab(itemId);
      }
    }
  };

  const renderSidebarItem = (item: SidebarItem, depth = 0) => {
    const isActive = activeTab === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item.id, hasChildren || false)}
          className={`
            w-full flex items-center justify-between text-left rounded-xl transition-all duration-200
            ${depth > 0 ? 'ml-4 pl-8' : ''}
            ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
            ${isActive
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : isDark
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-gray-500'}`} />
            {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
          </div>
          {hasChildren && !isCollapsed && (
            <div className="flex items-center flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className={`h-4 w-4 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              )}
            </div>
          )}
        </button>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 overflow-hidden ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700' 
        : 'bg-gradient-to-b from-white to-gray-50 border-r border-gray-200'
    }`}>
      {/* Sidebar Header */}
      <div className={`border-b flex-shrink-0 ${
        isCollapsed ? 'p-4' : 'p-6'
      } ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className={`transition-all duration-300 flex-shrink-0 ${
              isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`} viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round"/>
              <circle cx="26" cy="14" r="3" fill="#60A5FA"/>
              <path d="M 26 14 A 18 18 0 0 1 20 2" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="26" r="3" fill="#3B82F6"/>
              <path d="M 14 26 A 18 18 0 0 1 20 38" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent truncate">
                  OPPTYM
                </h1>
                <p className={`text-xs font-medium truncate ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  SEO Automation Platform
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-md transition-colors flex-shrink-0 ${
              isCollapsed ? 'mx-auto' : ''
            } ${
              isDark 
                ? 'hover:bg-slate-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            {isCollapsed ? (
              <Menu className={`h-5 w-5 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`} />
            ) : (
              <X className={`h-5 w-5 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-track-transparent ${
        isDark ? 'scrollbar-thumb-slate-600' : 'scrollbar-thumb-gray-400'
      }`}>
        <div className={`space-y-2 ${
          isCollapsed ? 'px-2' : 'px-4'
        }`}>
          {sidebarItems.map(item => renderSidebarItem(item))}
        </div>
      </nav>
      

    </aside>
  );
}