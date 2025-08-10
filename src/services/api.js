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
    this.retries = config.api.retries;
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

    // Parse JSON response
    const data = await response.json();
    this.logResponse(method, url, response, data);
    return data;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', headers = {}, body, retries = this.retries } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    this.logRequest(method, url, requestOptions);

    // Attempt the request with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fetchPromise = fetch(url, requestOptions);
        const timeoutPromise = createTimeout(this.timeout);
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        return await this.handleResponse(response, method, url);
        
      } catch (error) {
        // If this is the last attempt or a non-retryable error, throw it
        if (attempt === retries || error instanceof TimeoutError || error.status < 500) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (this.settings.enableApiDebugging) {
          console.warn(`🔄 Retrying API request (${attempt + 1}/${retries}):`, url);
        }
      }
    }
  }

  /**
   * GET request
   */
  async get(endpoint, headers = {}) {
    return this.makeRequest(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post(endpoint, body = null, headers = {}) {
    return this.makeRequest(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = null, headers = {}) {
    return this.makeRequest(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, headers = {}) {
    return this.makeRequest(endpoint, { method: 'DELETE', headers });
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