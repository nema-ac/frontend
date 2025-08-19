// Shared emotion calculation utilities

// Define emotion colors using Nema theme
export const emotionColors = {
  curiosity: '#22d3ee', // nema-cyan
  anxiety: '#ef4444', // red (kept for contrast)
  contentment: '#22c55e', // nema-green
  excitement: '#fb923c', // nema-orange
  focus: '#a855f7', // nema-purple
  attraction: '#ec4899', // pink
  hunger: '#f59e0b', // amber
  defensive: '#dc2626', // dark red
  fatigue: '#6b7280', // nema-gray-500
  confusion: '#9659D4' // cyber-purple
};

// Define neurons used in each emotion calculation
export const emotionNeurons = {
  curiosity: ['N_AWAL', 'N_AWAR', 'N_AWCL', 'N_AWCR', 'N_ASEL', 'N_ASER', 'N_AFDL', 'N_AFDR', 'N_AQR', 'N_PQR', 'N_URXL', 'N_URXR'],
  anxiety: ['N_ASHL', 'N_ASHR', 'N_AVBL', 'N_AVBR', 'N_RIML', 'N_RIMR', 'N_RIVL', 'N_RIVR', 'N_OLQDL', 'N_OLQDR', 'N_OLQVL', 'N_OLQVR'],
  contentment: ['N_NSML', 'N_NSMR', 'N_ADFL', 'N_ADFR', 'N_I1L', 'N_I1R', 'N_I2L', 'N_I2R', 'N_RIBL', 'N_RIBR'],
  excitement: ['N_AVAL', 'N_AVAR', 'N_RMGL', 'N_RMGR', 'N_MVL01', 'N_MVL02', 'N_MVR01', 'N_MVR02', 'N_RIAL', 'N_RIAR', 'N_URADL', 'N_URADR', 'N_URAVL', 'N_URAVR'],
  focus: ['N_AIYL', 'N_AIYR', 'N_AIZL', 'N_AIZR', 'N_AIAL', 'N_AIAR', 'N_AIBL', 'N_AIBR', 'N_RIS'],
  attraction: ['N_ASIL', 'N_ASIR', 'N_ASJL', 'N_ASJR', 'N_ASKL', 'N_ASKR', 'N_HSNL', 'N_HSNR', 'N_MVULVA', 'N_VC1', 'N_VC2', 'N_VC3', 'N_VC4', 'N_VC5', 'N_VC6'],
  hunger: ['N_AWAL', 'N_AWAR', 'N_AWBL', 'N_AWBR', 'N_ADEL', 'N_ADER', 'N_M1', 'N_M2L', 'N_M2R', 'N_M3L', 'N_M3R'],
  defensive: ['N_ASHL', 'N_ASHR', 'N_FLPL', 'N_FLPR', 'N_PDEL', 'N_PDER', 'N_PHAL', 'N_PHAR', 'N_LUAL', 'N_LUAR', 'N_DD1', 'N_DD2', 'N_DD3'],
  fatigue: ['N_CEPVL', 'N_CEPVR', 'N_RIS', 'N_RID'],
  confusion: ['N_AVAL', 'N_AVAR', 'N_AVBL', 'N_AVBR']
};

// Helper functions for emotion calculations
const avg = (neurons, states) => {
  const values = neurons.map(n => states[n] || 0).filter(v => v !== 0);
  return values.length ? values.reduce((a, b) => a + Math.abs(b), 0) / values.length : 0;
};

