import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TrialLockoutStatus {
  locked: boolean;
  reason?: 'trial_expired' | 'trial_limits_reached';
  message?: string;
  seoToolsLocked?: boolean;
  projectsLocked?: boolean;
  submissionsLocked?: boolean;
}

interface TrialUsage {
  seoToolsUsed: number;
  projectsUsed: number;
  submissionsUsed: number;
}

export const useUpgradeModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lockoutStatus, setLockoutStatus] = useState<TrialLockoutStatus | null>(null);
  const [trialUsage, setTrialUsage] = useState<TrialUsage | null>(null);

  // Check for trial lockout status
  useEffect(() => {
    if (!user || user.subscription !== 'free') {
      setIsOpen(false);
      return;
    }

    // Check if user has trial lockout status in their data
    const checkLockoutStatus = () => {
      if (user.trialLockoutStatus) {
        setLockoutStatus(user.trialLockoutStatus);
        setTrialUsage(user.trialUsage);
        
        if (user.trialLockoutStatus.locked) {
          setIsOpen(true);
        }
      }
    };

    checkLockoutStatus();
  }, [user]);

  const openModal = (reason?: 'trial_expired' | 'trial_limits_reached', message?: string) => {
    setLockoutStatus({
      locked: true,
      reason,
      message
    });
    setTrialUsage(user?.trialUsage || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setLockoutStatus(null);
  };

  const checkAndShowUpgradeModal = (feature: string) => {
    if (!user || user.subscription !== 'free') return false;

    // Check if user is in trial and has reached limits
    if (user.isInTrialPeriod) {
      const trialDaysLeft = user.trialDaysLeft || 0;
      
      // Check specific feature limits
      switch (feature) {
        case 'seoTools':
          if (user.trialUsage?.seoToolsUsed >= 5) {
            openModal('trial_limits_reached', 'You\'ve used all 5 SEO tool attempts. Upgrade to continue.');
            return true;
          }
          break;
        case 'projects':
          if (user.trialUsage?.projectsUsed >= 3) {
            openModal('trial_limits_reached', 'You\'ve created 3 projects. Upgrade to create more.');
            return true;
          }
          break;
        case 'submissions':
          if (user.trialUsage?.submissionsUsed >= 5) {
            openModal('trial_limits_reached', 'You\'ve made 5 submissions. Upgrade to submit more.');
            return true;
          }
          break;
      }
    } else {
      // Trial expired
      openModal('trial_expired', 'Your 3-day trial has expired. Upgrade to continue using OPPTYM.');
      return true;
    }

    return false;
  };

  return {
    isOpen,
    lockoutStatus,
    trialUsage,
    openModal,
    closeModal,
    checkAndShowUpgradeModal
  };
};
