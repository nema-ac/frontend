/**
 * Environment configuration for Nema frontend
 * Handles development vs production API endpoints and settings
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Default configuration
const config = {
  // API Settings
  api: {
    baseUrl: isDevelopment 
      ? 'http://localhost:8080' 
      : 'https://nema.fly.dev', // Update this to match your production backend URL
    timeout: 30000, // 30 seconds
  },
  
  // Development settings
  development: {
    enableApiDebugging: true,
    logRequests: true,
    logResponses: true,
  },
  
  // Production settings
  production: {
    enableApiDebugging: false,
    logRequests: false,
    logResponses: false,
  },
};

// Get current environment settings
const getEnvironmentSettings = () => {
  return isDevelopment ? config.development : config.production;
};

// Validate backend availability (for development)
const validateBackendUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export {
  config,
  isDevelopment,
  isProduction,
  getEnvironmentSettings,
  validateBackendUrl,
};

export default config;