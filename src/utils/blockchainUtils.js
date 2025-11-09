/**
 * Utility functions for blockchain transaction handling
 */

/**
 * Extract unique transactions from neural states array
 * @param {Array} states - Array of neural state objects
 * @param {number} limit - Maximum number of transactions to return (default: 10)
 * @returns {Array} Array of transaction objects with signature, hash, timestamp, and state_id
 */
export const extractTransactions = (states = [], limit = 10) => {
  if (!states || !Array.isArray(states) || states.length === 0) {
    return [];
  }

  // Filter states that have transaction signatures
  const transactions = states
    .filter(state => state.transaction_signature && state.transaction_signature.trim() !== '')
    .map(state => ({
      signature: state.transaction_signature,
      hash: state.blockchain_hash || null,
      hashedAt: state.hashed_at || null,
      stateId: state.id || null,
      updatedAt: state.updated_at || null
    }));

  // Remove duplicates based on signature (in case same state appears multiple times)
  const uniqueTransactions = Array.from(
    new Map(transactions.map(tx => [tx.signature, tx])).values()
  );

  // Sort by hashed_at timestamp (most recent first), or updated_at if hashed_at is null
  uniqueTransactions.sort((a, b) => {
    const timeA = a.hashedAt ? new Date(a.hashedAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
    const timeB = b.hashedAt ? new Date(b.hashedAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
    return timeB - timeA; // Descending order (newest first)
  });

  // Limit results
  return uniqueTransactions.slice(0, limit);
};

/**
 * Generate Solscan URL for a transaction signature
 * @param {string} signature - Solana transaction signature
 * @returns {string} Solscan transaction URL
 */
export const getSolscanUrl = (signature) => {
  if (!signature || typeof signature !== 'string') {
    return '#';
  }
  return `https://solscan.io/tx/${signature}`;
};

/**
 * Format transaction timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted timestamp string
 */
export const formatTransactionTimestamp = (timestamp) => {
  if (!timestamp) return 'Pending';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Truncate transaction signature for display
 * @param {string} signature - Full transaction signature
 * @param {number} startLength - Characters to show at start (default: 8)
 * @param {number} endLength - Characters to show at end (default: 8)
 * @returns {string} Truncated signature (e.g., "3Xz9...AbC2")
 */
export const truncateSignature = (signature, startLength = 8, endLength = 8) => {
  if (!signature || typeof signature !== 'string') {
    return '';
  }
  
  if (signature.length <= startLength + endLength) {
    return signature;
  }
  
  return `${signature.substring(0, startLength)}...${signature.substring(signature.length - endLength)}`;
};

