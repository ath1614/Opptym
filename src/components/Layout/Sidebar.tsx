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
  CheckSquare
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
          label: t('submissions.directorySubmissions'),
          icon: FileText
        },
        {
          id: 'social',
          label: t('submissions.social'),
          icon: FileText
        },
        {
          id: 'review',
          label: t('submissions.review'),
          icon: FileText
        },
        {
          id: 'local',
          label: t('submissions.local'),
          icon: FileText
        },
        {
          id: 'other',
          label: t('submissions.other'),
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
      setActiveTab(itemId);
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
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
              : 'text-primary-700 hover:bg-primary-50 hover:text-primary-900'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className={`h-4 w-4 ${isActive ? 'text-white' : 'text-primary-600'}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white' : 'text-primary-600'}`} />
              )}
            </div>
          )}
        </button>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-glass h-screen sticky top-0 flex flex-col animate-fade-in-left">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-primary-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <svg className="w-10 h-10 absolute inset-0" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="url(#blueGradient)"
                strokeWidth="2"
                strokeDasharray="4,4"
                strokeLinecap="round"
              />
              <circle cx="26" cy="14" r="3" fill="#3B82F6" />
              <path
                d="M 26 14 A 18 18 0 0 1 20 2"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="26" r="3" fill="#1E40AF" />
              <path
                d="M 14 26 A 18 18 0 0 1 20 38"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
              OPPTYM
            </h1>
            <p className="text-xs text-primary-600 font-medium">
              SEO Automation Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>
    </aside>
  );
}