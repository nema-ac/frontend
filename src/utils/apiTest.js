/**
 * API testing utilities for development and debugging
 * Provides tools to test and validate Nema backend connectivity
 */

import nemaService from '../services/nema.js';
import apiClient from '../services/api.js';
import { validateNeuralState, validatePromptResponse } from '../services/nema.js';
import config, { isDevelopment } from '../config/environment.js';

/**
 * Test suite results structure
 */
class TestResult {
  constructor(name, success = false, message = '', data = null, duration = 0) {
    this.name = name;
    this.success = success;
    this.message = message;
    this.data = data;
    this.duration = duration;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Run a single test with timing
 */
const runTest = async (name, testFn) => {
  const startTime = Date.now();
  try {
    const result = await testFn();
    const duration = Date.now() - startTime;
    return new TestResult(name, true, 'Success', result, duration);
  } catch (error) {
    const duration = Date.now() - startTime;
    return new TestResult(name, false, error.message, null, duration);
  }
};

/**
 * Test basic connectivity to the backend
 */
export const testConnectivity = async () => {
  return runTest('Backend Connectivity', async () => {
    const healthy = await apiClient.healthCheck();
    if (!healthy) {
      throw new Error('Health check failed - backend may be down');
    }
    return { status: 'Backend is responding to health checks' };
  });
};

/**
 * Test neural state endpoint
 */
export const testNeuralState = async () => {
  return runTest('Neural State Endpoint', async () => {
    const state = await nemaService.getNeuralState();
    
    // Validate structure
    validateNeuralState({
      state_count: state.stateCount,
      updated_at: state.updatedAt.toISOString(),
      motor_neurons: state.motorNeurons,
      sensory_neurons: state.sensoryNeurons,
    });
    
    return {
      status: 'Neural state retrieved successfully',
      neuronCount: state.totalNeurons,
      stateCount: state.stateCount,
      lastUpdated: state.updatedAt,
    };
  });
};

/**
 * Test prompt endpoint (if available)
 */
export const testPromptEndpoint = async (testMessage = 'Hello, Nema! This is a test message.') => {
  return runTest('Prompt Endpoint', async () => {
    try {
      const response = await nemaService.sendPrompt(testMessage);
      
      // Validate response structure
      if (!response.message) {
        throw new Error('Invalid response: missing message field');
      }
      
      return {
        status: 'Prompt endpoint working',
        responseLength: response.message.length,
        hasNeuralState: !!response.neuralState,
        hasStateChanges: !!response.stateChanges,
      };
    } catch (error) {
      // If endpoint is commented out, that's expected
      if (error.status === 404) {
        throw new Error('Prompt endpoint not available (may be commented out in backend)');
      }
      throw error;
    }
  });
};

/**
 * Test neural state polling
 */
export const testPolling = async (iterations = 3, intervalMs = 1000) => {
  return runTest('Neural State Polling', async () => {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const state = await nemaService.getNeuralState();
      const responseTime = Date.now() - startTime;
      
      results.push({
        iteration: i + 1,
        stateCount: state.stateCount,
        responseTime,
        timestamp: new Date(),
      });
      
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    return {
      status: 'Polling test completed',
      iterations,
      averageResponseTime: Math.round(avgResponseTime),
      results,
    };
  });
};

/**
 * Test error handling
 */
export const testErrorHandling = async () => {
  return runTest('Error Handling', async () => {
    const tests = [];
    
    // Test invalid endpoint
    try {
      await apiClient.get('/invalid-endpoint');
      tests.push({ test: 'Invalid endpoint', result: 'Should have thrown error' });
    } catch (error) {
      tests.push({ 
        test: 'Invalid endpoint', 
        result: 'Correctly handled', 
        errorType: error.constructor.name 
      });
    }
    
    // Test empty prompt
    try {
      await nemaService.sendPrompt('');
      tests.push({ test: 'Empty prompt', result: 'Should have thrown error' });
    } catch (error) {
      tests.push({ 
        test: 'Empty prompt', 
        result: 'Correctly handled', 
        errorType: error.constructor.name 
      });
    }
    
    return {
      status: 'Error handling tests completed',
      tests,
    };
  });
};

/**
 * Run complete test suite
 */
export const runTestSuite = async () => {
  console.log('🧪 Starting Nema API test suite...');
  
  const startTime = Date.now();
  const results = [];
  
  // Run tests sequentially
  results.push(await testConnectivity());
  results.push(await testNeuralState());
  results.push(await testPromptEndpoint());
  results.push(await testPolling(2, 500)); // Quick polling test
  results.push(await testErrorHandling());
  
  const totalDuration = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: successCount,
    failed: results.length - successCount,
    totalDuration,
    results,
  };
  
  // Log results
  console.log('🧪 Test Suite Results:', summary);
  
  // Log individual results
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`);
    if (result.data && isDevelopment) {
      console.log('   Data:', result.data);
    }
  });
  
  return summary;
};

/**
 * Quick connectivity check for components
 */
export const quickHealthCheck = async () => {
  try {
    const isHealthy = await apiClient.healthCheck();
    return {
      healthy: isHealthy,
      timestamp: new Date(),
      backend: config.api.baseUrl,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date(),
      backend: config.api.baseUrl,
    };
  }
};

/**
 * Development-only console commands
 */
if (isDevelopment && typeof window !== 'undefined') {
  // Add test functions to window for console access
  window.nemaTests = {
    runTestSuite,
    testConnectivity,
    testNeuralState, 
    testPromptEndpoint,
    testPolling,
    testErrorHandling,
    quickHealthCheck,
  };
  
  console.log('🧪 Nema test utilities loaded. Try: nemaTests.runTestSuite()');
}