'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface NeuralConnection {
  start: Point;
  end: Point;
  life: number;
  maxLife: number;
}

export function EtherealWorm() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wormRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const connectionsRef = useRef<SVGGElement>(null);
  const animationState = useRef({
    currentPoint: { x: 0, y: 0 },
    targetPoint: { x: 0, y: 0 },
    progress: 0,
    pathHistory: [] as Point[],
    connections: [] as NeuralConnection[]
  });

  // Add this helper function to calculate distance between points
  const getDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Modify the generateNewTarget function
  const generateNewTarget = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDistance = width * 0.35; // Minimum path length is 35% of screen width
    const current = animationState.current.currentPoint;

    let newTarget: Point;
    do {
      newTarget = {
        x: Math.random() * width,
        y: Math.random() * height
      };
    } while (current.x !== 0 && getDistance(current, newTarget) < minDistance);

    return newTarget;
  };

  // Generate random point within radius
  const generateBranchPoint = (center: Point, radius: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance
    };
  };

  // Calculate control points for smooth Bezier curve
  const getControlPoints = (start: Point, end: Point) => {
    const midX = (start.x + end.x) / 2;
    return {
      cp1: { x: midX, y: start.y },
      cp2: { x: midX, y: end.y }
    };
  };

  // Create path string for smooth curve
  const createPath = (start: Point, end: Point) => {
    const { cp1, cp2 } = getControlPoints(start, end);
    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  };

  // Create neural connections
  const createConnections = (point: Point) => {
    const numConnections = Math.floor(Math.random() * 3) + 2; // 2-4 connections
    for (let i = 0; i < numConnections; i++) {
      const end = generateBranchPoint(point, 100); // 100px radius
      animationState.current.connections.push({
        start: { ...point },
        end,
        life: 1,
        maxLife: 2 + Math.random() * 2
      });
    }
  };

  useEffect(() => {
    // Initialize starting position
    const initial = generateNewTarget();
    animationState.current = {
      currentPoint: initial,
      targetPoint: generateNewTarget(),
      progress: 0,
      pathHistory: [initial],
      connections: []
    };

    const animate = () => {
      if (!wormRef.current || !trailRef.current || !connectionsRef.current) return;

      const state = animationState.current;
      state.progress += 0.001;

      // Current position calculation
      const currentX = state.currentPoint.x + (state.targetPoint.x - state.currentPoint.x) * state.progress;
      const currentY = state.currentPoint.y + (state.targetPoint.y - state.currentPoint.y) * state.progress;
      const currentPos = { x: currentX, y: currentY };

      // Randomly create new connections
      if (Math.random() < 0.05) {
        createConnections(currentPos);
      }

      // Update and render connections
      state.connections = state.connections.filter(conn => {
        conn.life -= 0.016;
        return conn.life > 0;
      });

      const connectionsPath = state.connections.map(conn => {
        const opacity = (conn.life / conn.maxLife) * 0.75;
        const midPoint = generateBranchPoint(
          { x: (conn.start.x + conn.end.x) / 2, y: (conn.start.y + conn.end.y) / 2 },
          20
        );
        return `
          <path
            d="M ${conn.start.x} ${conn.start.y} Q ${midPoint.x} ${midPoint.y} ${conn.end.x} ${conn.end.y}"
            stroke="url(#wormGradient)"
            stroke-opacity="${opacity}"
            stroke-width="1.5"  // Increased from 1 to 1.5
            fill="none"
            stroke-linecap="round"
            filter="url(#glow)"
          />
          <circle
            cx="${conn.end.x}"
            cy="${conn.end.y}"
            r="2.5"  // Increased from 2 to 2.5
            fill="url(#wormGradient)"
            fill-opacity="${opacity}"
            filter="url(#glow)"
          />
        `;
      }).join('');

      connectionsRef.current.innerHTML = connectionsPath;

      if (state.progress >= 1) {
        // Reached target, set new target
        state.currentPoint = state.targetPoint;
        state.targetPoint = generateNewTarget();
        state.progress = 0;

        // Update path history
        state.pathHistory.push(state.currentPoint);
        if (state.pathHistory.length > 50) {
          state.pathHistory.shift();
        }
      }

      // Interpolate current position
      const wormPath = createPath(
        { x: currentX, y: currentY },
        state.targetPoint
      );
      wormRef.current.setAttribute('d', wormPath);

      const trailPath = state.pathHistory
        .slice(-10)
        .map((point, i) => {
          return `<path
            d="M ${point.x} ${point.y} L ${currentX} ${currentY}"
            stroke="url(#wormGradient)"
            stroke-opacity="${0.2 * (1 - i / 10)}"
          />`;
        })
        .join('');

      trailRef.current.innerHTML = trailPath;

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [createConnections, createPath, generateBranchPoint, generateNewTarget]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg ref={svgRef} className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <linearGradient id="wormGradient">
            <stop offset="0%" stopColor="rgba(145, 193, 231, 0.75)" />
            <stop offset="50%" stopColor="rgba(180, 167, 214, 0.85)" />
            <stop offset="100%" stopColor="rgba(244, 184, 196, 0.75)" />
          </linearGradient>
        </defs>

        {/* Neural connections */}
        <g ref={connectionsRef} />

        {/* Trail container */}
        <g ref={trailRef} />

        <path
          ref={wormRef}
          className="opacity-85"
          stroke="url(#wormGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            filter: 'url(#glow)',
          }}
        />
      </svg>
    </div>
  );
}
