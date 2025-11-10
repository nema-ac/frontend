/**
 * Custom hook for Worminal access control
 * Handles session polling, claim eligibility, and access permissions
 */

import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import accessService from '../services/access.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

const POLL_INTERVAL = 10000; // Poll every 10 seconds

export const useWorminalAccess = () => {
  const { profile, isAuthenticated } = useContext(AuthContext);
  const [currentSession, setCurrentSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [openForAnyone, setOpenForAnyone] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [hasAccessFromAPI, setHasAccessFromAPI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [publicWorminalData, setPublicWorminalData] = useState(null);
  const [loadingPublicData, setLoadingPublicData] = useState(false);
  const [publicTimeRemaining, setPublicTimeRemaining] = useState(0);
  const countdownIntervalRef = useRef(null);
  const publicCountdownIntervalRef = useRef(null);
  const previousTimeRemainingRef = useRef(null);
  const previousPublicTimeRemainingRef = useRef(null);

  // Fetch current session state
  const fetchCurrentSession = useCallback(async () => {
    try {
      const data = await accessService.getCurrentSession();
      setCurrentSession(data.session);
      setTimeRemaining(data.time_remaining_ms || 0);
      setOpenForAnyone(data.open_for_anyone || false);
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
    // Only check if user is authenticated and session exists and is pending
    if (!isAuthenticated || !profile || !currentSession || currentSession.status !== 'pending_claim') {
      setCanClaim(false);
      setClaimReason('no_pending_session');
      return;
    }

    // Always call the API to check claim eligibility - the backend will determine
    // if the user can claim based on whether it's their session or open for anyone
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

  // Fetch access status from authenticated endpoint
  const fetchAccessStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setHasAccessFromAPI(false);
      return;
    }

    try {
      const data = await accessService.checkAccess();
      setHasAccessFromAPI(data.has_access || false);
    } catch (err) {
      // If not authenticated or endpoint fails, user doesn't have access
      console.error('Error checking access:', err);
      setHasAccessFromAPI(false);
    }
  }, [isAuthenticated]);

  // Check if current user has access (uses authenticated endpoint)
  const hasAccess = useCallback(() => {
    if (!isAuthenticated || !currentSession) {
      return false;
    }

    // Use API response for access check (more reliable than wallet comparison)
    return hasAccessFromAPI && currentSession.status === 'active';
  }, [isAuthenticated, currentSession, hasAccessFromAPI]);

  // Check if current user is in the session but hasn't claimed yet
  // Uses canClaim status instead of wallet comparison
  const needsToClaim = useCallback(() => {
    if (!isAuthenticated || !currentSession) {
      return false;
    }

    // User needs to claim if session is pending and they can claim it
    return (
      currentSession.status === 'pending_claim' &&
      canClaim &&
      !currentSession.claimed_at
    );
  }, [isAuthenticated, currentSession, canClaim]);

  // Fetch public Worminal data (when user is spectating)
  const fetchPublicWorminalData = useCallback(async () => {
    setLoadingPublicData(true);
    try {
      const data = await accessService.getPublicWorminal();
      setPublicWorminalData(data);
      // Initialize countdown timer from API response (assumes seconds)
      if (data?.time_remaining) {
        setPublicTimeRemaining(data.time_remaining * 1000); // Convert to milliseconds
      }
    } catch (err) {
      console.error('Error fetching public Worminal data:', err);
      setPublicWorminalData(null);
      setPublicTimeRemaining(0);
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
    // 5. User can't claim (either not their session or not open for anyone)
    return (
      currentSession &&
      currentSession.username &&
      currentSession.username.trim() !== '' &&
      !hasAccess() &&
      !needsToClaim() &&
      !canClaim
    );
  }, [currentSession, hasAccess, needsToClaim, canClaim]);

  // Poll current session every 10 seconds
  useEffect(() => {
    fetchCurrentSession();

    const interval = setInterval(fetchCurrentSession, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCurrentSession]);

  // Poll access status when authenticated (refresh when session changes)
  useEffect(() => {
    if (isAuthenticated && currentSession) {
      fetchAccessStatus();
      
      // Refresh access status periodically
      const interval = setInterval(fetchAccessStatus, POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      setHasAccessFromAPI(false);
    }
  }, [isAuthenticated, currentSession, fetchAccessStatus]);

  // Countdown timer - decrements timeRemaining every second
  // Uses a single continuous interval that checks if countdown should run
  useEffect(() => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Set up countdown interval that runs continuously
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        // Only decrement if there's time remaining
        if (prev > 0) {
          const newValue = prev - 1000;
          return newValue > 0 ? newValue : 0;
        }
        return prev;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []); // Only run once on mount, interval runs continuously

  // Public countdown timer - decrements publicTimeRemaining every second
  useEffect(() => {
    // Clear any existing interval
    if (publicCountdownIntervalRef.current) {
      clearInterval(publicCountdownIntervalRef.current);
      publicCountdownIntervalRef.current = null;
    }

    // Set up countdown interval that runs continuously
    publicCountdownIntervalRef.current = setInterval(() => {
      setPublicTimeRemaining(prev => {
        // Only decrement if there's time remaining
        if (prev > 0) {
          const newValue = prev - 1000;
          return newValue > 0 ? newValue : 0;
        }
        return prev;
      });
    }, 1000);

    return () => {
      if (publicCountdownIntervalRef.current) {
        clearInterval(publicCountdownIntervalRef.current);
        publicCountdownIntervalRef.current = null;
      }
    };
  }, []); // Only run once on mount, interval runs continuously

  // Refresh session data when timer reaches 0 to avoid lag
  useEffect(() => {
    // Check if timer just reached 0 (was > 0, now is 0)
    if (previousTimeRemainingRef.current !== null && 
        previousTimeRemainingRef.current > 0 && 
        timeRemaining === 0) {
      // Timer reached 0, refresh session data to get accurate state
      fetchCurrentSession();
    }
    // Update previous value
    previousTimeRemainingRef.current = timeRemaining;
  }, [timeRemaining, fetchCurrentSession]);

  // Refresh public data when timer reaches 0 to avoid lag
  useEffect(() => {
    // Check if timer just reached 0 (was > 0, now is 0)
    if (previousPublicTimeRemainingRef.current !== null && 
        previousPublicTimeRemainingRef.current > 0 && 
        publicTimeRemaining === 0) {
      // Timer reached 0, refresh public data to get accurate state
      if (shouldShowPublicView()) {
        fetchPublicWorminalData();
      }
    }
    // Update previous value
    previousPublicTimeRemainingRef.current = publicTimeRemaining;
  }, [publicTimeRemaining, fetchPublicWorminalData, shouldShowPublicView]);

  // Check claim eligibility when session changes or openForAnyone flag changes
  useEffect(() => {
    if (currentSession && currentSession.status === 'pending_claim') {
      checkCanClaim();
    } else {
      setCanClaim(false);
      setClaimReason('no_pending_session');
    }
  }, [currentSession, openForAnyone, checkCanClaim]);

  // Fetch public data when user should see public view
  useEffect(() => {
    if (shouldShowPublicView()) {
      fetchPublicWorminalData();

      // Poll public data every 10 seconds when in public view mode
      const interval = setInterval(fetchPublicWorminalData, POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      // Clear public data when not in public view
      setPublicWorminalData(null);
      setPublicTimeRemaining(0);
    }
  }, [shouldShowPublicView, fetchPublicWorminalData]);

  return {
    currentSession,
    timeRemaining,
    openForAnyone,
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
    publicTimeRemaining,
    loadingPublicData,
    shouldShowPublicView: shouldShowPublicView()
  };
};

export default useWorminalAccess;
