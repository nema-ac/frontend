import { useState, useEffect, useRef } from 'react';
import { calculateEmotions } from '../utils/emotionCalculator.js';

const CompactEmotionRadar = ({ motorNeurons, sensoryNeurons, className = '' }) => {
  const [emotions, setEmotions] = useState(null);
  const canvasRef = useRef(null);

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
    if (motorNeurons && sensoryNeurons) {
      const calculatedEmotions = calculateEmotions(motorNeurons, sensoryNeurons);
      setEmotions(calculatedEmotions);
    } else {
      // Default to 50% baseline for all emotions when no data
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
    }
  }, [motorNeurons, sensoryNeurons]);

  useEffect(() => {
    const drawCompactRadar = () => {
      const canvas = canvasRef.current;
      if (!canvas || !emotions) return;

      const ctx = canvas.getContext('2d');
      
      // Handle high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxRadius = Math.min(centerX, centerY) - 35; // More space for labels

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw grid circles
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) { // Fewer grid lines for compact version
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 3) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw axis lines and labels
      const emotionKeys = Object.keys(emotionConfig);
      emotionKeys.forEach((emotion) => {
        const config = emotionConfig[emotion];
        const angle = (config.angle * Math.PI) / 180 - Math.PI / 2;
        
        // Draw axis line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * maxRadius,
          centerY + Math.sin(angle) * maxRadius
        );
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw label
        const labelDistance = maxRadius + 20;
        const labelX = centerX + Math.cos(angle) * labelDistance;
        const labelY = centerY + Math.sin(angle) * labelDistance;

        ctx.fillStyle = '#D1D5DB';
        ctx.font = '10px Inter, Roboto, "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';
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

      // Draw subtle base gradient
      const overallGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      overallGradient.addColorStop(0, 'rgba(34, 211, 238, 0.05)');
      overallGradient.addColorStop(1, 'rgba(34, 211, 238, 0.01)');
      
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

      // Draw emotion color overlays with blending
      for (let i = 0; i < emotionPoints.length; i++) {
        const currentPoint = emotionPoints[i];
        const blendAngleRange = Math.PI / 6;
        const currentAngle = currentPoint.angle;
        
        let startAngle = currentAngle - blendAngleRange;
        let endAngle = currentAngle + blendAngleRange;
        
        if (startAngle < -Math.PI) startAngle += 2 * Math.PI;
        if (endAngle > Math.PI) endAngle -= 2 * Math.PI;
        
        const sectorGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX + Math.cos(currentAngle) * maxRadius * 0.7,
          centerY + Math.sin(currentAngle) * maxRadius * 0.7,
          maxRadius * 0.8
        );
        
        const intensity = currentPoint.intensity;
        const maxOpacity = Math.min(0.7, intensity / 100 * 0.9);
        const minOpacity = Math.min(0.3, intensity / 100 * 0.5);
        
        sectorGradient.addColorStop(0, `rgba(${hexToRgb(currentPoint.color)}, ${maxOpacity})`);
        sectorGradient.addColorStop(0.6, `rgba(${hexToRgb(currentPoint.color)}, ${minOpacity})`);
        sectorGradient.addColorStop(1, `rgba(${hexToRgb(currentPoint.color)}, 0)`);
        
        const blendRadius = maxRadius * 1.2;
        const startX = centerX + Math.cos(startAngle) * blendRadius;
        const startY = centerY + Math.sin(startAngle) * blendRadius;
        const endX = centerX + Math.cos(endAngle) * blendRadius;
        const endY = centerY + Math.sin(endAngle) * blendRadius;
        
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
      
      ctx.globalCompositeOperation = 'source-over';

      // Draw outline with gradient colors
      for (let i = 0; i < emotionPoints.length; i++) {
        const currentPoint = emotionPoints[i];
        const nextPoint = emotionPoints[(i + 1) % emotionPoints.length];
        
        const segmentGradient = ctx.createLinearGradient(
          currentPoint.x, currentPoint.y,
          nextPoint.x, nextPoint.y
        );
        
        const currentOpacity = Math.min(1, Math.max(0.4, currentPoint.intensity / 100));
        const nextOpacity = Math.min(1, Math.max(0.4, nextPoint.intensity / 100));
        
        segmentGradient.addColorStop(0, `rgba(${hexToRgb(currentPoint.color)}, ${currentOpacity})`);
        segmentGradient.addColorStop(1, `rgba(${hexToRgb(nextPoint.color)}, ${nextOpacity})`);
        
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, currentPoint.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.strokeStyle = segmentGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw small emotion points
      emotionPoints.forEach((point) => {
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    if (emotions) {
      drawCompactRadar();
    }
  }, [emotions]);

  // Helper function to convert hex to rgb values
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Always render the radar plot - it will show defaults if no data
  if (!emotions) {
    return (
      <div className={className}>
        <div className="text-gray-400 text-center text-xs">
          Loading emotions...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="w-full h-52"
      />
    </div>
  );
};

export default CompactEmotionRadar;