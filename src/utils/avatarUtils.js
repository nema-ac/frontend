/**
 * Avatar utility functions for handling profile pictures with default fallback
 */

import defaultProfPic from '../assets/defaultProfPic.png';

/**
 * Get avatar URL with fallback to default profile picture
 * @param {string|null|undefined} avatarUrl - The avatar URL from API (can be null, undefined, or empty string)
 * @returns {string} Avatar URL or default profile picture path
 */
export function getAvatarUrl(avatarUrl) {
  // Return default if avatarUrl is null, undefined, empty string, or falsy
  if (!avatarUrl) {
    return defaultProfPic;
  }
  return avatarUrl;
}

/**
 * Get avatar URL from profile object with fallback to default
 * Checks both profile_pic and avatar_base64 properties
 * @param {Object|null|undefined} profile - Profile object
 * @returns {string} Avatar URL or default profile picture path
 */
export function getProfileAvatarUrl(profile) {
  if (!profile) {
    return defaultProfPic;
  }
  
  // Check avatar_base64 first (newer format), then profile_pic
  const avatarUrl = profile.avatar_base64 || profile.profile_pic;
  return getAvatarUrl(avatarUrl);
}

/**
 * Get the default profile picture (always returns defaultProfPic)
 * Used for user messages that should always show the default avatar
 * @returns {string} Default profile picture path
 */
export function getDefaultAvatarUrl() {
  return defaultProfPic;
}

export default {
  getAvatarUrl,
  getProfileAvatarUrl,
  getDefaultAvatarUrl
};

