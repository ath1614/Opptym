import { useState, useEffect } from 'react';
import axios from 'axios';

interface SeoToolLimits {
  seoToolsUsed: number;
  tools: number;
  subscription: string;
  isInTrial: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
}

interface UseSeoToolLimitsReturn {
  limits: SeoToolLimits | null;
  loading: boolean;
  error: string | null;
  canUseSeoTools: boolean;
  isLimitReached: boolean;
  remainingUses: number;
  refetch: () => Promise<void>;
}

export const useSeoToolLimits = (): UseSeoToolLimitsReturn => {
  const [limits, setLimits] = useState<SeoToolLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setLimits({
          seoToolsUsed: 0,
          tools: 5,
          subscription: 'free',
          isInTrial: true,
          trialDaysLeft: 3,
          trialExpired: false
        });
        return;
      }

      const response = await axios.get('/api/subscription/details', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        const data = response.data;
        console.log('🔍 SEO Tool Limits API Response:', data);
        setLimits({
          seoToolsUsed: data.currentUsage?.seoToolsUsed || 0,
          tools: data.limits?.tools || 5,
          subscription: data.subscription || 'free',
          isInTrial: data.isInTrial || false,
          trialDaysLeft: data.trialDaysLeft || 0,
          trialExpired: data.trialExpired || false
        });
      }
    } catch (err) {
      console.error('Error fetching SEO tool limits:', err);
      setError('Failed to fetch usage limits');
      // Set fallback limits
      setLimits({
        seoToolsUsed: 0,
        tools: 5,
        subscription: 'free',
        isInTrial: true,
        trialDaysLeft: 3,
        trialExpired: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const canUseSeoTools = limits ? 
    (limits.subscription !== 'free' || (limits.isInTrial && !limits.trialExpired)) : false;
  
  const isLimitReached = limits ? 
    (limits.seoToolsUsed >= limits.tools) : false;
  
  const remainingUses = limits ? 
    Math.max(0, limits.tools - limits.seoToolsUsed) : 0;

  // Debug logging
  console.log('🔍 SEO Tool Limits Debug:', {
    limits,
    canUseSeoTools,
    isLimitReached,
    remainingUses,
    subscription: limits?.subscription,
    isInTrial: limits?.isInTrial,
    trialExpired: limits?.trialExpired
  });

  return {
    limits,
    loading,
    error,
    canUseSeoTools,
    isLimitReached,
    remainingUses,
    refetch: fetchLimits
  };
};
