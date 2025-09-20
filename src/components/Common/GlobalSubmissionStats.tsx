import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { TrendingUp, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SubmissionStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  directorySubmissions: number;
  seoToolSubmissions: number;
  byClassification: {
    [key: string]: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
}

interface GlobalSubmissionStatsProps {
  showDetailed?: boolean;
  className?: string;
}

export default function GlobalSubmissionStats({ 
  showDetailed = false, 
  className = "" 
}: GlobalSubmissionStatsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<SubmissionStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    directorySubmissions: 0,
    seoToolSubmissions: 0,
    byClassification: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalStats = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Try the new global-stats endpoint first
      try {
        const response = await axios.get('/api/submissions/global-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = response.data;
        setStats({
          total: data.totalSubmissions || 0,
          approved: data.overallStatusCounts?.approved || 0,
          pending: data.overallStatusCounts?.pending || 0,
          rejected: data.overallStatusCounts?.rejected || 0,
          directorySubmissions: data.directorySubmissions || 0,
          seoToolSubmissions: data.seoToolSubmissions || 0,
          byClassification: data.byClassification || {}
        });
        return; // Success, exit early
      } catch (globalStatsError: any) {
        // If global-stats endpoint is not available (404), fallback to regular stats
        if (globalStatsError.response?.status === 404) {
          console.log('Global stats endpoint not available, falling back to regular stats');
          
          const fallbackResponse = await axios.get('/api/submissions/stats', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const fallbackData = fallbackResponse.data;
          setStats({
            total: fallbackData.totalSubmissions || 0,
            approved: fallbackData.overallStatusCounts?.approved || 0,
            pending: fallbackData.overallStatusCounts?.pending || 0,
            rejected: fallbackData.overallStatusCounts?.rejected || 0,
            directorySubmissions: 0, // Fallback doesn't have this breakdown
            seoToolSubmissions: 0, // Fallback doesn't have this breakdown
            byClassification: {} // Fallback doesn't have this breakdown
          });
          return; // Success with fallback
        } else {
          // Re-throw other errors (401, 500, etc.)
          throw globalStatsError;
        }
      }
    } catch (err: any) {
      console.error('Error fetching submission stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch submission stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [user]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading submission stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/30 rounded-xl shadow-sm text-red-700 dark:text-red-400 ${className}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const mainStats = [
    {
      label: 'Total Submissions',
      value: stats.total,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      {showDetailed && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Directory vs SEO Tool Submissions */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">By Type</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directory Submissions</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.directorySubmissions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO Tool Submissions</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.seoToolSubmissions}</span>
                </div>
              </div>
            </div>

            {/* By Classification */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">By Classification</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(stats.byClassification).map(([classification, data]) => (
                  <div key={classification} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{classification}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
