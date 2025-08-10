/**
 * Nema service layer - interfaces with the Go backend neural network API
 * Handles neural state queries and prompt interactions
 */

import apiClient, { NetworkError, ServerError } from './api.js';

/**
 * Validate neural state response structure
 */
const validateNeuralState = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid neural state response: missing data object');
  }

  const requiredFields = ['state_count', 'updated_at', 'motor_neurons', 'sensory_neurons'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Invalid neural state response: missing ${field}`);
    }
  }

  // Validate neuron data structure
  if (!data.motor_neurons || typeof data.motor_neurons !== 'object') {
    throw new Error('Invalid neural state response: motor_neurons must be an object');
  }
  
  if (!data.sensory_neurons || typeof data.sensory_neurons !== 'object') {
    throw new Error('Invalid neural state response: sensory_neurons must be an object');
  }

  return true;
};

/**
 * Validate prompt response structure
 */
const validatePromptResponse = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid prompt response: missing data object');
  }

  // The exact structure depends on your Go backend implementation
  // Adjust these validations based on your AskResponse structure
  if (!data.human_message && !data.response && !data.message) {
    throw new Error('Invalid prompt response: missing response message');
  }

  return true;
};

/**
 * Nema service class
 */
class NemaService {
  /**
   * Get current neural state from backend
   * GET /nema/state
   */
  async getNeuralState() {
    try {
      const data = await apiClient.get('/nema/state');
      validateNeuralState(data);
      
      return {
        stateCount: data.state_count,
        updatedAt: new Date(data.updated_at),
        motorNeurons: data.motor_neurons,
        sensoryNeurons: data.sensory_neurons,
        totalNeurons: Object.keys(data.motor_neurons).length + Object.keys(data.sensory_neurons).length,
      };
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ServerError) {
        throw error;
      }
      throw new Error(`Failed to fetch neural state: ${error.message}`);
    }
  }

  /**
   * Send prompt to Nema and get response with neural state updates
   * POST /nema/prompt
   */
  async sendPrompt(message) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Prompt message cannot be empty');
    }

    try {
      const requestBody = {
        prompt: message.trim(),
      };

      const data = await apiClient.post('/nema/prompt', requestBody);
      validatePromptResponse(data);
      
      // Structure response based on your Go backend's AskResponse
      const response = {
        message: data.human_message || data.response || data.message,
        timestamp: new Date(),
      };

      // Include neural state if present in response
      if (data.neural_state || data.state) {
        const neuralData = data.neural_state || data.state;
        response.neuralState = {
          stateCount: neuralData.state_count,
          updatedAt: new Date(neuralData.updated_at),
          motorNeurons: neuralData.motor_neurons,
          sensoryNeurons: neuralData.sensory_neurons,
          totalNeurons: Object.keys(neuralData.motor_neurons || {}).length + 
                       Object.keys(neuralData.sensory_neurons || {}).length,
        };
      }

      // Include state changes if present
      if (data.state_changes || data.changes) {
        response.stateChanges = data.state_changes || data.changes;
      }

      return response;
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ServerError) {
        throw error;
      }
      throw new Error(`Failed to send prompt: ${error.message}`);
    }
  }

  /**
   * Check if the Nema backend is available
   */
  async checkHealth() {
    try {
      return await apiClient.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * Get neural activity summary
   */
  async getNeuralSummary() {
    try {
      const state = await this.getNeuralState();
      
      // Calculate activity statistics
      const allNeurons = { ...state.motorNeurons, ...state.sensoryNeurons };
      const neuronValues = Object.values(allNeurons);
      
      const activeNeurons = neuronValues.filter(value => value !== 0).length;
      const totalNeurons = neuronValues.length;
      const averageActivity = neuronValues.reduce((sum, val) => sum + Math.abs(val), 0) / totalNeurons;
      
      return {
        ...state,
        summary: {
          activeNeurons,
          totalNeurons,
          activityPercentage: (activeNeurons / totalNeurons) * 100,
          averageActivity: Math.round(averageActivity * 100) / 100,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get neural summary: ${error.message}`);
    }
  }
}

// Create singleton instance
const nemaService = new NemaService();

export { NemaService, validateNeuralState, validatePromptResponse };
export default nemaService;