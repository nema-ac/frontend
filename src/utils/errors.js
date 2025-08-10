/**
 * Error handling utilities for Nema frontend
 * Standardized error types and user-friendly error messages
 */

import { NetworkError, ServerError, TimeoutError } from '../services/api.js';

/**
 * Map error types to user-friendly messages
 */
const ERROR_MESSAGES = {
  NetworkError: {
    default: 'Unable to connect to Nema. Please check your internet connection.',
    404: 'Nema service endpoint not found. The service may be temporarily unavailable.',
    401: 'Authentication required. Please verify your access.',
    403: 'Access denied. You may not have permission to access Nema.',
    429: 'Too many requests. Please wait a moment before trying again.',
  },
  ServerError: {
    default: 'Nema is experiencing technical difficulties. Please try again in a few moments.',
    500: 'Internal server error. The Nema neural network may be processing.',
    502: 'Service temporarily unavailable. Nema may be updating.',
    503: 'Service temporarily unavailable. Please try again soon.',
  },
  TimeoutError: {
    default: 'Request timed out. Nema may be thinking deeply about your message.',
  },
  ValidationError: {
    default: 'Invalid input. Please check your message and try again.',
  },
  default: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;

  const errorType = error.constructor?.name || error.name || 'Unknown';
  const errorCode = error.status || error.code;
  
  // Look for specific error type messages
  if (ERROR_MESSAGES[errorType]) {
    const typeMessages = ERROR_MESSAGES[errorType];
    
    // Look for status code specific message
    if (errorCode && typeMessages[errorCode]) {
      return typeMessages[errorCode];
    }
    
    // Fall back to default message for this error type
    if (typeMessages.default) {
      return typeMessages.default;
    }
  }
  
  // Final fallback
  return ERROR_MESSAGES.default;
};

/**
 * Determine if an error is retryable (deprecated - no retries implemented)
 */
export const isRetryableError = (error) => {
  // Always return false since we don't retry requests
  return false;
};

/**
 * Log error for debugging (development only)
 */
export const logError = (error, context = '') => {
  if (import.meta.env.DEV) {
    console.error(`🚨 Nema Error${context ? ` (${context})` : ''}:`, {
      message: error.message,
      type: error.constructor.name,
      status: error.status,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Create standardized error object for components
 */
export const createErrorState = (error, context = '') => {
  logError(error, context);
  
  return {
    hasError: true,
    error: {
      message: error.message,
      friendlyMessage: getUserFriendlyErrorMessage(error),
      type: error.constructor?.name || 'Error',
      status: error.status || null,
      isRetryable: isRetryableError(error),
      context,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Error recovery strategies
 */
export const getErrorRecoveryActions = (error) => {
  const actions = [];
  
  // Manual retry option for user-initiated retries
  actions.push({
    label: 'Try Again',
    action: 'retry',
    primary: true,
  });
  
  if (error instanceof NetworkError) {
    actions.push({
      label: 'Check Connection',
      action: 'checkConnection',
      primary: false,
    });
  }
  
  // Always provide option to refresh
  actions.push({
    label: 'Refresh Page',
    action: 'refresh',
    primary: false,
  });
  
  return actions;
};

/**
 * Validate API response structure
 */
export const validateResponse = (data, requiredFields = []) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: expected object');
  }
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Invalid response: missing required field '${field}'`);
    }
  }
  
  return true;
};

export {
  NetworkError,
  ServerError, 
  TimeoutError,
  ERROR_MESSAGES,
};