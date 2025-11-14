/**
 * TransactionMessage component for displaying blockchain transaction notifications in chat
 * Similar styling to BlockchainTransactions but formatted for chat messages
 */

import { getSolscanUrl, truncateSignature } from '../utils/blockchainUtils.js';

const TransactionMessage = ({ transactionId, username, nemaName, completed, timestamp }) => {
  const solscanUrl = getSolscanUrl(transactionId);
  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-2 bg-nema-black/30 border border-nema-gray rounded text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Transaction Info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-nema-cyan text-[10px] font-bold">BLOCKCHAIN TRANSACTION</span>
            {completed ? (
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30">
                Confirmed
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] rounded border border-yellow-500/30">
                Pending
              </span>
            )}
          </div>
          
          {/* Transaction Signature Link */}
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-nema-cyan hover:text-nema-cyan/80 font-mono text-[10px] break-all flex items-center gap-1 group mb-1"
          >
            <span>{truncateSignature(transactionId, 8, 8)}</span>
            <svg
              className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          
          {/* User and Nema Info */}
          <div className="text-nema-gray-darker text-[10px] mt-1">
            {username && nemaName && (
              <span>@{username}'s {nemaName}</span>
            )}
            {username && !nemaName && (
              <span>@{username}</span>
            )}
            {!username && nemaName && (
              <span>{nemaName}</span>
            )}
          </div>
          
          {/* Timestamp */}
          <div className="text-nema-gray-darker text-[10px] mt-0.5">
            {formatTimestamp(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionMessage;

