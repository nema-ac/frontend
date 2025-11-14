/**
 * Emotion calculation utilities based on C. elegans connectome mapping
 * to Plutchik's 8 primary emotions
 */

/**
 * Calculate joy intensity from neuron values
 */
export const calculateJoy = (motorNeurons, sensoryNeurons) => {
  const neurons = {
    AWC: (sensoryNeurons.N_AWCL || 0) + (sensoryNeurons.N_AWCR || 0),
    AVBL: sensoryNeurons.N_AVBL || 0,
    AVBR: sensoryNeurons.N_AVBR || 0,
    AIAL: sensoryNeurons.N_AIAL || 0,
    AIAR: sensoryNeurons.N_AIAR || 0,
    ASEL: sensoryNeurons.N_ASEL || 0,
    ASER: sensoryNeurons.N_ASER || 0
  };
  
  const sum = Object.values(neurons).reduce((acc, val) => acc + Math.max(0, val), 0);
  return Math.min(100, sum / 7);
};

/**
 * Calculate sadness intensity from neuron values
 */
export const calculateSadness = (motorNeurons, sensoryNeurons) => {
  const neurons = {
    RIPL: sensoryNeurons.N_RIPL || 0,
    RIPR: sensoryNeurons.N_RIPR || 0,
    RIR: sensoryNeurons.N_RIR || 0,
    RIS: sensoryNeurons.N_RIS || 0,
    SABVL: sensoryNeurons.N_SABVL || 0,
    SABVR: sensoryNeurons.N_SABVR || 0,
    SMBVL: sensoryNeurons.N_SMBVL || 0,
    SMBVR: sensoryNeurons.N_SMBVR || 0
  };
  
  const sum = Object.values(neurons).reduce((acc, val) => acc + Math.abs(Math.min(0, val)), 0);
  return Math.min(100, sum / 8);
};

/**
 * Calculate anger intensity from neuron values
 */
export const calculateAnger = (motorNeurons, sensoryNeurons) => {
  const ashValue = Math.abs((sensoryNeurons.N_ASHL || 0) + (sensoryNeurons.N_ASHR || 0));
  const avaValue = Math.abs((sensoryNeurons.N_AVAL || 0) + (sensoryNeurons.N_AVAR || 0));
  
  // DA neurons average (motor activity)
  const daAvg = ['N_DA1', 'N_DA2', 'N_DA3', 'N_DA4', 'N_DA5', 'N_DA6', 'N_DA7', 'N_DA8', 'N_DA9']
    .reduce((sum, neuron) => sum + Math.abs(sensoryNeurons[neuron] || 0), 0) / 9;
  
  const rmdValue = Math.abs((sensoryNeurons.N_RMDDL || 0) + (sensoryNeurons.N_RMDDR || 0));
  
  const avg = (ashValue + avaValue + daAvg + rmdValue) / 4;
  return Math.min(100, avg);
};

/**
 * Calculate fear intensity from neuron values
 */
export const calculateFear = (motorNeurons, sensoryNeurons) => {
  const ashValue = (sensoryNeurons.N_ASHL || 0) + (sensoryNeurons.N_ASHR || 0);
  const avaValue = (sensoryNeurons.N_AVAL || 0) + (sensoryNeurons.N_AVAR || 0);
  const cepValue = (sensoryNeurons.N_CEPVL || 0) + (sensoryNeurons.N_CEPVR || 0);
  
  // Escape pattern strength (variance in DA/DB series)
  const daValues = ['N_DA1', 'N_DA2', 'N_DA3', 'N_DA4', 'N_DA5', 'N_DA6', 'N_DA7', 'N_DA8', 'N_DA9']
    .map(neuron => sensoryNeurons[neuron] || 0);
  const dbValues = ['N_DB1', 'N_DB2', 'N_DB3', 'N_DB4', 'N_DB5', 'N_DB6', 'N_DB7']
    .map(neuron => sensoryNeurons[neuron] || 0);
  
  const allMotorValues = [...daValues, ...dbValues];
  const motorMean = allMotorValues.reduce((sum, val) => sum + val, 0) / allMotorValues.length;
  const motorVariance = allMotorValues.reduce((sum, val) => sum + Math.pow(val - motorMean, 2), 0) / allMotorValues.length;
  
  const avg = (Math.max(0, ashValue) + Math.max(0, avaValue) + Math.sqrt(motorVariance) + Math.abs(cepValue)) / 4;
  return Math.min(100, avg);
};

