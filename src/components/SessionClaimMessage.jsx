/**
 * SessionClaimMessage component for displaying session claim availability notifications in chat
 * Similar styling to TransactionMessage but includes a claim button
 */

import { useState, useEffect } from 'react';
import { useWorminalAccessContext } from '../contexts/WorminalAccessContext.jsx';

const SessionClaimMessage = ({ sessionId, message, timestamp, onClaim, refreshSession }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const { currentSession } = useWorminalAccessContext();

  // Check if this session is still claimable
  const isSessionClaimable = currentSession &&
    currentSession.id === sessionId &&
    currentSession.status === 'pending_claim';

  // If session was claimed (no longer pending), mark as claimed
  useEffect(() => {
    if (currentSession && currentSession.id === sessionId && currentSession.status !== 'pending_claim') {
      setClaimResult('claimed');
    }
  }, [currentSession, sessionId]);

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClaim = async () => {
    if (!onClaim || claiming || !isSessionClaimable) return;

    setClaiming(true);
    setClaimResult(null);

    try {
      const result = await onClaim();
      if (result.success) {
        setClaimResult('success');
        // Refresh session state after successful claim
        if (refreshSession) {
          refreshSession();
        }
      } else {
        setClaimResult('error');
      }
    } catch (err) {
      console.error('Error claiming session:', err);
      setClaimResult('error');
    } finally {
      setClaiming(false);
    }
  };

  // Determine if button should be disabled
  const isDisabled = claiming || claimResult === 'success' || claimResult === 'claimed' || !isSessionClaimable;

  return (
    <div className="p-2 bg-nema-black/30 border border-nema-gray rounded text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Session Claim Info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-nema-cyan text-[10px] font-bold">SESSION AVAILABLE</span>
            <span className="px-1.5 py-0.5 bg-nema-cyan/20 text-nema-cyan text-[9px] rounded border border-nema-cyan/30">
              Open for Claim
            </span>
          </div>

          {/* Message */}
          <div className="text-nema-white text-[10px] mb-2">
            {message}
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-[10px] font-bold rounded transition-colors whitespace-nowrap ${claimResult === 'success' || claimResult === 'claimed'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                : claimResult === 'error'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-nema-cyan text-nema-black hover:bg-nema-cyan/80 border border-nema-cyan'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {claiming
              ? 'Claiming...'
              : claimResult === 'success' || claimResult === 'claimed'
                ? '✓ Session Claimed'
                : claimResult === 'error'
                  ? 'Claim Failed - Try Again'
                  : !isSessionClaimable
                    ? 'Session No Longer Available'
                    : 'Claim Session'}
          </button>

          {/* Timestamp */}
          <div className="text-nema-gray-darker text-[10px] mt-1.5">
            {formatTimestamp(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionClaimMessage;

