import { useState, useEffect, useMemo } from 'react';

const EmotionVisualization = ({ neuralStates = [], timestamps = [] }) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // Define emotion colors
  const emotionColors = {
    curiosity: '#3b82f6', // blue
    anxiety: '#ef4444', // red
    contentment: '#22c55e', // green
    excitement: '#f59e0b', // amber
    focus: '#8b5cf6', // violet
    attraction: '#ec4899', // pink
    hunger: '#f97316', // orange
    defensive: '#dc2626', // dark red
    fatigue: '#6b7280', // gray
    confusion: '#a855f7' // purple
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

  // Calculate emotions from neural state
  const calculateEmotions = (states) => {
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

    // Normalize emotions to 0-100 scale
    const normalizedEmotions = {};
    Object.keys(emotions).forEach(emotion => {
      normalizedEmotions[emotion] = Math.min(100, Math.max(0, emotions[emotion] * 10));
    });

    return normalizedEmotions;
  };

  // Calculate emotions for current state
  const currentEmotions = useMemo(() => {
    if (!neuralStates.length || currentStateIndex >= neuralStates.length) {
      return Object.keys(emotionColors).reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {});
    }
    return calculateEmotions(neuralStates[currentStateIndex]);
  }, [neuralStates, currentStateIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || neuralStates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentStateIndex(prev => {
        if (prev >= neuralStates.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, neuralStates.length, playbackSpeed]);

  // Handle timeline scrubber
  const handleTimelineChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setCurrentStateIndex(newIndex);
    setIsPlaying(false);
  };

  // Toggle playback
  const togglePlayback = () => {
    if (currentStateIndex >= neuralStates.length - 1) {
      setCurrentStateIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Format timestamp
  const getCurrentTimestamp = () => {
    if (timestamps.length > currentStateIndex) {
      return timestamps[currentStateIndex];
    }
    return `State ${currentStateIndex + 1}`;
  };

  return (
    <div className="bg-black/80 border border-cyan-400/30 rounded-lg p-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400">NEMA Emotional State</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-400">
            {getCurrentTimestamp()}
          </div>
          <div className="text-cyan-400">
            {neuralStates.length} states
          </div>
        </div>
      </div>

      {/* Emotion Bars */}
      <div className="space-y-3 mb-6">
        {Object.entries(emotionColors).map(([emotion, color]) => {
          const value = currentEmotions[emotion] || 0;
          return (
            <div key={emotion} className="group">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium capitalize" style={{ color }}>
                  {emotion}
                </label>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${value}%`,
                    backgroundColor: color,
                    boxShadow: value > 0 ? `0 0 10px ${color}40` : 'none'
                  }}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium"
                  style={{ color: value > 50 ? '#000' : color }}
                >
                  {value > 10 && `${Math.round(value)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {neuralStates.length > 1 && (
        <div className="space-y-4">
          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Timeline</span>
              <span>{currentStateIndex + 1} / {neuralStates.length}</span>
            </div>
            <input
              type="range"
              min="0"
              max={neuralStates.length - 1}
              value={currentStateIndex}
              onChange={handleTimelineChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${(currentStateIndex / (neuralStates.length - 1)) * 100}%, #374151 ${(currentStateIndex / (neuralStates.length - 1)) * 100}%, #374151 100%)`
              }}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayback}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors"
              >
                {isPlaying ? '⏸' : '▶'} {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => setCurrentStateIndex(0)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
              >
                ⏮ Reset
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <label className="text-gray-400">Speed:</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                className="bg-gray-700 text-cyan-400 rounded px-2 py-1 text-xs"
              >
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {neuralStates.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <div className="text-cyan-400 mb-2">⚡</div>
          <div>No neural states available</div>
          <div className="text-sm">Connect to NEMA to see emotional states</div>
        </div>
      )}
    </div>
  );
};

export default EmotionVisualization;