/**
 * Nema service layer - interfaces with the Go backend neural network API
 * Handles neural state queries, prompt interactions, and user nema management
 */

import apiClient, { NetworkError, ServerError } from './api.js';
import { validateNemaMessage } from '../utils/validation.js';

/**
 * Validate neural state response structure
 */
const validateNeuralState = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid neural state response: missing data object');
  }

  const requiredFields = ['id', 'updated_at', 'motor_neurons', 'sensory_neurons'];
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

  // Based on Go backend's AskResponse structure
  const requiredFields = ['human_message', 'state_id', 'changed', 'neural_state'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Invalid prompt response: missing ${field}`);
    }
  }

  return true;
};

/**
 * Nema service class
 */
class NemaService {
  /**
   * Create a new nema
   * @param {Object} nemaData - Nema creation data
   * @param {string} nemaData.name - Nema name (1-50 chars)
   * @param {string} nemaData.description - Nema description
   * @returns {Promise<Object>} Created nema data
   */
  async createNema({ name, description }) {
    return await apiClient.post('/user/nema', {
      name,
      description
    }, {
      credentials: 'include'
    });
  }

  /**
   * Update an existing nema
   * @param {Object} nemaData - Nema update data
   * @param {number} nemaData.id - Nema ID
   * @param {string} nemaData.name - Nema name (1-50 chars)
   * @param {string} nemaData.description - Nema description
   * @param {boolean} nemaData.archived - Whether nema is archived
   * @returns {Promise<void>}
   */
  async updateNema({ id, name, description, archived }) {
    return await apiClient.put('/user/nema', {
      id,
      name,
      description,
      archived
    }, {
      credentials: 'include'
    });
  }

  /**
   * Delete a nema
   * @param {number} nemaId - Nema ID to delete
   * @returns {Promise<void>}
   */
  async deleteNema(nemaId) {
    return await apiClient.delete('/user/nema', { id: nemaId }, {
      credentials: 'include'
    });
  }

  /**
   * Send message to a nema
   * @param {Object} messageData - Message data
   * @param {number} messageData.nema_id - Target nema ID
   * @param {string} messageData.content - Message content
   * @returns {Promise<Object>} Response with nema message and neural changes
   */
  async sendMessage({ nema_id, content }) {
    return await apiClient.post('/nema/interaction', {
      nema_id,
      content
    }, {
      credentials: 'include'
    });
  }

  /**
   * Get interaction history for a nema
   * @param {number} nemaId - Nema ID
   * @param {Object} options - Query options
   * @param {number} options.cursor - Message ID to start pagination from
   * @param {number} options.limit - Number of messages to return (default: 50, max: 100)
   * @param {string} options.order - Sort order: 'asc' or 'desc' (default: desc)
   * @returns {Promise<Object>} Interaction history with messages array
   */
  async getInteractionHistory(nemaId, options = {}) {
    const { cursor, limit = 50, order = 'desc' } = options;
    const params = new URLSearchParams();
    
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit);
    params.append('order', order);

    const queryString = params.toString();
    const endpoint = `/nema/interaction/history/${nemaId}${queryString ? `?${queryString}` : ''}`;

    return await apiClient.get(endpoint, {
      credentials: 'include'
    });
  }

  /**
   * Get neural state evolution history for a nema
   * @param {number} nemaId - Nema ID
   * @param {Object} options - Query options
   * @param {number} options.cursor - State ID to start pagination from
   * @param {number} options.limit - Number of states to return (default: 10, max: 100)
   * @param {string} options.order - Sort order: 'asc' or 'desc' (default: desc)
   * @returns {Promise<Object>} State history with states array
   */
  async getStateHistory(nemaId, options = {}) {
    const { cursor, limit = 10, order = 'desc' } = options;
    const params = new URLSearchParams();
    
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit);
    params.append('order', order);

    const queryString = params.toString();
    const endpoint = `/nema/state/history/${nemaId}${queryString ? `?${queryString}` : ''}`;

    return await apiClient.get(endpoint, {
      credentials: 'include'
    });
  }
  /**
   * Get current neural state from backend
   * GET /nema/state/history/{nemaID}
   */
  async getNeuralState(nemaId) {
    if (!nemaId) {
      throw new Error('Nema ID is required to fetch neural state');
    }

    try {
      const data = await apiClient.get(`/nema/state/history/${nemaId}?limit=1&order=desc`, {
        credentials: 'include'
      });
      
      // Get the most recent state from the history
      if (!data.states || data.states.length === 0) {
        throw new Error('No neural states found for this nema');
      }

      const latestState = data.states[0];
      validateNeuralState(latestState);

      return {
        stateCount: latestState.id,
        updatedAt: new Date(latestState.updated_at),
        motorNeurons: latestState.motor_neurons,
        sensoryNeurons: latestState.sensory_neurons,
        totalNeurons: Object.keys(latestState.motor_neurons).length + Object.keys(latestState.sensory_neurons).length,
        emotionalState: latestState.emotional_state || null,
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
   * POST /nema/interaction
   */
  async sendPrompt(nemaId, message) {
    if (!nemaId) {
      throw new Error('Nema ID is required to send prompt');
    }
    
    // Validate message (500 byte limit)
    const validation = validateNemaMessage(message);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const requestBody = {
        nema_id: nemaId,
        content: message.trim(),
      };

      const data = await apiClient.post('/nema/interaction', requestBody, {
        credentials: 'include'
      });
      
      // Validate the API response structure (from README)
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid interaction response: missing data object');
      }

      if (!data.message) {
        throw new Error('Invalid interaction response: missing message');
      }
      
      // Structure response based on API documentation format
      const response = {
        message: data.message,
        timestamp: new Date(),
        success: true, // Assume success if we got a response
      };

      // Process data section if available
      if (data.data) {
        const interactionData = data.data;
        
        // Include neural state changes if available
        if (interactionData.neural_changes) {
          response.stateChanges = interactionData.neural_changes;
        }
        
        // Include current state if available for neural state updates
        if (interactionData.current_state) {
          const currentState = interactionData.current_state;
          response.neuralState = {
            stateCount: currentState.id || interactionData.state_id,
            updatedAt: new Date(currentState.updated_at || new Date()),
            motorNeurons: currentState.motor_neurons || {},
            sensoryNeurons: currentState.sensory_neurons || {},
            totalNeurons: Object.keys(currentState.motor_neurons || {}).length + 
                         Object.keys(currentState.sensory_neurons || {}).length,
          };
        }
        
        // Track if neural state changed
        if (interactionData.neural_state_changed !== undefined) {
          response.changed = interactionData.neural_state_changed;
        }
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
   * Get message history from backend
   * GET /nema/interaction/history/{nemaID}
   */
  async getHistory(nemaId, limit = 20) {
    if (!nemaId) {
      throw new Error('Nema ID is required to get history');
    }
    
    if (typeof limit !== 'number' || limit <= 0) {
      throw new Error('Limit must be a positive number');
    }

    try {
      const data = await apiClient.get(`/nema/interaction/history/${nemaId}?limit=${limit}&order=desc`, {
        credentials: 'include'
      });
      
      // Validate response structure
      if (!data || !Array.isArray(data.messages)) {
        throw new Error('Invalid history response: missing messages array');
      }

      // Convert to frontend format
      return {
        messages: data.messages.map(msg => ({
          id: msg.id,
          type: msg.kind, // Convert "kind" to "type" for frontend consistency
          content: msg.content,
          timestamp: new Date(msg.created_at),
          createdAt: msg.created_at,
          nemaId: msg.nema_id,
          neuralStateId: msg.neural_state_id,
          sequenceOrder: msg.sequence_order,
        })),
        total: data.total || data.messages.length,
        limit: data.limit || limit,
      };
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ServerError) {
        throw error;
      }
      throw new Error(`Failed to get message history: ${error.message}`);
    }
  }

  /**
   * Get neural activity summary
   */
  async getNeuralSummary(nemaId) {
    if (!nemaId) {
      throw new Error('Nema ID is required to get neural summary');
    }

    try {
      const state = await this.getNeuralState(nemaId);
      
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

  /**
   * Get gallery of all nemas in the system (public endpoint)
   * Returns up to 200 nemas sorted by interaction count
   * @returns {Promise<Object>} Gallery data with nemas array and total count
   */
  async getGallery() {
    try {
      return await apiClient.get('/nema/gallery');
    } catch (error) {
      if (error instanceof NetworkError || error instanceof ServerError) {
        throw error;
      }
      throw new Error(`Failed to fetch gallery: ${error.message}`);
    }
  }
}

// Create singleton instance
const nemaService = new NemaService();

export { NemaService, validateNeuralState, validatePromptResponse };
export default nemaService;