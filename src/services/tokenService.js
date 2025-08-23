/**
 * Token service for fetching token supply and burn data
 */

import config from '../config/environment.js';

const NEMA_TOKEN_MINT = '5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups';
const INITIAL_SUPPLY = 1000000000; // 1 billion tokens
const CACHE_KEY = 'nema_token_supply_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const tokenService = {
  /**
   * Get cached token data from localStorage
   * @returns {Object|null} Cached token data or null if expired/not found
   */
  getCachedTokenData() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 7 days)
      if (now - timestamp < CACHE_DURATION) {
        return data;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error('Error reading token cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  },

  /**
   * Cache token data in localStorage
   * @param {Object} tokenData - Token data to cache
   */
  cacheTokenData(tokenData) {
    try {
      const cacheItem = {
        data: tokenData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error caching token data:', error);
    }
  },

  /**
   * Get current token supply from Helius API with caching
   * @returns {Promise<Object>} Token supply data
   */
  async getTokenSupply() {
    // Try to get cached data first
    const cachedData = this.getCachedTokenData();
    if (cachedData) {
      console.log('Using cached token supply data');
      return cachedData;
    }

    try {
      console.log('Fetching fresh token supply data from Helius');
      const response = await fetch(config.solana.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenSupply',
          params: [NEMA_TOKEN_MINT]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const supplyData = data.result.value;
      const currentSupply = parseInt(supplyData.amount) / Math.pow(10, supplyData.decimals);
      const burnedTokens = INITIAL_SUPPLY - currentSupply;

      const tokenData = {
        initialSupply: INITIAL_SUPPLY,
        currentSupply,
        burnedTokens,
        decimals: supplyData.decimals,
        raw: supplyData
      };

      // Cache the data for 7 days
      this.cacheTokenData(tokenData);

      return tokenData;
    } catch (error) {
      console.error('Error fetching token supply:', error);
      
      // If API fails and we have expired cache, try to use it as fallback
      const expiredCache = localStorage.getItem(CACHE_KEY);
      if (expiredCache) {
        console.log('API failed, using expired cache as fallback');
        try {
          const { data } = JSON.parse(expiredCache);
          return data;
        } catch (parseError) {
          console.error('Failed to parse expired cache:', parseError);
        }
      }
      
      throw error;
    }
  }
};

export default tokenService;