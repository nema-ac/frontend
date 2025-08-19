import { useMemo, useState } from 'react';
import { emotionColors, emotionNeurons, calculateEmotions, normalizeEmotions } from '../utils/emotionCalculations.js';

const EmotionalRadar = ({ neuralState, emotionRanges = null, size = 200 }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  // Calculate emotions for current state with normalization
  const currentEmotions = useMemo(() => {
    if (!neuralState) {
      return Object.keys(emotionColors).reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {});
    }
    
    const rawEmotions = calculateEmotions(neuralState);
    
    // If emotion ranges are provided, normalize based on them
    if (emotionRanges) {
      return normalizeEmotions(rawEmotions, emotionRanges);
    }
    
    // Fallback to simple normalization if no ranges provided
    const normalizedEmotions = {};
    Object.keys(rawEmotions).forEach(emotion => {
      normalizedEmotions[emotion] = Math.min(100, Math.max(0, rawEmotions[emotion] * 10));
    });
    
    return normalizedEmotions;
  }, [neuralState, emotionRanges]);

  const emotions = Object.keys(emotionColors);
  const center = size / 2;
  const maxRadius = center - 25;
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
        labelX: center + Math.cos(angle) * (maxRadius + 18),
        labelY: center + Math.sin(angle) * (maxRadius + 18),
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

  // Get neuron values for selected emotion
  const getSelectedEmotionNeurons = () => {
    if (!selectedEmotion || !neuralState) return [];
    
    const allNeurons = {
      ...neuralState.motorNeurons,
      ...neuralState.sensoryNeurons
    };
    
    const neurons = emotionNeurons[selectedEmotion] || [];
    return neurons.map(neuronName => ({
      name: neuronName,
      value: allNeurons[neuronName] || 0
    }));
  };

  return (
    <div className="flex flex-col items-center">
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

        {/* Data points with hover areas */}
        {radarPoints.map((point) => (
          <g key={`point-${point.emotion}`} className="group">
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
            {/* Invisible larger hover area */}
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="transparent"
              className="cursor-pointer"
            />
          </g>
        ))}

        {/* Abbreviated labels with hover tooltips */}
        {radarPoints.map((point) => {
          const shortLabel = point.emotion.slice(0, 3);
          return (
            <g key={`label-${point.emotion}`} className="group">
              {/* Abbreviated label */}
              <text
                x={point.labelX}
                y={point.labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-xs font-medium cursor-pointer"
                fill={point.color}
                style={{ fontSize: '10px' }}
                onClick={() => setSelectedEmotion(selectedEmotion === point.emotion ? null : point.emotion)}
              >
                {shortLabel}
              </text>
              
              {/* Hover tooltip */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {/* Tooltip background */}
                <rect
                  x={point.labelX - 40}
                  y={point.labelY - 25}
                  width="80"
                  height="32"
                  fill="#000"
                  stroke={point.color}
                  strokeWidth="1"
                  rx="4"
                  opacity="0.9"
                />
                {/* Full emotion name */}
                <text
                  x={point.labelX}
                  y={point.labelY - 12}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs font-medium capitalize"
                  fill={point.color}
                  style={{ fontSize: '10px' }}
                >
                  {point.emotion}
                </text>
                {/* Percentage */}
                <text
                  x={point.labelX}
                  y={point.labelY - 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs"
                  fill="#9ca3af"
                  style={{ fontSize: '10px' }}
                >
                  {Math.round(point.value)}%
                </text>
              </g>
            </g>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Selected Emotion Details */}
      {selectedEmotion && (
        <div className="mt-4 w-full max-w-xs">
          <div 
            className="text-xs font-semibold mb-2 capitalize"
            style={{ color: emotionColors[selectedEmotion] }}
          >
            {selectedEmotion} Neurons ({getSelectedEmotionNeurons().length})
          </div>
          <div className="bg-gray-900 rounded border border-gray-600 p-2 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {getSelectedEmotionNeurons().map((neuron, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-gray-300 truncate mr-1">{neuron.name}</span>
                  <span 
                    className={`font-mono ${neuron.value === 0 ? 'text-gray-500' : 'text-cyan-400'}`}
                  >
                    {neuron.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Click emotion again to close
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalRadar;