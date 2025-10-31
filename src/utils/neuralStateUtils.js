/**
 * Utility functions for neural state calculations and formatting
 */

/**
 * Calculate differences between two neural states
 * @param {Object} oldState - Previous neural state with motorNeurons and sensoryNeurons
 * @param {Object} newState - New neural state with motorNeurons and sensoryNeurons
 * @returns {Array} Array of change objects with neuron, type, oldValue, newValue, and delta
 */
export const calculateNeuralChanges = (oldState, newState) => {
  if (!oldState || !newState) return [];

  const changes = [];

  // Check motor neuron changes
  const allMotorNeurons = new Set([
    ...Object.keys(oldState.motorNeurons || {}),
    ...Object.keys(newState.motorNeurons || {})
  ]);

  for (const neuron of allMotorNeurons) {
    const oldValue = oldState.motorNeurons?.[neuron] || 0;
    const newValue = newState.motorNeurons?.[neuron] || 0;
    if (oldValue !== newValue) {
      changes.push({
        neuron,
        type: 'motor',
        oldValue,
        newValue,
        delta: newValue - oldValue
      });
    }
  }

  // Check sensory neuron changes
  const allSensoryNeurons = new Set([
    ...Object.keys(oldState.sensoryNeurons || {}),
    ...Object.keys(newState.sensoryNeurons || {})
  ]);

  for (const neuron of allSensoryNeurons) {
    const oldValue = oldState.sensoryNeurons?.[neuron] || 0;
    const newValue = newState.sensoryNeurons?.[neuron] || 0;
    if (oldValue !== newValue) {
      changes.push({
        neuron,
        type: 'sensory',
        oldValue,
        newValue,
        delta: newValue - oldValue
      });
    }
  }

  return changes;
};

/**
 * Format neural changes for display
 * @param {Array} changes - Array of change objects from calculateNeuralChanges
 * @param {number} limit - Maximum number of changes to display (default: 5)
 * @returns {string} Formatted string of neural changes
 */
export const formatNeuralChanges = (changes, limit = 5) => {
  if (!changes || changes.length === 0) return 'No neural changes';

  return changes
    .slice(0, limit)
    .map(change => {
      const sign = change.delta > 0 ? '+' : '';
      return `${change.neuron} ${sign}${change.delta}`;
    })
    .join(', ');
};

/**
 * Filter neurons based on search term and active-only toggle
 * @param {Object} neurons - Object with neuron names as keys and values
 * @param {string} searchTerm - Search term to filter neuron names
 * @param {boolean} showActiveOnly - Whether to show only non-zero neurons
 * @returns {Object} Filtered neurons object
 */
export const filterNeurons = (neurons, searchTerm = '', showActiveOnly = false) => {
  if (!neurons) return {};

  let filtered = { ...neurons };

  // Filter by search term
  if (searchTerm) {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  // Filter by active-only
  if (showActiveOnly) {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([, value]) => value !== 0)
    );
  }

  return filtered;
};

/**
 * Normalize a message to a standard format
 * @param {Object} message - Message object from API or local state
 * @param {Object} options - Additional options for normalization
 * @returns {Object} Normalized message object
 */
export const normalizeMessage = (message, options = {}) => {
  const {
    userUsername = 'user',
    nemaName = 'nema'
  } = options;

  // Determine message type and sender
  let type = message.type || message.kind;
  let sender = '';

  if (type === 'user') {
    sender = userUsername;
  } else if (type === 'assistant' || type === 'nema') {
    sender = nemaName;
    type = 'nema'; // Normalize to 'nema'
  } else if (type === 'system') {
    sender = 'system';
  }

  return {
    id: message.id,
    type,
    content: message.content,
    timestamp: message.timestamp || message.created_at,
    sender,
    neuralStateId: message.neural_state_id,
    neuralState: message.neuralState,
    stateChanges: message.stateChanges,
    sequenceOrder: message.sequence_order
  };
};

/**
 * Calculate neural changes for a message based on available state data
 * @param {Object} message - The message to calculate changes for
 * @param {Array} allMessages - All messages in the conversation
 * @param {Array} neuralStates - Array of neural states from API
 * @returns {Array} Array of neural changes
 */
export const getMessageNeuralChanges = (message, allMessages = [], neuralStates = []) => {
  const normalized = normalizeMessage(message);

  // Return early if not a nema message
  if (normalized.type !== 'nema') return [];

  // Priority 1: Use stateChanges from the message if available
  if (message.stateChanges && message.stateChanges.length > 0) {
    return message.stateChanges;
  }

  // Priority 2: Calculate from neuralState in message
  if (message.neuralState) {
    const messageIndex = allMessages.findIndex(m => m.id === message.id);
    if (messageIndex > 0) {
      const previousNemaMessage = allMessages
        .slice(0, messageIndex)
        .reverse()
        .find(m => {
          const normPrev = normalizeMessage(m);
          return normPrev.type === 'nema' && m.neuralState;
        });

      if (previousNemaMessage && previousNemaMessage.neuralState) {
        return calculateNeuralChanges(previousNemaMessage.neuralState, message.neuralState);
      }
    }
  }

  // Priority 3: Calculate from neural states array (for public view)
  if (message.neural_state_id && neuralStates && neuralStates.length > 0) {
    const currentState = neuralStates.find(s => s.id === message.neural_state_id);
    const messageIndex = allMessages.findIndex(m => m.id === message.id);

    if (currentState && messageIndex > 0) {
      const previousNemaMessage = allMessages
        .slice(0, messageIndex)
        .reverse()
        .find(m => {
          const normPrev = normalizeMessage(m);
          return normPrev.type === 'nema' && m.neural_state_id;
        });

      if (previousNemaMessage) {
        const previousState = neuralStates.find(s => s.id === previousNemaMessage.neural_state_id);
        if (previousState) {
          return calculateNeuralChanges(
            { motorNeurons: previousState.motor_neurons, sensoryNeurons: previousState.sensory_neurons },
            { motorNeurons: currentState.motor_neurons, sensoryNeurons: currentState.sensory_neurons }
          );
        }
      }
    }
  }

  return [];
};
