/**
 * Worminal API client - Unified API for all Worminal endpoints
 * Handles session management, access control, and Worminal data
 */

import apiClient from './api.js';

class AccessService {
  /**
   * Get current session state (public endpoint)
   * Shows who has access, session status, and time remaining
   * Endpoint: GET /worminal/session
   */
  async getCurrentSession() {
    try {
      return await apiClient.get('/worminal/session');
    } catch (error) {
      console.error('Error fetching current session:', error);
      throw error;
    }
  }

  /**
   * Check if authenticated user can claim current pending session
   * Requires authentication
   * Endpoint: GET /worminal/can-claim
   */
  async canClaim() {
    try {
      return await apiClient.get('/worminal/can-claim', {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
      throw error;
    }
  }

  /**
   * Claim the pending session
   * Requires authentication
   * Endpoint: POST /worminal/claim
   */
  async claimSession() {
    try {
      return await apiClient.post('/worminal/claim', null, {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error claiming session:', error);
      throw error;
    }
  }

  /**
   * Get public Worminal view (public endpoint)
   * Returns session info, neural states, and recent messages
   * Endpoint: GET /worminal/
   */
  async getPublicWorminal() {
    try {
      return await apiClient.get('/worminal/');
    } catch (error) {
      console.error('Error fetching public Worminal data:', error);
      throw error;
    }
  }

  /**
   * Check if authenticated user has Worminal access (auth required)
   * Returns simple boolean
   * Endpoint: GET /worminal/access
   */
  async checkAccess() {
    try {
      return await apiClient.get('/worminal/access', {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error checking Worminal access:', error);
      throw error;
    }
  }
}

// Create singleton instance
const accessService = new AccessService();

export default accessService;
