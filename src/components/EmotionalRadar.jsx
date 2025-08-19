import { useMemo } from 'react';

const EmotionalRadar = ({ neuralState, size = 260 }) => {
  // Define emotion colors using Nema theme
  const emotionColors = {
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
    if (!neuralState) {
      return Object.keys(emotionColors).reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {});
    }
    return calculateEmotions(neuralState);
  }, [neuralState]);

  const emotions = Object.keys(emotionColors);
  const center = size / 2;
  const maxRadius = center - 40;
  const levels = 4; // Number of concentric circles

  // Calculate points for each emotion on the radar
  const getRadarPoints = () => {
    return emotions.map((emotion, index) => {
      const angle = (index * 2 * Math.PI) / emotions.length - Math.PI / 2; // Start from top
      const value = currentEmotions[emotion] || 0;
      const radius = (value / 100) * maxRadius;
      
      return {
        emotion,
        angle,
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        labelX: center + Math.cos(angle) * (maxRadius + 25),
        labelY: center + Math.sin(angle) * (maxRadius + 25),
        value,
        color: emotionColors[emotion]
      };
    });
  };

  const radarPoints = getRadarPoints();

  // Create path string for the filled area
  const pathString = radarPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ') + ' Z';

  return (
    <div className="flex justify-center items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {Array.from({ length: levels }, (_, i) => (
          <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={(maxRadius * (i + 1)) / levels}
            fill="none"
            stroke="#374151"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}

        {/* Grid lines from center to each emotion axis */}
        {emotions.map((emotion, index) => {
          const angle = (index * 2 * Math.PI) / emotions.length - Math.PI / 2;
          const endX = center + Math.cos(angle) * maxRadius;
          const endY = center + Math.sin(angle) * maxRadius;
          
          return (
            <line
              key={`axis-${emotion}`}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="#374151"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {/* Filled area */}
        <path
          d={pathString}
          fill="url(#radarGradient)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          opacity="0.6"
          className="transition-all duration-300 ease-out"
        />

        {/* Data points */}
        {radarPoints.map((point) => (
          <g key={`point-${point.emotion}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill={point.color}
              stroke="#000"
              strokeWidth="0.5"
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 3px ${point.color})`
              }}
            />
          </g>
        ))}

        {/* Labels with full names and percentages */}
        {radarPoints.map((point) => (
          <g key={`label-${point.emotion}`}>
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-xs font-medium capitalize"
              fill={point.color}
            >
              {point.emotion}
            </text>
            <text
              x={point.labelX}
              y={point.labelY + 12}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-xs"
              fill="#9ca3af"
            >
              {Math.round(point.value)}%
            </text>
          </g>
        ))}

        {/* Gradient definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default EmotionalRadar;