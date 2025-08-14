/**
 * Profile API service for user profile operations
 */

import apiClient from './api.js';

export const profileService = {
  /**
   * Get authenticated user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    return await apiClient.get('/users/profile', {
      // Include credentials for auth cookie
      credentials: 'include'
    });
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.username - Username
   * @param {string} profileData.twitter_handle - Twitter handle (optional)
   * @param {string} profileData.telegram_handle - Telegram handle (optional)
   * @returns {Promise<void>}
   */
  async updateProfile({ username, twitter_handle, telegram_handle }) {
    const body = {};
    
    if (username !== undefined) body.username = username;
    if (twitter_handle !== undefined) body.twitter_handle = twitter_handle;
    if (telegram_handle !== undefined) body.telegram_handle = telegram_handle;

    return await apiClient.put('/users/profile', body, {
      credentials: 'include'
    });
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