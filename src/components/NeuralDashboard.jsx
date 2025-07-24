import { useState, useEffect } from 'react';

const DiagnosticPanel = ({ title, description, metric, icon, delay = 0 }) => {
  const [isActive, setIsActive] = useState(false);
  const [counter, setCounter] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCounter(prev => (prev + Math.floor(Math.random() * 5) + 1) % 100);
        setPulseActive(prev => !prev);
      }, 1500 + Math.random() * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div 
      className="group relative overflow-hidden transition-all duration-500 hover:scale-105"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/80 to-cyan-900/30 group-hover:from-purple-800/40 group-hover:to-cyan-800/40 transition-all duration-500"></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 border-2 border-cyan-400/50 group-hover:border-cyan-300 transition-all duration-500"></div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400"></div>
      
      {/* Content */}
      <div className="relative p-8 h-full">
        {/* Header with status indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <h3 className="text-xl font-bold text-cyan-400 group-hover:text-white transition-colors duration-300">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${pulseActive ? 'bg-green-400' : 'bg-green-600'} transition-colors duration-300`}></div>
                <span className="text-gray-400">SYSTEM ACTIVE</span>
              </div>
            </div>
          </div>
          
          {/* Metric display */}
          <div className="text-right">
            <div className="text-2xl font-mono text-cyan-400 font-bold">
              {counter.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400">{metric}</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-1000 ease-out"
              style={{ width: `${(counter * 0.8 + 20)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>EFFICIENCY</span>
            <span>{Math.floor(counter * 0.8 + 20)}%</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-100 transition-colors duration-300 mb-12">
          {description}
        </p>
        
        {/* Bottom status bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-gray-500">
          <span>ID: {title.replace(/\s+/g, '').toUpperCase()}</span>
          <span className="font-mono">[{isActive ? 'ONLINE' : 'INIT...'}]</span>
        </div>
      </div>
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      </div>
      
      {/* Particle effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const NeuralDashboard = () => {
  const panels = [
    {
      title: "Neural Foundation",
      description: "Built upon DeepWorm's precise 302-neuron C. elegans connectome, providing biologically accurate neural architecture as the foundation for advanced digital organisms.",
      metric: "NEURONS",
      icon: "🧠",
      delay: 0
    },
    {
      title: "Neuroplasticity",
      description: "Revolutionary dynamic synaptic weights enable genuine learning and adaptation, allowing digital organisms to strengthen connections based on experience and environmental stimuli.",
      metric: "ADAPT",
      icon: "⚡",
      delay: 200
    },
    {
      title: "Neurogenesis",
      description: "Advanced neural growth capabilities allow networks to expand beyond the original 302-neuron limit, generating new neurons and adaptive architectures throughout the organism's lifetime.",
      metric: "GROWTH",
      icon: "🌱",
      delay: 400
    },
    {
      title: "NemaLink Bridge",
      description: "Proprietary neural bridge technology enables higher cognitive functions while preserving authentic biological behaviors, creating the perfect fusion of AI and digital biology.",
      metric: "BRIDGE",
      icon: "🔗",
      delay: 600
    }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">NEURAL DIAGNOSTICS</h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {panels.map((panel, index) => (
          <DiagnosticPanel
            key={index}
            title={panel.title}
            description={panel.description}
            metric={panel.metric}
            icon={panel.icon}
            delay={panel.delay}
          />
        ))}
      </div>
      
      {/* System Status Footer */}
      <div className="mt-12 p-4 bg-black/50 rounded border border-cyan-400/30">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">SYSTEM STATUS:</span>
            <span className="text-green-400 font-bold">ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-mono">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>NEMA v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralDashboard;