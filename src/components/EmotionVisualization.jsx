import { useState, useEffect, useMemo } from 'react';
import { emotionColors, calculateEmotions, calculateEmotionRanges, normalizeEmotions } from '../utils/emotionCalculations.js';

const EmotionVisualization = ({ neuralStates = [], timestamps = [] }) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);


  // Calculate emotion ranges across all states for normalization
  const emotionRanges = useMemo(() => {
    return calculateEmotionRanges(neuralStates);
  }, [neuralStates]);

  // Calculate emotions for current state with proper normalization
  const currentEmotions = useMemo(() => {
    if (!neuralStates.length || currentStateIndex >= neuralStates.length) {
      return Object.keys(emotionColors).reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      }, {});
    }
    
    const rawEmotions = calculateEmotions(neuralStates[currentStateIndex]);
    const normalizedEmotions = normalizeEmotions(rawEmotions, emotionRanges);

    console.log('Raw emotions:', rawEmotions);
    console.log('Emotion ranges:', emotionRanges);
    console.log('Normalized emotions:', normalizedEmotions);
    
    return normalizedEmotions;
  }, [neuralStates, currentStateIndex, emotionRanges]);

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
        <h3 className="text-xl font-bold text-cyan-400">NEMA Emotional Timeline</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-400">
            {getCurrentTimestamp()}
          </div>
          <div className="text-cyan-400">
            {neuralStates.length} states
          </div>
        </div>
      </div>

      {/* Emotion Bars - Vertical Layout */}
      <div className="flex justify-between items-end space-x-1 mb-6">
        {Object.entries(emotionColors).map(([emotion, color]) => {
          const value = currentEmotions[emotion] || 0;
          return (
            <div key={emotion} className="group flex flex-col items-center flex-1">
              {/* Bar Container */}
              <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden mb-2 h-48 border border-gray-700">
                {/* Bar */}
                <div
                  className="absolute bottom-0 w-full transition-all duration-500 ease-out"
                  style={{
                    height: `${Math.max(2, value)}%`, // Minimum 2% height for visibility
                    backgroundColor: color,
                    boxShadow: value > 0 ? `0 0 15px ${color}60` : 'none'
                  }}
                >
                  {/* Value label inside bar */}
                  {value > 15 && (
                    <div 
                      className="absolute inset-x-0 top-1 text-xs font-bold text-center"
                      style={{ color: value > 30 ? '#000' : '#fff' }}
                    >
                      {Math.round(value)}
                    </div>
                  )}
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {emotion}: {value.toFixed(1)}%
                </div>
                
                {/* Debug value display */}
                <div className="absolute top-1 left-1 text-xs text-gray-400 opacity-50">
                  {Math.round(value)}
                </div>
              </div>
              
              {/* Label */}
              <label 
                className="text-xs font-medium capitalize text-center leading-tight"
                style={{ color }}
              >
                {emotion}
              </label>
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