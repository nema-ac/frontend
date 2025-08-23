import { address, createSolanaRpc } from '@solana/kit';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import config from '../config/environment.js';

// NEMA token mint address
export const NEMA_MINT_ADDRESS = '5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups';

// Create RPC client using Helius endpoint from config
const rpc = createSolanaRpc(config.solana.rpcUrl);

// Cache to prevent duplicate requests
const balanceCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Fetches the NEMA token balance for a given wallet address using @solana/kit with Helius RPC
 * @param {string} walletAddress - The wallet address to check
 * @returns {Promise<number>} - The NEMA token balance (in tokens, not lamports)
 */
export async function fetchNemaBalance(walletAddress) {
    // Check cache first
    const cached = balanceCache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.balance;
    }
    
    // Check if there's already a pending request for this wallet
    if (pendingRequests.has(walletAddress)) {
        return await pendingRequests.get(walletAddress);
    }
    
    // Create a new request promise
    const requestPromise = (async () => {
        try {
            // Convert addresses to PublicKey objects
            const walletPublicKey = new PublicKey(walletAddress);
            const nemaMintPublicKey = new PublicKey(NEMA_MINT_ADDRESS);
            
            // Get the associated token account address for this wallet and NEMA mint
            const associatedTokenAddress = await getAssociatedTokenAddress(
                nemaMintPublicKey,
                walletPublicKey
            );
            
            // Convert to @solana/kit address format
            const tokenAccountAddress = address(associatedTokenAddress.toString());
            
            // Get token account balance using @solana/kit with Helius RPC
            const balanceResult = await rpc.getTokenAccountBalance(tokenAccountAddress).send();
            
            // Extract the UI amount (human-readable balance)
            const balance = balanceResult.value?.uiAmount || 0;
            
            // Cache the result
            balanceCache.set(walletAddress, {
                balance,
                timestamp: Date.now()
            });
            
            return balance;
        } catch (error) {
            // Handle case where token account doesn't exist (no tokens)
            if (error.message?.includes('TokenAccountNotFoundError') || 
                error.message?.includes('Account does not exist') ||
                error.message?.includes('Invalid param: could not find account')) {
                
                // Cache the zero balance too
                balanceCache.set(walletAddress, {
                    balance: 0,
                    timestamp: Date.now()
                });
                return 0;
            }
            
            console.error('Error fetching NEMA balance:', error);
            return 0;
        } finally {
            // Remove from pending requests
            pendingRequests.delete(walletAddress);
        }
    })();
    
    // Store the pending request
    pendingRequests.set(walletAddress, requestPromise);
    
    return await requestPromise;
}