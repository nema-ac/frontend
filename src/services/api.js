/**
 * Core API client for Nema frontend
 * Centralized HTTP client using native fetch with error handling and retries
 */

import config, { getEnvironmentSettings } from '../config/environment.js';

// Custom error classes
class NetworkError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

class ServerError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Utility function to create timeout promise
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), ms);
  });
};

// Main API client class
class ApiClient {
  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.settings = getEnvironmentSettings();
  }

  /**
   * Log request details (development only)
   */
  logRequest(method, url, options) {
    if (this.settings.logRequests) {
      console.log(`🔄 API ${method.toUpperCase()}: ${url}`, {
        headers: options.headers,
        body: options.body,
      });
    }
  }

  /**
   * Log response details (development only)
   */
  logResponse(method, url, response, data) {
    if (this.settings.logResponses) {
      console.log(`✅ API ${method.toUpperCase()}: ${url}`, {
        status: response.status,
        statusText: response.statusText,
        data,
      });
    }
  }

  /**
   * Handle API response and extract data
   */
  async handleResponse(response, method, url) {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Try to extract error details from response
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Use default error message if JSON parsing fails
      }

      if (response.status >= 400 && response.status < 500) {
        throw new NetworkError(errorMessage, response.status);
      } else {
        throw new ServerError(errorMessage, response.status);
      }
    }

    // Parse JSON response if there's content
    let data = null;
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Only parse JSON if there's content and it's JSON
    if (contentLength !== '0' && contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        // If JSON parsing fails, return null for empty responses
        data = null;
      }
    }
    
    this.logResponse(method, url, response, data);
    return data;
  }

  /**
   * Make HTTP request with timeout (single attempt, no retries)
   */
  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', headers = {}, body, credentials } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (credentials) {
      requestOptions.credentials = credentials;
    }

    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    this.logRequest(method, url, requestOptions);

    // Single attempt with timeout
    const fetchPromise = fetch(url, requestOptions);
    const timeoutPromise = createTimeout(this.timeout);
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return await this.handleResponse(response, method, url);
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const { headers = {}, credentials } = options;
    return this.makeRequest(endpoint, { method: 'GET', headers, credentials });
  }

  /**
   * POST request
   */
  async post(endpoint, body = null, options = {}) {
    const { headers = {}, credentials } = options;
    return this.makeRequest(endpoint, { method: 'POST', body, headers, credentials });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = null, options = {}) {
    const { headers = {}, credentials } = options;
    return this.makeRequest(endpoint, { method: 'PUT', body, headers, credentials });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const { headers = {}, credentials } = options;
    return this.makeRequest(endpoint, { method: 'DELETE', headers, credentials });
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    try {
      await this.get('/healthz');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export error classes and client
export { NetworkError, ServerError, TimeoutError, apiClient };
export default apiClient;