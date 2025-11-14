/**
 * Input validation utilities for frontend entry points
 * Implements backend sanitization rules to prevent invalid data from being sent
 */

/**
 * Get byte length of a string (UTF-8 encoding)
 * This counts bytes, not Unicode characters, which is important for emojis
 * @param {string} str - String to measure
 * @returns {number} Byte length
 */
export function getByteLength(str) {
  if (typeof str !== 'string') {
    return 0;
  }
  // Use TextEncoder to get accurate UTF-8 byte length
  return new TextEncoder().encode(str).length;
}

/**
 * Check if a string contains a URL/link
 * Matches backend URL detection patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if URL detected
 */
export function containsURL(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Common URL patterns (matches backend validation)
  const urlPatterns = [
    /https?:\/\/[^\s]+/gi,  // http:// or https://
    /www\.[^\s]+/gi,         // www.
    /ftp:\/\/[^\s]+/gi,      // ftp://
    /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi,  // domain.com, domain.org, domain.io, etc.
  ];

  return urlPatterns.some(pattern => pattern.test(text));
}

/**
 * Validate chat message (200 byte limit, no URLs)
 * @param {string} message - Message to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateChatMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const byteLength = getByteLength(trimmed);
  if (byteLength > 200) {
    return { 
      valid: false, 
      error: `Message exceeds 200 character limit (${byteLength} bytes). Emojis count as multiple bytes.` 
    };
  }

  if (containsURL(trimmed)) {
    return { valid: false, error: 'Links are not allowed in chat. Please remove any URLs from your message.' };
  }

  return { valid: true };
}

/**
 * Validate nema interaction message (500 byte limit)
 * @param {string} message - Message to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateNemaMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const byteLength = getByteLength(trimmed);
  if (byteLength > 500) {
    return { 
      valid: false, 
      error: `Message exceeds 500 character limit (${byteLength} bytes). Emojis count as multiple bytes.` 
    };
  }

  return { valid: true };
}

/**
 * Sanitize profile field (lowercase, strip @, trim)
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
export function sanitizeProfileField(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = value.trim();

  // Strip leading @ symbol
  if (sanitized.startsWith('@')) {
    sanitized = sanitized.substring(1);
  }

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  return sanitized;
}

/**
 * Validate and sanitize username
 * @param {string} username - Username to validate
 * @returns {{valid: boolean, sanitized?: string, error?: string}} Validation result
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }

  const sanitized = sanitizeProfileField(username);

  if (!sanitized) {
    return { valid: false, error: 'Username cannot be empty' };
  }

  if (sanitized.length > 40) {
    return { valid: false, error: 'Username must be 40 characters or less' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize Twitter handle
 * @param {string} handle - Twitter handle to validate
 * @returns {{valid: boolean, sanitized?: string, error?: string}} Validation result
 */
export function validateTwitterHandle(handle) {
  if (!handle || typeof handle !== 'string') {
    return { valid: true, sanitized: '' }; // Optional field
  }

  const sanitized = sanitizeProfileField(handle);

  if (!sanitized) {
    return { valid: true, sanitized: '' }; // Empty is valid (optional field)
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Twitter handle must be 50 characters or less' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize Telegram handle
 * @param {string} handle - Telegram handle to validate
 * @returns {{valid: boolean, sanitized?: string, error?: string}} Validation result
 */
export function validateTelegramHandle(handle) {
  if (!handle || typeof handle !== 'string') {
    return { valid: true, sanitized: '' }; // Optional field
  }

  const sanitized = sanitizeProfileField(handle);

  if (!sanitized) {
    return { valid: true, sanitized: '' }; // Empty is valid (optional field)
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Telegram handle must be 50 characters or less' };
  }

  return { valid: true, sanitized };
}

/**
 * Sanitize profile data object (all fields)
 * @param {Object} profileData - Profile data to sanitize
 * @param {string} profileData.username - Username
 * @param {string} [profileData.twitter_handle] - Twitter handle (optional)
 * @param {string} [profileData.telegram_handle] - Telegram handle (optional)
 * @returns {{valid: boolean, sanitized?: Object, errors?: Object}} Validation result
 */
export function sanitizeProfileData(profileData) {
  const errors = {};
  const sanitized = {};

  // Validate username (required)
  const usernameResult = validateUsername(profileData.username);
  if (!usernameResult.valid) {
    errors.username = usernameResult.error;
  } else {
    sanitized.username = usernameResult.sanitized;
  }

  // Validate Twitter handle (optional)
  if (profileData.twitter_handle !== undefined) {
    const twitterResult = validateTwitterHandle(profileData.twitter_handle);
    if (!twitterResult.valid) {
      errors.twitter_handle = twitterResult.error;
    } else {
      sanitized.twitter_handle = twitterResult.sanitized || undefined;
    }
  }

  // Validate Telegram handle (optional)
  if (profileData.telegram_handle !== undefined) {
    const telegramResult = validateTelegramHandle(profileData.telegram_handle);
    if (!telegramResult.valid) {
      errors.telegram_handle = telegramResult.error;
    } else {
      sanitized.telegram_handle = telegramResult.sanitized || undefined;
    }
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    sanitized: valid ? sanitized : undefined,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