const variance = (neurons, states) => {
  const values = neurons.map(n => states[n] || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / 50; // Normalize
};

const oscillationRate = (neurons, states) => {
  // Simple oscillation detection based on value variance
  return variance(neurons, states);
};

// Calculate raw emotions from neural state
export const calculateEmotions = (states) => {
  if (!states || Object.keys(states).length === 0) {
    return Object.keys(emotionColors).reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {});
  }

  // Combine motor and sensory neurons into a single state object
  const allNeurons = {
    ...states.motorNeurons,
    ...states.sensoryNeurons
  };

  // Motor activity calculation
  const motorNeurons = ['MVL01', 'MVL02', 'MVR01', 'MVR02', 'MDL01', 'MDL02', 'MDR01', 'MDR02'];
  const motorActivity = avg(motorNeurons, allNeurons);

  // Consistency score (simplified)
  const consistencyScore = 1 - variance(Object.keys(allNeurons).slice(0, 20), allNeurons);

  const emotions = {
    // Exploration & Curiosity
    curiosity: avg([
      'N_AWAL', 'N_AWAR', // Head movement
      'N_AWCL', 'N_AWCR', // Volatile odor sensing
      'N_ASEL', 'N_ASER', // Water soluble chemosensation
      'N_AFDL', 'N_AFDR', // Thermosensation
      'N_AQR', 'N_PQR', 'N_URXL', 'N_URXR' // Oxygen sensing
    ], allNeurons),

    // Anxiety & Avoidance
    anxiety: avg([
      'N_ASHL', 'N_ASHR', // Nociception/harsh touch
      'N_AVBL', 'N_AVBR', // Backward command
      'N_RIML', 'N_RIMR', // Reversal interneurons
      'N_RIVL', 'N_RIVR', // Reversal interneurons
      'N_OLQDL', 'N_OLQDR', 'N_OLQVL', 'N_OLQVR' // Nose touch (collision)
    ], allNeurons),

    // Contentment & Satiation
    contentment: avg([
      'N_NSML', 'N_NSMR', // Serotonin signaling
      'N_ADFL', 'N_ADFR', // Food sensing
      'N_I1L', 'N_I1R', 'N_I2L', 'N_I2R', // Pharyngeal neurons (feeding)
      'N_RIBL', 'N_RIBR' // Rest state interneurons
    ], allNeurons) * (1 - motorActivity / 100), // Lower when moving a lot

    // Excitement & Arousal
    excitement: avg([
      'N_AVAL', 'N_AVAR', // Forward command (high values)
      'N_RMGL', 'N_RMGR', // Gap junction hubs
      'N_MVL01', 'N_MVL02', 'N_MVR01', 'N_MVR02', // Head motors
      'N_RIAL', 'N_RIAR', // Ring interneurons
      'N_URADL', 'N_URADR', 'N_URAVL', 'N_URAVR' // Ring/motor control
    ], allNeurons),

    // Focus & Decision-Making
    focus: avg([
      'N_AIYL', 'N_AIYR', // Integration/decision
      'N_AIZL', 'N_AIZR', // Integration/decision  
      'N_AIAL', 'N_AIAR', // Interneurons
      'N_AIBL', 'N_AIBR', // Interneurons
      'N_RIS' // Sleep/wake regulation
    ], allNeurons) * Math.max(0, consistencyScore), // Higher when patterns are stable

    // Social/Mating Interest
    attraction: avg([
      'N_ASIL', 'N_ASIR', // Pheromone sensing
      'N_ASJL', 'N_ASJR', // Pheromone sensing
      'N_ASKL', 'N_ASKR', // Pheromone sensing
      'N_HSNL', 'N_HSNR', // Egg-laying circuit
      'N_MVULVA', // Vulval muscles
      'N_VC1', 'N_VC2', 'N_VC3', 'N_VC4', 'N_VC5', 'N_VC6' // Vulval control
    ], allNeurons),

    // Hunger & Foraging
    hunger: avg([
      'N_AWAL', 'N_AWAR', // Searching behavior
      'N_AWBL', 'N_AWBR', // Odor seeking
      'N_ADEL', 'N_ADER', // Food sensing
      'N_M1', 'N_M2L', 'N_M2R', 'N_M3L', 'N_M3R', // Pharyngeal motors
    ], allNeurons) * (1 - avg(['N_NSML', 'N_NSMR'], allNeurons) / 100), // Inverse of satiation

    // Defensive/Aggressive
    defensive: avg([
      'N_ASHL', 'N_ASHR', // Harsh stimuli
      'N_FLPL', 'N_FLPR', // Harsh touch
      'N_PDEL', 'N_PDER', 'N_PHAL', 'N_PHAR', // Tail neurons
      'N_LUAL', 'N_LUAR', // Head withdrawal
    ], allNeurons) + Math.abs(avg(['N_DD1', 'N_DD2', 'N_DD3'], allNeurons)), // D-type inhibitory

    // Fatigue/Rest
    fatigue: (
      Math.max(0, -avg(['N_CEPVL', 'N_CEPVR'], allNeurons)) + // Negative values
      Math.max(0, -avg(['N_RIS', 'N_RID'], allNeurons)) + // Sleep circuits
      (1 - motorActivity / 100)
    ) / 3,

    // Confusion/Disorientation  
    confusion: 
      variance(['N_AVAL', 'N_AVAR', 'N_AVBL', 'N_AVBR'], allNeurons) + // Mixed commands
      oscillationRate(motorNeurons, allNeurons) // Unstable motor patterns
  };

  return emotions;
};

// Calculate emotion ranges across all neural states
export const calculateEmotionRanges = (neuralStates) => {
  if (!neuralStates.length) return {};
  
  const ranges = Object.keys(emotionColors).reduce((acc, emotion) => {
    acc[emotion] = { min: Infinity, max: -Infinity };
    return acc;
  }, {});

  // First pass: find ranges across all states
  neuralStates.forEach(state => {
    const emotions = calculateEmotions(state);
    Object.keys(emotions).forEach(emotion => {
      ranges[emotion].min = Math.min(ranges[emotion].min, emotions[emotion]);
      ranges[emotion].max = Math.max(ranges[emotion].max, emotions[emotion]);
    });
  });

  return ranges;
};

// Normalize emotions using calculated ranges
export const normalizeEmotions = (rawEmotions, emotionRanges) => {
  const normalizedEmotions = {};
  
  Object.keys(rawEmotions).forEach(emotion => {
    const { min, max } = emotionRanges[emotion] || { min: 0, max: 1 };
    if (max === min) {
      // If all values are the same, set to 50% (middle value)
      normalizedEmotions[emotion] = 50;
    } else {
      normalizedEmotions[emotion] = ((rawEmotions[emotion] - min) / (max - min)) * 100;
    }
  });

  return normalizedEmotions;
};