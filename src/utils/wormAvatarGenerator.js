/**
 * Procedural Worm Avatar Generator for Nema
 * Generates unique pixel art C. elegans-inspired worm avatars
 */

// Seeded random number generator for deterministic results
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  range(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  chance(probability) {
    return this.next() < probability;
  }
}

// Generate hash code from string (wallet address)
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Nema color palette
const NEMA_COLORS = {
  primary: ['#00BCD4', '#0891B2', '#0E7490', '#164E63'],
  accent: ['#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE'],
  dark: ['#083344', '#0F172A', '#1E293B'],
  neural: ['#10B981', '#059669', '#047857'], // Green for neural activity
  glow: ['#60A5FA', '#3B82F6', '#2563EB']
};

// Draw a filled circle
function drawCircle(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

// Draw a filled rectangle
function drawRect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// Draw worm segment
function drawSegment(ctx, x, y, width, height, color, pattern, rng) {
  // Base segment
  drawRect(ctx, x, y, width, height, color);

  // Add pattern based on type (scaled for 128x128)
  switch (pattern) {
    case 'striped':
      if (rng.chance(0.5)) {
        ctx.fillStyle = rng.choice(NEMA_COLORS.accent);
        ctx.fillRect(x, y + height / 3, width, height / 3);
      }
      break;
    case 'spotted':
      if (rng.chance(0.3)) {
        const spotColor = rng.choice(NEMA_COLORS.accent);
        drawCircle(ctx, x + width/2, y + height/2, 2, spotColor); // Double spot size
      }
      break;
    case 'neural':
      if (rng.chance(0.4)) {
        const neuralColor = rng.choice(NEMA_COLORS.neural);
        ctx.fillStyle = neuralColor;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4); // Scale neural pattern
      }
      break;
  }
}

// Draw worm eyes based on rotation angle
function drawEyes(ctx, headX, headY, eyeStyle, rotationAngle, rng) {
  const eyeColor = rng.choice(NEMA_COLORS.glow);
  
  // Calculate eye positions based on rotation angle (scaled for 128x128)
  // Eyes are positioned perpendicular to the head direction
  const eyeDistance = 3; // Double the distance for 128x128
  const perpendicularAngle = rotationAngle + Math.PI / 2;
  
  const eye1X = headX + Math.cos(perpendicularAngle) * eyeDistance;
  const eye1Y = headY + Math.sin(perpendicularAngle) * eyeDistance;
  const eye2X = headX - Math.cos(perpendicularAngle) * eyeDistance;
  const eye2Y = headY - Math.sin(perpendicularAngle) * eyeDistance;
  
  switch (eyeStyle) {
    case 'simple':
      drawCircle(ctx, eye1X, eye1Y, 2, eyeColor); // Double eye size
      drawCircle(ctx, eye2X, eye2Y, 2, eyeColor);
      break;
    case 'compound':
      // Multiple small dots for compound eyes
      for (let i = 0; i < 2; i++) {
        const forwardOffset = (i - 0.5) * 1.6; // Scale offset
        const forwardX = Math.cos(rotationAngle) * forwardOffset;
        const forwardY = Math.sin(rotationAngle) * forwardOffset;
        
        drawCircle(ctx, eye1X + forwardX, eye1Y + forwardY, 0.8, eyeColor); // Double dot size
        drawCircle(ctx, eye2X + forwardX, eye2Y + forwardY, 0.8, eyeColor);
      }
      break;
    case 'glowing':
      // Larger glowing eyes
      drawCircle(ctx, eye1X, eye1Y, 2.4, eyeColor); // Double sizes
      drawCircle(ctx, eye2X, eye2Y, 2.4, eyeColor);
      // Add glow effect
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 4; // Double shadow blur
      drawCircle(ctx, eye1X, eye1Y, 1.6, eyeColor);
      drawCircle(ctx, eye2X, eye2Y, 1.6, eyeColor);
      ctx.shadowBlur = 0;
      break;
  }
}

