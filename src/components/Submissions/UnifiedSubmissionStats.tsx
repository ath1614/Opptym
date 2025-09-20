import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

interface UnifiedSubmissionStatsProps {
  classification?: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function UnifiedSubmissionStats({ classification }: UnifiedSubmissionStatsProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [classification]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch all submissions (not filtered by classification)
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const submissions = response.data;
      
      // Calculate stats from all submissions
      const total = submissions.length;
      const approved = submissions.filter((s: any) => 
        s.status === 'approved' || s.status === 'completed' || s.status === 'published'
      ).length;
      const pending = submissions.filter((s: any) => 
        s.status === 'pending' || s.status === 'submitted' || s.status === 'processing'
      ).length;
      const rejected = submissions.filter((s: any) => 
        s.status === 'rejected' || s.status === 'failed' || s.status === 'error'
      ).length;

      setStats({ total, approved, pending, rejected });
    } catch (error) {
      console.error('Error fetching submission stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Approved Submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Pending Submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Rejected Submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
