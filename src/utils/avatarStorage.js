/**
 * Avatar storage utility for managing client-side avatar persistence
 */

import generateWormAvatar from './wormAvatarGenerator.js';

const AVATAR_STORAGE_KEY = 'nema_worm_avatars';

// Get all stored avatars
function getAllStoredAvatars() {
  try {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading avatars from localStorage:', error);
    return {};
  }
}

// Store avatar for a wallet address
function storeAvatar(walletAddress, avatarBase64) {
  try {
    const avatars = getAllStoredAvatars();
    avatars[walletAddress] = {
      avatar: avatarBase64,
      generated: Date.now()
    };
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
  } catch (error) {
    console.error('Error storing avatar to localStorage:', error);
  }
}

// Get avatar for a wallet address, generate if not found
export function getOrGenerateAvatar(walletAddress) {
  if (!walletAddress) return null;

  try {
    const avatars = getAllStoredAvatars();
    const stored = avatars[walletAddress];

    if (stored && stored.avatar) {
      return stored.avatar;
    }

    // Generate new avatar if not found
    console.log('Generating new avatar for wallet:', walletAddress.slice(0, 8) + '...');
    const newAvatar = generateWormAvatar(walletAddress);
    storeAvatar(walletAddress, newAvatar);
    return newAvatar;
  } catch (error) {
    console.error('Error getting/generating avatar:', error);
    return null;
  }
}

// Generate a new variation and store it
export function generateNewVariation(walletAddress) {
  if (!walletAddress) return null;

  try {
    // Create variation by adding timestamp to make it different
    const variationSeed = walletAddress + '_' + Date.now();
    const newAvatar = generateWormAvatar(variationSeed);
    storeAvatar(walletAddress, newAvatar);
    console.log('Generated new avatar variation for wallet:', walletAddress.slice(0, 8) + '...');
    return newAvatar;
  } catch (error) {
    console.error('Error generating avatar variation:', error);
    return null;
  }
}

// Clear avatar for a wallet (useful for testing)
export function clearAvatar(walletAddress) {
  try {
    const avatars = getAllStoredAvatars();
    delete avatars[walletAddress];
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
    console.log('Cleared avatar for wallet:', walletAddress.slice(0, 8) + '...');
  } catch (error) {
    console.error('Error clearing avatar:', error);
  }
}

// Clear all avatars (useful for testing)
export function clearAllAvatars() {
  try {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    console.log('Cleared all stored avatars');
  } catch (error) {
    console.error('Error clearing all avatars:', error);
  }
}

export default {
  getOrGenerateAvatar,
  generateNewVariation,
  clearAvatar,
  clearAllAvatars
};