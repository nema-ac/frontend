/**
 * BlockchainTransactions component for displaying Solana transaction history
 * Shows recent transactions from neural states with links to Solscan
 */

import { useState } from 'react';
import { extractTransactions, getSolscanUrl, formatTransactionTimestamp, truncateSignature } from '../utils/blockchainUtils.js';

const BlockchainTransactions = ({ states = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract transactions from states
  const transactions = extractTransactions(states, 10);

  if (transactions.length === 0) {
    return null; // Don't show section if no transactions
  }

  return (
    <div className="border-t border-nema-gray pt-4">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="text-nema-cyan text-xs font-bold">BLOCKCHAIN TRANSACTIONS</span>
          <span className="text-nema-gray-darker text-[10px]">({transactions.length})</span>
        </div>
        <svg
          className={`w-4 h-4 text-nema-cyan transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Transaction List */}
      {isExpanded && (
        <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
          {transactions.map((tx, index) => {
            const isConfirmed = tx.hashedAt !== null;
            const solscanUrl = getSolscanUrl(tx.signature);
            
            return (
              <div
                key={tx.signature || index}
                className="p-2 bg-nema-black/30 border border-nema-gray rounded text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Transaction Signature Link */}
                    <a
                      href={solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nema-cyan hover:text-nema-cyan/80 font-mono text-[10px] break-all flex items-center gap-1 group"
                    >
                      <span>{truncateSignature(tx.signature, 6, 6)}</span>
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
                    
                    {/* Timestamp and Status */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-nema-gray-darker text-[10px]">
                        {formatTransactionTimestamp(tx.hashedAt || tx.updatedAt)}
                      </span>
                      {isConfirmed ? (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] rounded border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockchainTransactions;

