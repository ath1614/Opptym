import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
          id: 'directory',
          label: 'Directory Platforms',
          icon: FileText
        },
        {
          id: 'article',
          label: 'Article Platforms',
          icon: FileText
        },
        {
          id: 'press',
          label: 'Press Release',
          icon: FileText
        },
        {
          id: 'australia',
          label: 'Australia',
          icon: FileText
        },
        {
          id: 'classified',
          label: 'Classified Ads',
          icon: FileText
        },
        {
          id: 'qa',
          label: 'Q&A Platforms',
          icon: FileText
        },
        {
          id: 'social',
          label: 'Social Media',
          icon: FileText
        },
        {
          id: 'local',
          label: 'Local Business',
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
      // Handle SEO task classifications - they should go to submissions with the classification
      if (['directory', 'article', 'press', 'australia', 'classified', 'qa', 'social', 'local'].includes(itemId)) {
        setActiveTab('directory'); // Go to submissions page
        // You can add logic here to filter by classification if needed
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
            w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200
            ${depth > 0 ? 'ml-4 pl-8' : ''}
            ${isActive
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </div>
          {hasChildren && !isCollapsed && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
    <aside className={`bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className={`transition-all duration-300 ${
              isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`} viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round"/>
              <circle cx="26" cy="14" r="3" fill="#60A5FA"/>
              <path d="M 26 14 A 18 18 0 0 1 20 2" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="26" r="3" fill="#3B82F6"/>
              <path d="M 14 26 A 18 18 0 0 1 20 38" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  OPPTYM
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  SEO Automation Platform
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-slate-300" />
            ) : (
              <X className="h-5 w-5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>
      

    </aside>
  );
}