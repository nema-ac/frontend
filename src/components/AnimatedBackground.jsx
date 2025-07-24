import { useState, useEffect } from 'react';

const AnimatedBackground = () => {
  const [wormSegments, setWormSegments] = useState([]);
  const [neuralNodes, setNeuralNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  // Initialize worm segments
  useEffect(() => {
    const segments = [];
    const segmentCount = 12;
    
    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        id: i,
        x: 20 + i * 8,
        y: 50,
        size: Math.max(6 - i * 0.3, 2),
        delay: i * 0.1,
      });
    }
    
    setWormSegments(segments);
  }, []);

  // Initialize neural network nodes
  useEffect(() => {
    const nodes = [];
    const nodeCount = 8;
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        pulse: Math.random() * 2,
        delay: Math.random() * 3,
      });
    }
    
    setNeuralNodes(nodes);

    // Create connections between nodes
    const newConnections = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      if (Math.random() > 0.4) {
        newConnections.push({
          from: nodes[i],
          to: nodes[i + 1],
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }
    
    setConnections(newConnections);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <defs>
          {/* Gradient for worm */}
          <linearGradient id="wormGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#9659D4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Neural Network Connections */}
        {connections.map((connection, index) => (
          <line
            key={`connection-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="#00FFFF"
            strokeWidth="0.1"
            opacity={connection.opacity}
            filter="url(#glow)"
          >
            <animate
              attributeName="opacity"
              values={`${connection.opacity * 0.2};${connection.opacity};${connection.opacity * 0.2}`}
              dur="4s"
              repeatCount="indefinite"
              begin={`${Math.random() * 2}s`}
            />
          </line>
        ))}

        {/* Neural Network Nodes */}
        {neuralNodes.map((node) => (
          <circle
            key={`node-${node.id}`}
            cx={node.x}
            cy={node.y}
            r="0.3"
            fill="#9659D4"
            opacity="0.6"
            filter="url(#glow)"
          >
            <animate
              attributeName="r"
              values="0.2;0.5;0.2"
              dur={`${2 + node.pulse}s`}
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur={`${3 + node.pulse}s`}
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
          </circle>
        ))}

        {/* Digital Worm */}
        {wormSegments.map((segment, index) => (
          <circle
            key={`segment-${segment.id}`}
            cx={segment.x}
            cy={segment.y}
            r={segment.size / 10}
            fill="url(#wormGradient)"
            filter="url(#glow)"
          >
            {/* Sinusoidal movement */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; 0,${5 * Math.sin(index)}; 0,0`}
              dur="6s"
              repeatCount="indefinite"
              begin={`${segment.delay}s`}
            />
            
            {/* Forward movement */}
            <animate
              attributeName="cx"
              values={`${segment.x};${segment.x + 80};${segment.x}`}
              dur="20s"
              repeatCount="indefinite"
              begin={`${segment.delay}s`}
            />
            
            {/* Gentle size pulsing for "breathing" effect */}
            <animate
              attributeName="r"
              values={`${segment.size / 10};${(segment.size + 1) / 10};${segment.size / 10}`}
              dur="8s"
              repeatCount="indefinite"
              begin={`${segment.delay + 1}s`}
            />
          </circle>
        ))}

        {/* Evolution particles */}
        {Array.from({ length: 15 }, (_, i) => (
          <circle
            key={`particle-${i}`}
            cx={Math.random() * 100}
            cy={Math.random() * 100}
            r="0.1"
            fill="#EDEDED"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0;0.5;0"
              dur={`${3 + Math.random() * 4}s`}
              repeatCount="indefinite"
              begin={`${Math.random() * 5}s`}
            />
            <animate
              attributeName="cy"
              values={`${Math.random() * 100};${Math.random() * 100}`}
              dur={`${10 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${Math.random() * 100};${Math.random() * 100}`}
              dur={`${15 + Math.random() * 15}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* DNA Helix-like structure */}
        <path
          d="M 10,20 Q 30,10 50,20 T 90,20"
          fill="none"
          stroke="#9659D4"
          strokeWidth="0.2"
          opacity="0.2"
          filter="url(#glow)"
        >
          <animate
            attributeName="opacity"
            values="0.1;0.4;0.1"
            dur="12s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-20; 0,0"
            dur="25s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M 10,22 Q 30,32 50,22 T 90,22"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="0.2"
          opacity="0.2"
          filter="url(#glow)"
        >
          <animate
            attributeName="opacity"
            values="0.1;0.4;0.1"
            dur="12s"
            repeatCount="indefinite"
            begin="6s"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,20; 0,0"
            dur="25s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default AnimatedBackground;