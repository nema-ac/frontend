/**
 * Custom hook for Worminal access control
 * Handles session polling, claim eligibility, and access permissions
 */

import { useState, useEffect, useContext, useCallback } from 'react';
import accessService from '../services/access.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

const POLL_INTERVAL = 5000; // Poll every 5 seconds

export const useWorminalAccess = () => {
  const { profile, isAuthenticated } = useContext(AuthContext);
  const [currentSession, setCurrentSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [publicWorminalData, setPublicWorminalData] = useState(null);
  const [loadingPublicData, setLoadingPublicData] = useState(false);

  // Fetch current session state
  const fetchCurrentSession = useCallback(async () => {
    try {
      const data = await accessService.getCurrentSession();
      setCurrentSession(data.session);
      setTimeRemaining(data.time_remaining_ms || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching current session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user can claim the current pending session
  const checkCanClaim = useCallback(async () => {
    // Only check if user is authenticated, session exists, is pending, and belongs to current user
    if (!isAuthenticated || !profile || !currentSession || currentSession.status !== 'pending_claim') {
      setCanClaim(false);
      setClaimReason('no_pending_session');
      return;
    }

    // Only query the API if the session belongs to the current user
    if (currentSession.wallet_address !== profile.wallet_address) {
      setCanClaim(false);
      setClaimReason('not_your_session');
      return;
    }

    try {
      const data = await accessService.canClaim();
      setCanClaim(data.can_claim);
      setClaimReason(data.reason);
    } catch (err) {
      console.error('Error checking claim eligibility:', err);
      setCanClaim(false);
      setClaimReason('error');
    }
  }, [isAuthenticated, profile, currentSession]);

  // Claim the session
  const claimSession = useCallback(async () => {
    if (!canClaim || claiming) return;

    setClaiming(true);
    setError(null);

    try {
      const result = await accessService.claimSession();

      // Refresh session state after successful claim
      await fetchCurrentSession();

      return { success: true, session: result.session };
    } catch (err) {
      console.error('Error claiming session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setClaiming(false);
    }
  }, [canClaim, claiming, fetchCurrentSession]);

  // Check if current user has access (session is theirs and active)
  const hasAccess = useCallback(() => {
    if (!isAuthenticated || !profile || !currentSession) {
      return false;
    }

    // User has access if the session is active and belongs to them
    return (
      currentSession.status === 'active' &&
      currentSession.wallet_address === profile.wallet_address
    );
  }, [isAuthenticated, profile, currentSession]);

  // Check if current user is in the session but hasn't claimed yet
  const needsToClaim = useCallback(() => {
    if (!isAuthenticated || !profile || !currentSession) {
      return false;
    }

    return (
      currentSession.status === 'pending_claim' &&
      currentSession.wallet_address === profile.wallet_address &&
      !currentSession.claimed_at
    );
  }, [isAuthenticated, profile, currentSession]);

  // Fetch public Worminal data (when user is spectating)
  const fetchPublicWorminalData = useCallback(async () => {
    setLoadingPublicData(true);
    try {
      const data = await accessService.getPublicWorminal();
      setPublicWorminalData(data);
    } catch (err) {
      console.error('Error fetching public Worminal data:', err);
      setPublicWorminalData(null);
    } finally {
      setLoadingPublicData(false);
    }
  }, []);

  // Determine if user should see public view
  const shouldShowPublicView = useCallback(() => {
    // Show public view only if:
    // 1. There's an active session
    // 2. Session has a valid username (not empty)
    // 3. User doesn't have access
    // 4. User doesn't need to claim
    return (
      currentSession &&
      currentSession.username &&
      currentSession.username.trim() !== '' &&
      !hasAccess() &&
      !needsToClaim()
    );
  }, [currentSession, hasAccess, needsToClaim]);

  // Poll current session every 5 seconds
  useEffect(() => {
    fetchCurrentSession();

    const interval = setInterval(fetchCurrentSession, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCurrentSession]);

  // Check claim eligibility when session changes
  useEffect(() => {
    if (currentSession && currentSession.status === 'pending_claim') {
      checkCanClaim();
    } else {
      setCanClaim(false);
      setClaimReason('no_pending_session');
    }
  }, [currentSession, checkCanClaim]);

  // Fetch public data when user should see public view
  useEffect(() => {
    if (shouldShowPublicView()) {
      fetchPublicWorminalData();

      // Poll public data every 5 seconds when in public view mode
      const interval = setInterval(fetchPublicWorminalData, POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      // Clear public data when not in public view
      setPublicWorminalData(null);
    }
  }, [shouldShowPublicView, fetchPublicWorminalData]);

  return {
    currentSession,
    timeRemaining,
    canClaim,
    claimReason,
    loading,
    error,
    claiming,
    hasAccess: hasAccess(),
    needsToClaim: needsToClaim(),
    claimSession,
    refreshSession: fetchCurrentSession,
    publicWorminalData,
    loadingPublicData,
    shouldShowPublicView: shouldShowPublicView()
  };
};

export default useWorminalAccess;
