/**
 * Profile API service for user profile operations
 */

import apiClient from './api.js';
import generateWormAvatar from '../utils/wormAvatarGenerator.js';

// Cache to prevent duplicate profile requests
const profileCache = {
  data: null,
  timestamp: null,
  pending: null
};
const CACHE_DURATION = 30000; // 30 seconds cache

export const profileService = {
  /**
   * Get authenticated user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    // Check cache first
    if (profileCache.data && profileCache.timestamp && 
        Date.now() - profileCache.timestamp < CACHE_DURATION) {
      return profileCache.data;
    }
    
    // Check if there's already a pending request
    if (profileCache.pending) {
      return await profileCache.pending;
    }
    
    // Create a new request promise
    const requestPromise = (async () => {
      try {
        const result = await apiClient.get('/users/profile', {
          // Include credentials for auth cookie
          credentials: 'include'
        });
        
        // Cache the result
        profileCache.data = result;
        profileCache.timestamp = Date.now();
        
        return result;
      } finally {
        // Remove from pending requests
        profileCache.pending = null;
      }
    })();
    
    // Store the pending request
    profileCache.pending = requestPromise;
    
    return await requestPromise;
  },

  /**
   * Clear the profile cache (called after updates)
   */
  clearCache() {
    profileCache.data = null;
    profileCache.timestamp = null;
    profileCache.pending = null;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.username - Username
   * @param {string} profileData.twitter_handle - Twitter handle (optional)
   * @param {string} profileData.telegram_handle - Telegram handle (optional)
   * @param {string} profileData.avatar_base64 - Base64 avatar image (optional)
   * @returns {Promise<void>}
   */
  async updateProfile({ username, twitter_handle, telegram_handle, avatar_base64 }) {
    const body = {};
    
    if (username !== undefined) body.username = username;
    if (twitter_handle !== undefined) body.twitter_handle = twitter_handle;
    if (telegram_handle !== undefined) body.telegram_handle = telegram_handle;
    if (avatar_base64 !== undefined) body.avatar_base64 = avatar_base64;

    const result = await apiClient.put('/users/profile', body, {
      credentials: 'include'
    });
    
    // Clear cache after successful update
    this.clearCache();
    
    return result;
  },

  /**
   * Set user avatar (can only be set once)
   * @param {string} avatarEncoded - Base64 encoded avatar data URL
   * @returns {Promise<void>}
   */
  async setAvatar(avatarEncoded) {
    const result = await apiClient.put('/users/profile/avatar', {
      avatar_encoded: avatarEncoded
    }, {
      credentials: 'include'
    });
    
    // Clear cache after successful update
    this.clearCache();
    
    return result;
  },

  /**
   * Generate and set worm avatar for user (only if not already set)
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<string>} Generated avatar base64 string
   */
  async generateAndSetAvatar(walletAddress) {
    const avatarBase64 = generateWormAvatar(walletAddress);
    await this.setAvatar(avatarBase64);
    return avatarBase64;
  },

  /**
   * Delete user profile
   * @returns {Promise<void>}
   */
  async deleteProfile() {
    return await apiClient.delete('/users/profile', {
      credentials: 'include'
    });
  }
};

export default profileService;