// Generate worm body path based on pose and rotation angle
function generateWormPath(pose, length, rotationAngle, canvasSize, rng) {
  const points = [];
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  // Add padding to keep worms away from circular border
  // For 128x128 canvas with 64px radius, use 48px max radius (16px padding)
  const maxRadius = (canvasSize / 2) - 16;
  
  // Base points before rotation (always start facing up)
  let basePoints = [];
  
  switch (pose) {
    case 'straight':
      const straightLength = Math.min(length * 6, maxRadius * 1.5); // Scale up for 128x128
      for (let i = 0; i < length; i++) {
        basePoints.push({
          x: 0,
          y: -(straightLength / 2) + (i * (straightLength / (length - 1)))
        });
      }
      break;
      
    case 'curved':
      const curvedLength = Math.min(length * 6, maxRadius * 1.5);
      for (let i = 0; i < length; i++) {
        const progress = i / (length - 1);
        const curve = Math.sin(progress * Math.PI) * Math.min(12, maxRadius * 0.3); // Scale curve width
        basePoints.push({
          x: curve,
          y: -(curvedLength / 2) + (i * (curvedLength / (length - 1)))
        });
      }
      break;
      
    case 'coiled':
      for (let i = 0; i < length; i++) {
        const angle = (i / length) * Math.PI * 3;
        const radius = Math.min(8 + (i * 1.6), maxRadius * 0.7); // Scale coil radius
        basePoints.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }
      break;
      
    case 'wavy':
      const wavyLength = Math.min(length * 6, maxRadius * 1.5);
      for (let i = 0; i < length; i++) {
        const progress = i / (length - 1);
        const wave = Math.sin(progress * Math.PI * 2) * Math.min(8, maxRadius * 0.2); // Scale wave amplitude
        basePoints.push({
          x: wave,
          y: -(wavyLength / 2) + (i * (wavyLength / (length - 1)))
        });
      }
      break;
  }
  
  // Apply rotation and center the points
  const cos = Math.cos(rotationAngle);
  const sin = Math.sin(rotationAngle);
  
  // Calculate bounding box to ensure we stay within limits
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const rotatedPoints = [];
  
  for (const point of basePoints) {
    const rotatedX = point.x * cos - point.y * sin;
    const rotatedY = point.x * sin + point.y * cos;
    
    rotatedPoints.push({ x: rotatedX, y: rotatedY });
    
    minX = Math.min(minX, rotatedX);
    maxX = Math.max(maxX, rotatedX);
    minY = Math.min(minY, rotatedY);
    maxY = Math.max(maxY, rotatedY);
  }
  
  // Calculate scale factor to ensure worm fits within padding
  const width = maxX - minX;
  const height = maxY - minY;
  const maxDimension = Math.max(width, height);
  const scale = maxDimension > maxRadius * 2 ? (maxRadius * 2) / maxDimension : 1;
  
  // Apply scaling and center the points
  for (const point of rotatedPoints) {
    points.push({
      x: centerX + (point.x * scale),
      y: centerY + (point.y * scale)
    });
  }
  
  return { points, rotationAngle };
}

// Main worm drawing function
function drawWorm(ctx, traits, rng) {
  const canvasSize = 128;
  const segmentWidth = 12; // Double the segment width for 128x128
  const segmentHeight = 8; // Double the segment height for 128x128
  
  // Generate worm path
  const { points: wormPath, rotationAngle } = generateWormPath(traits.pose, traits.bodyLength, traits.rotationAngle, canvasSize, rng);
  
  // Draw segments from tail to head
  for (let i = wormPath.length - 1; i >= 0; i--) {
    const point = wormPath[i];
    const isHead = i === 0;
    const isTail = i === wormPath.length - 1;
    
    // Adjust size for head and tail (scaled for 128x128)
    let width = segmentWidth;
    let height = segmentHeight;
    
    if (isHead) {
      width = segmentWidth + 4; // Scale head enlargement
      height = segmentHeight + 2;
    } else if (isTail) {
      width = segmentWidth - 2; // Scale tail reduction
      height = segmentHeight - 2;
    }
    
    // Choose color based on position and traits
    let segmentColor = traits.primaryColor;
    if (isHead) {
      segmentColor = rng.choice(NEMA_COLORS.accent);
    } else if (traits.neuralActivity && rng.chance(0.3)) {
      segmentColor = rng.choice(NEMA_COLORS.neural);
    }
    
    // Draw the segment
    drawSegment(
      ctx, 
      Math.round(point.x - width/2), 
      Math.round(point.y - height/2), 
      width, 
      height, 
      segmentColor, 
      isHead ? 'solid' : traits.segmentPattern,
      rng
    );
    
    // Draw eyes on head
    if (isHead) {
      drawEyes(ctx, point.x, point.y, traits.eyeStyle, rotationAngle, rng);
    }
  }
}

// Main avatar generation function
export function generateWormAvatar(walletAddress) {
  const seed = hashCode(walletAddress);
  const rng = new SeededRandom(seed);
  
  // Create canvas with higher resolution
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Enable anti-aliasing for smoother edges
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Set black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 128, 128);
  
  // Generate worm traits
  const wormTraits = {
    bodyLength: rng.range(8, 14),
    primaryColor: rng.choice(NEMA_COLORS.primary),
    accentColor: rng.choice(NEMA_COLORS.accent),
    segmentPattern: rng.choice(['solid', 'striped', 'spotted', 'neural']),
    eyeStyle: rng.choice(['simple', 'compound', 'glowing']),
    pose: rng.choice(['straight', 'curved', 'coiled', 'wavy']),
    rotationAngle: rng.next() * Math.PI * 2, // 0 to 2π radians (360 degrees)
    neuralActivity: rng.chance(0.3) // Some worms have active neural segments
  };
  
  // Draw the worm
  drawWorm(ctx, wormTraits, rng);
  
  // Return base64 data URL
  return canvas.toDataURL('image/png');
}

// Generate a preview of different variations (for testing)
export function generateWormVariations(walletAddress, count = 9) {
  const variations = [];
  for (let i = 0; i < count; i++) {
    // Create slight variations by modifying the wallet address
    const modifiedAddress = walletAddress + i.toString();
    variations.push(generateWormAvatar(modifiedAddress));
  }
  return variations;
}

export default generateWormAvatar;