/**
 * Avatar API service for user avatar operations
 * Works with the new dedicated avatar endpoints
 */

import apiClient from './api.js';
import generateWormAvatar from '../utils/wormAvatarGenerator.js';

// Cache to prevent duplicate avatar requests
const avatarCache = {
  data: null,
  timestamp: null,
  pending: null
};
const CACHE_DURATION = 30000; // 30 seconds cache

export const avatarService = {
  /**
   * Get authenticated user's avatar from server
   * @returns {Promise<string|null>} Avatar base64 data URL or null if not found
   */
  async getAvatar() {
    // Check cache first
    if (avatarCache.data !== null && avatarCache.timestamp &&
        Date.now() - avatarCache.timestamp < CACHE_DURATION) {
      return avatarCache.data;
    }

    // Check if there's already a pending request
    if (avatarCache.pending) {
      return await avatarCache.pending;
    }

    // Create a new request promise
    const requestPromise = (async () => {
      try {
        const result = await apiClient.get('/avatar/', {
          credentials: 'include'
        });
        const avatarData = result?.avatar_encoded || null;

        // Cache the result
        avatarCache.data = avatarData;
        avatarCache.timestamp = Date.now();

        return avatarData;
      } catch (error) {
        if (error.status === 404) {
          // Avatar not found - user hasn't set one yet
          // Cache the null result too
          avatarCache.data = null;
          avatarCache.timestamp = Date.now();
          return null;
        }
        throw error;
      } finally {
        // Remove from pending requests
        avatarCache.pending = null;
      }
    })();

    // Store the pending request
    avatarCache.pending = requestPromise;

    return await requestPromise;
  },

  /**
   * Clear the avatar cache (called after updates)
   */
  clearCache() {
    avatarCache.data = null;
    avatarCache.timestamp = null;
    avatarCache.pending = null;
  },

  /**
   * Set user avatar (can only be set once)
   * @param {string} avatarEncoded - Base64 encoded PNG data URL (data:image/png;base64,...)
   * @returns {Promise<void>}
   * @throws {Error} 409 if avatar already set, 400 for invalid format
   */
  async setAvatar(avatarEncoded) {
    // Validate that it's a proper PNG data URL
    if (!avatarEncoded || !avatarEncoded.startsWith('data:image/png;base64,')) {
      throw new Error('Avatar must be a PNG image encoded as data:image/png;base64,{base64_string}');
    }

    try {
      await apiClient.put('/avatar/', {
        avatar_encoded: avatarEncoded
      }, {
        credentials: 'include'
      });

      // Clear cache after successful update
      this.clearCache();
    } catch (error) {
      if (error.status === 409) {
        throw new Error('Avatar has already been set and cannot be changed');
      }
      throw error;
    }
  },

  /**
   * Generate a worm avatar and set it for the user
   * @param {string} walletAddress - User's wallet address for avatar generation
   * @returns {Promise<string>} The generated avatar base64 string
   * @throws {Error} 409 if avatar already set
   */
  async generateAndSetAvatar(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required for avatar generation');
    }

    // Generate the worm avatar
    const avatarBase64 = generateWormAvatar(walletAddress);
    
    // Set it on the server
    await this.setAvatar(avatarBase64);
    
    return avatarBase64;
  },

  /**
   * Generate a worm avatar with a variation seed and set it for the user
   * @param {string} walletAddress - User's wallet address for avatar generation
   * @returns {Promise<string>} The generated avatar base64 string
   * @throws {Error} 409 if avatar already set
   */
  async generateAndSetVariationAvatar(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required for avatar generation');
    }

    // Create variation by adding timestamp to make it different
    const variationSeed = walletAddress + '_' + Date.now();
    const avatarBase64 = generateWormAvatar(variationSeed);
    
    // Set it on the server
    await this.setAvatar(avatarBase64);
    
    return avatarBase64;
  },

  /**
   * Check if user has an avatar set
   * @returns {Promise<boolean>} True if user has an avatar, false otherwise
   */
  async hasAvatar() {
    try {
      const avatar = await this.getAvatar();
      return avatar !== null;
    } catch (_error) {
      // If there's an error other than 404, we assume no avatar
      return false;
    }
  },

  /**
   * Get or generate avatar - checks server first, then generates if needed
   * @param {string} walletAddress - User's wallet address for avatar generation
   * @returns {Promise<string>} Avatar base64 data URL
   */
  async getOrGenerateAvatar(walletAddress) {
    try {
      // First try to get existing avatar from server
      const existingAvatar = await this.getAvatar();
      if (existingAvatar) {
        return existingAvatar;
      }

      // If no avatar exists, generate and set one
      return await this.generateAndSetAvatar(walletAddress);
    } catch (error) {
      if (error.message.includes('already been set')) {
        // Race condition - another process set the avatar
        // Try to fetch it again
        const avatar = await this.getAvatar();
        if (avatar) {
          return avatar;
        }
      }
      throw error;
    }
  }
};

export default avatarService;