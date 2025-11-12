import { useState, useEffect, useRef } from 'react';
import { calculateEmotions, getDominantEmotion } from '../utils/emotionCalculator.js';
import nemaService from '../services/nema.js';

const EmotionRadarPlot = ({ nemaId, className = '' }) => {
  const [emotions, setEmotions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [hoveredEmotion, setHoveredEmotion] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const emotionConfig = {
    joy: { color: '#FFD700', angle: 0, label: 'Joy' },
    anticipation: { color: '#9ACD32', angle: 45, label: 'Anticipation' },
    trust: { color: '#4169E1', angle: 90, label: 'Trust' },
    surprise: { color: '#8A2BE2', angle: 135, label: 'Surprise' },
    sadness: { color: '#6495ED', angle: 180, label: 'Sadness' },
    disgust: { color: '#32CD32', angle: 225, label: 'Disgust' },
    anger: { color: '#DC143C', angle: 270, label: 'Anger' },
    fear: { color: '#FF6347', angle: 315, label: 'Fear' }
  };

  useEffect(() => {
    const fetchEmotionalState = async () => {
      setLoading(true);
      setError('');
      
      try {
        const stateHistory = await nemaService.getStateHistory(nemaId, { limit: 1, order: 'desc' });
        
        if (!stateHistory.states || stateHistory.states.length === 0) {
          setError('No neural state data available');
          return;
        }

        const latestState = stateHistory.states[0];
        const calculatedEmotions = calculateEmotions(
          latestState.motor_neurons,
          latestState.sensory_neurons
        );

        setEmotions(calculatedEmotions);
        setDominantEmotion(getDominantEmotion(calculatedEmotions));
      } catch (err) {
        setError('Failed to load emotional state: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (nemaId) {
      fetchEmotionalState();
    }
  }, [nemaId]);

  // Handle mouse movement for hover detection
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !emotions) return;

    const rect = canvas.getBoundingClientRect();
    
    // Use CSS dimensions for mouse calculations (not canvas internal dimensions)
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if mouse is near any emotion point
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60; // Match drawing margin
    
    let hoveredEmotionFound = null;
    
    Object.keys(emotionConfig).forEach((emotion) => {
      const config = emotionConfig[emotion];
      const intensity = emotions[emotion];
      const angle = (config.angle * Math.PI) / 180 - Math.PI / 2;
      const radius = (intensity / 100) * maxRadius;
      
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;
      
      // Check if mouse is within hover radius of the point
      const distance = Math.sqrt(Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2));
      if (distance <= 15) { // 15px hover radius
        hoveredEmotionFound = {
          emotion,
          intensity,
          label: config.label,
          color: config.color
        };
      }
    });

    setHoveredEmotion(hoveredEmotionFound);
    
    // Update mouse position relative to the container for tooltip positioning
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredEmotion(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.style.cursor = 'crosshair';
      
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [emotions]);

  useEffect(() => {
    const drawRadarPlot = () => {
      const canvas = canvasRef.current;
      if (!canvas || !emotions) return;

      const ctx = canvas.getContext('2d');
      
      // Handle high-DPI displays for crisp text
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas size for high-DPI
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr);
      
      // Use CSS dimensions for calculations
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxRadius = Math.max(Math.min(centerX, centerY) - 60, 10); // Increased margin for labels, minimum 10px

      // Don't draw if canvas is too small
      if (maxRadius <= 10 || rect.width < 100 || rect.height < 100) {
        return;
      }

      // Clear canvas - transparent background
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw clean grid circles
      ctx.shadowBlur = 0; // No shadow effects
      ctx.strokeStyle = '#374151'; // Clean gray lines
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw axis lines and labels
      const emotionKeys = Object.keys(emotionConfig);
      emotionKeys.forEach((emotion) => {
        const config = emotionConfig[emotion];
        const angle = (config.angle * Math.PI) / 180 - Math.PI / 2;
        
        // Draw clean axis line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * maxRadius,
          centerY + Math.sin(angle) * maxRadius
        );
        ctx.strokeStyle = '#4B5563'; // Clean gray
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw label
        const labelDistance = maxRadius + 30;
        const labelX = centerX + Math.cos(angle) * labelDistance;
        const labelY = centerY + Math.sin(angle) * labelDistance;

        // Draw clean label text
        ctx.fillStyle = '#D1D5DB'; // Clean light gray text
        ctx.font = 'bold 12px Inter, Roboto, "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.label, labelX, labelY);
      });

      // Create emotion points
      const emotionPoints = emotionKeys.map((emotion) => {
        const config = emotionConfig[emotion];
        const intensity = emotions[emotion];
        const angle = (config.angle * Math.PI) / 180 - Math.PI / 2;
        const radius = (intensity / 100) * maxRadius;
        
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          color: config.color,
          intensity,
          angle
        };
      });

      // Create a very subtle base gradient
      const overallGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      overallGradient.addColorStop(0, 'rgba(34, 211, 238, 0.05)'); // Very subtle cyan center
      overallGradient.addColorStop(1, 'rgba(34, 211, 238, 0.01)'); // Almost transparent edge
      
      // Draw base gradient
      ctx.beginPath();
      emotionPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.fillStyle = overallGradient;
      ctx.fill();
      
      // Now add emotion-specific color overlays with heavy blending
      for (let i = 0; i < emotionPoints.length; i++) {
        const currentPoint = emotionPoints[i];
        const nextPoint = emotionPoints[(i + 1) % emotionPoints.length];
        const prevPoint = emotionPoints[(i - 1 + emotionPoints.length) % emotionPoints.length];
        
        // Create a wider sector that overlaps with neighbors for better blending
        const blendAngleRange = Math.PI / 6; // 30 degrees of blending on each side
        const currentAngle = currentPoint.angle;
        const prevAngle = prevPoint.angle;
        const nextAngle = nextPoint.angle;
        
        // Calculate blended start and end angles
        let startAngle = currentAngle - blendAngleRange;
        let endAngle = currentAngle + blendAngleRange;
        
        // Handle wraparound
        if (startAngle < -Math.PI) startAngle += 2 * Math.PI;
        if (endAngle > Math.PI) endAngle -= 2 * Math.PI;
        
        // Create gradient that fades out towards the edges
        const sectorGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX + Math.cos(currentAngle) * maxRadius * 0.7,
          centerY + Math.sin(currentAngle) * maxRadius * 0.7,
          maxRadius * 0.8
        );
        
        const intensity = currentPoint.intensity;
        const maxOpacity = Math.min(0.9, intensity / 100 * 1.2); // Higher max opacity
        const minOpacity = Math.min(0.4, intensity / 100 * 0.6); // Higher min opacity
        
        sectorGradient.addColorStop(0, hexToRgba(currentPoint.color, maxOpacity));
        sectorGradient.addColorStop(0.6, hexToRgba(currentPoint.color, minOpacity));
        sectorGradient.addColorStop(1, hexToRgba(currentPoint.color, 0));
        
        // Create a more organic, overlapping shape
        const blendRadius = maxRadius * 1.2; // Extend beyond plot for better blending
        const startX = centerX + Math.cos(startAngle) * blendRadius;
        const startY = centerY + Math.sin(startAngle) * blendRadius;
        const endX = centerX + Math.cos(endAngle) * blendRadius;
        const endY = centerY + Math.sin(endAngle) * blendRadius;
        
        // Use soft blending mode
        ctx.globalCompositeOperation = 'multiply';
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(startX, startY);
        ctx.arc(centerX, centerY, blendRadius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        ctx.fillStyle = sectorGradient;
        ctx.fill();
      }
      
      // Reset blend mode
      ctx.globalCompositeOperation = 'source-over';

      // Draw the connecting outline with gradient colors
      for (let i = 0; i < emotionPoints.length; i++) {
        const currentPoint = emotionPoints[i];
        const nextPoint = emotionPoints[(i + 1) % emotionPoints.length];
        
        // Create gradient between current and next emotion points
        const segmentGradient = ctx.createLinearGradient(
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        const currentOpacity = Math.min(1, Math.max(0.4, currentPoint.intensity / 100));
        const nextOpacity = Math.min(1, Math.max(0.4, nextPoint.intensity / 100));
        
        segmentGradient.addColorStop(0, hexToRgba(currentPoint.color, currentOpacity));
        segmentGradient.addColorStop(1, hexToRgba(nextPoint.color, nextOpacity));
        
        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, currentPoint.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.strokeStyle = segmentGradient;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw intensity points on top
      emotionPoints.forEach((point) => {
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add white border to make points stand out
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

    };

    if (emotions) {
      drawRadarPlot();
    }
  }, [emotions, dominantEmotion]);

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const fetchEmotionalState = async () => {
    setLoading(true);
    setError('');
    
    try {
      const stateHistory = await nemaService.getStateHistory(nemaId, { limit: 1, order: 'desc' });
      

      if (stateHistory.states && stateHistory.states.length > 0) {
        const latestState = stateHistory.states[0];
        
        const calculatedEmotions = calculateEmotions(
          latestState.motor_neurons,
          latestState.sensory_neurons
        );

        setEmotions(calculatedEmotions);
        setDominantEmotion(getDominantEmotion(calculatedEmotions));
      } else {
        // Default to 50% baseline for all emotions when no history
        const defaultEmotions = {
          joy: 50,
          anticipation: 50,
          trust: 50,
          surprise: 50,
          sadness: 50,
          disgust: 50,
          anger: 50,
          fear: 50
        };
        setEmotions(defaultEmotions);
        setDominantEmotion(getDominantEmotion(defaultEmotions));
      }
    } catch (err) {
      setError('Failed to load emotional state: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLabel = (intensity) => {
    if (intensity < 20) return 'Minimal';
    if (intensity < 40) return 'Low';
    if (intensity < 60) return 'Moderate';
    if (intensity < 80) return 'High';
    return 'Intense';
  };

  if (loading) {
    return (
      <div className={`bg-gray-800/50 border border-gray-600 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800/50 border border-gray-600 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-cyan-400 mb-4">Emotional State</h3>
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  if (!emotions) {
    return (
      <div className={`bg-gray-800/50 border border-gray-600 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-cyan-400 mb-4">Emotional State</h3>
        <div className="text-gray-400 text-center">No emotional data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-600 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-cyan-400 mb-4">Emotional State</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Radar Plot */}
        <div className="flex-1 relative" ref={containerRef}>
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-full max-w-80 mx-auto"
          />
          
          {/* Tooltip */}
          {hoveredEmotion && (
            <div
              className="absolute z-10 bg-gray-900 border border-gray-600 rounded-lg p-3 pointer-events-none shadow-lg"
              style={{
                left: mousePosition.x + 15,
                top: mousePosition.y - 10,
                transform: mousePosition.x > 200 ? 'translateX(-100%)' : 'none'
              }}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: hoveredEmotion.color }}
                />
                <span className="text-white font-medium text-sm">
                  {hoveredEmotion.label}
                </span>
              </div>
              <div className="text-gray-300 text-xs">
                Intensity: <span className="text-cyan-400 font-medium">
                  {Math.round(hoveredEmotion.intensity)}%
                </span>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {getIntensityLabel(hoveredEmotion.intensity)}
              </div>
            </div>
          )}
        </div>

        {/* Emotion Details */}
        <div className="flex-1">
          <div className="rounded-lg p-4">
            <h4 className="text-gray-300 font-medium mb-3">Emotions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(emotions)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, intensity]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: emotionConfig[emotion].color }}
                      />
                      <span className="text-gray-300 capitalize text-sm">{emotion}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${intensity}%`,
                            backgroundColor: emotionConfig[emotion].color
                          }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-8 text-right">
                        {Math.round(intensity)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionRadarPlot;