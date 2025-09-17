import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, AlertCircle, ArrowRight, Users } from 'lucide-react';
import axios from 'axios';
import { showPopup } from '../../utils/popup';

interface InvitationData {
  email: string;
  role: string;
  invitedBy: {
    username: string;
    email: string;
  };
}

interface AcceptInvitationProps {
  token: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function AcceptInvitation({ token, onSuccess, onError }: AcceptInvitationProps) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await axios.get(`/api/team/invitations/token/${token}`);
      if (response.data.success) {
        setInvitation(response.data.invitation);
      } else {
        setError('Invalid or expired invitation');
      }
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      setError('Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      const response = await axios.post('/api/team/invitations/accept', { token });
      
      if (response.data.success) {
        showPopup('Invitation accepted successfully! Please sign up or log in to access your account.', 'success');
        onSuccess();
      } else {
        setError(response.data.message || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-600 dark:text-primary-400">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-4">
            Invalid Invitation
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {error || 'This invitation is invalid or has expired.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-2">
            You're Invited!
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Join the team on OPPTYM
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            <h3 className="font-semibold text-accent-800 dark:text-accent-200">Invitation Details</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300">Invited by:</p>
              <p className="font-medium text-accent-800 dark:text-accent-200">
                {invitation.invitedBy.username} ({invitation.invitedBy.email})
              </p>
            </div>
            
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300">Your email:</p>
              <p className="font-medium text-accent-800 dark:text-accent-200">
                {invitation.email}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300">Your role:</p>
              <p className="font-medium text-accent-800 dark:text-accent-200 capitalize">
                {invitation.role}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">You'll get access to:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                <li>SEO tools and automation</li>
                <li>Project management</li>
                <li>Directory submissions</li>
                <li>Team collaboration features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAcceptInvitation}
          disabled={accepting}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Accepting...</span>
            </>
          ) : (
            <>
              <span>Accept Invitation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Note */}
        <p className="text-xs text-primary-500 dark:text-primary-400 text-center mt-4">
          After accepting, you'll need to sign up or log in to access your account.
        </p>
      </div>
    </div>
  );
}