/**
 * Calculate disgust intensity from neuron values
 */
export const calculateDisgust = (motorNeurons, sensoryNeurons) => {
  const awbValue = Math.abs((sensoryNeurons.N_AWBL || 0) + (sensoryNeurons.N_AWBR || 0));
  const awcNegative = Math.abs(Math.min(0, (sensoryNeurons.N_AWCL || 0) + (sensoryNeurons.N_AWCR || 0)));
  const ashModerate = Math.abs(Math.min(0, (sensoryNeurons.N_ASHL || 0) + (sensoryNeurons.N_ASHR || 0)) * 0.5);
  const rigValue = Math.abs((sensoryNeurons.N_RIGL || 0) + (sensoryNeurons.N_RIGR || 0));
  
  const avg = (awbValue + awcNegative + ashModerate + rigValue) / 4;
  return Math.min(100, avg);
};

/**
 * Calculate surprise intensity from neuron values
 */
export const calculateSurprise = (motorNeurons, sensoryNeurons, previousState = null) => {
  const aiaValue = Math.abs((sensoryNeurons.N_AIAL || 0) + (sensoryNeurons.N_AIAR || 0));
  const riaValue = Math.abs((sensoryNeurons.N_RIAL || 0) + (sensoryNeurons.N_RIAR || 0));
  const ribValue = Math.abs((sensoryNeurons.N_RIBL || 0) + (sensoryNeurons.N_RIBR || 0));
  
  // Calculate sudden change magnitude if previous state available
  let suddenChange = 0;
  if (previousState) {
    const currentValues = [...Object.values(motorNeurons), ...Object.values(sensoryNeurons)];
    const previousValues = [...Object.values(previousState.motorNeurons), ...Object.values(previousState.sensoryNeurons)];
    
    suddenChange = currentValues.reduce((sum, current, index) => {
      const previous = previousValues[index] || 0;
      return sum + Math.abs(current - previous);
    }, 0) / currentValues.length;
  }
  
  const avg = (suddenChange + aiaValue + riaValue + ribValue) / 4;
  return Math.min(100, avg);
};

/**
 * Calculate anticipation intensity from neuron values
 */
export const calculateAnticipation = (motorNeurons, sensoryNeurons) => {
  const aiyValue = Math.max(0, (sensoryNeurons.N_AIYL || 0) + (sensoryNeurons.N_AIYR || 0));
  const avbValue = Math.max(0, (sensoryNeurons.N_AVBL || 0) + (sensoryNeurons.N_AVBR || 0));
  const riaValue = Math.max(0, (sensoryNeurons.N_RIAL || 0) + (sensoryNeurons.N_RIAR || 0));
  
  // Chemotaxis strength (coordinated AWC/ASE activity)
  const awcValue = Math.max(0, (sensoryNeurons.N_AWCL || 0) + (sensoryNeurons.N_AWCR || 0));
  const aseValue = Math.max(0, (sensoryNeurons.N_ASEL || 0) + (sensoryNeurons.N_ASER || 0));
  const chemotaxis = Math.min(awcValue, aseValue);
  
  const avg = (aiyValue + avbValue + riaValue + chemotaxis) / 4;
  return Math.min(100, avg);
};

/**
 * Calculate trust intensity from neuron values
 */
export const calculateTrust = (motorNeurons, sensoryNeurons) => {
  // Calculate system stability (low variance across major neuron groups)
  const allValues = [...Object.values(motorNeurons), ...Object.values(sensoryNeurons)];
  const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
  const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
  const stability = Math.max(0, 50 - Math.sqrt(variance) / 5);
  
  // Moderate positive in sensory
  const sensoryValues = Object.values(sensoryNeurons);
  const positiveCount = sensoryValues.filter(val => val > 0 && val < 50).length;
  const moderatePositive = (positiveCount / sensoryValues.length) * 50;
  
  // Motor balance (no strong approach/escape conflict)
  const motorValues = Object.values(motorNeurons);
  const motorRange = motorValues.length > 0 ? Math.max(...motorValues) - Math.min(...motorValues) : 0;
  const motorBalance = Math.max(0, 50 - (motorRange / 4));
  
  const safetyScore = (stability + moderatePositive + motorBalance) / 3;
  return Math.min(100, safetyScore);
};

/**
 * Fallback calculation based on statistical patterns when specific neurons aren't found
 */
export const calculateEmotionsStatistical = (motorNeurons, sensoryNeurons) => {
  const allMotorValues = Object.values(motorNeurons);
  const allSensoryValues = Object.values(sensoryNeurons);
  const allValues = [...allMotorValues, ...allSensoryValues];
  
  // Statistical measures
  const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
  const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
  const stdDev = Math.sqrt(variance);
  
  const positiveValues = allValues.filter(v => v > 0);
  const negativeValues = allValues.filter(v => v < 0);
  const highValues = allValues.filter(v => Math.abs(v) > 50);
  
  const positiveRatio = positiveValues.length / allValues.length;
  const negativeRatio = negativeValues.length / allValues.length;
  const highActivityRatio = highValues.length / allValues.length;
  
  return {
    joy: Math.min(100, Math.max(0, (positiveRatio * 100) + (mean > 0 ? mean * 0.5 : 0))),
    sadness: Math.min(100, Math.max(0, (negativeRatio * 80) + (mean < 0 ? Math.abs(mean) * 0.5 : 0))),
    anger: Math.min(100, Math.max(0, (highActivityRatio * 70) + (stdDev * 0.3))),
    fear: Math.min(100, Math.max(0, (stdDev * 0.4) + (negativeValues.filter(v => v < -30).length / allValues.length * 60))),
    disgust: Math.min(100, Math.max(0, negativeValues.filter(v => v > -30 && v < -10).length / allValues.length * 80)),
    surprise: Math.min(100, Math.max(0, stdDev * 0.6)),
    anticipation: Math.min(100, Math.max(0, positiveValues.filter(v => v > 10 && v < 40).length / allValues.length * 70)),
    trust: Math.min(100, Math.max(0, 60 - (stdDev * 0.4) + (Math.abs(mean) < 10 ? 20 : 0)))
  };
};

/**
 * Calculate all emotions from neural state
 */
export const calculateEmotions = (motorNeurons, sensoryNeurons, previousState = null) => {
  // Try specific neuron mapping first
  const specificEmotions = {
    joy: calculateJoy(motorNeurons, sensoryNeurons),
    sadness: calculateSadness(motorNeurons, sensoryNeurons),
    anger: calculateAnger(motorNeurons, sensoryNeurons),
    fear: calculateFear(motorNeurons, sensoryNeurons),
    disgust: calculateDisgust(motorNeurons, sensoryNeurons),
    surprise: calculateSurprise(motorNeurons, sensoryNeurons, previousState),
    anticipation: calculateAnticipation(motorNeurons, sensoryNeurons),
    trust: calculateTrust(motorNeurons, sensoryNeurons)
  };
  
  // Check if we got any meaningful values (not all zeros)
  const hasValidData = Object.values(specificEmotions).some(val => val > 1);
  
  if (!hasValidData) {
    console.log('Specific neuron mapping failed, using statistical fallback');
    return calculateEmotionsStatistical(motorNeurons, sensoryNeurons);
  }
  
  return specificEmotions;
};

/**
 * Get the dominant emotion
 */
export const getDominantEmotion = (emotions) => {
  const entries = Object.entries(emotions);
  const [emotion, intensity] = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  return { emotion, intensity };
};

/**
 * Calculate secondary emotions (combinations)
 */
export const calculateSecondaryEmotions = (emotions) => {
  return {
    love: (emotions.joy + emotions.trust) / 2,
    guilt: Math.sqrt(emotions.fear * emotions.joy),
    shame: (emotions.fear + emotions.disgust) / 2,
    pride: Math.sqrt(emotions.anger * emotions.joy)
  };
};