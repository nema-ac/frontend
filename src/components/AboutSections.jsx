import { useState, useEffect } from 'react';
import InteractiveNeuralNetwork from './InteractiveNeuralNetwork';

const TechSpecPanel = ({ title, subtitle, specs, icon, color = "cyan", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSpec, setActiveSpec] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveSpec(prev => (prev + 1) % specs.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible, specs.length]);

  const colorClasses = {
    cyan: 'border-cyan-400 text-cyan-400',
    purple: 'border-purple-400 text-purple-400',
    red: 'border-red-400 text-red-400',
    green: 'border-green-400 text-green-400'
  };

  return (
    <div className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="group relative overflow-hidden nema-card hover:border-nema-cyan transition-all duration-500">
        {/* Header */}
        <div className={`p-6 border-b border-nema-gray ${colorClasses[color]}`}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div>
              <h3 className="nema-display nema-display-2 font-intranet">{title}</h3>
              <p className="text-sm opacity-80 font-anonymous">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Specs Display */}
        <div className="p-6 bg-nema-black/40">
          <div className="space-y-4">
            {specs.map((spec, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border-l-4 transition-all duration-500 font-anonymous ${
                  index === activeSpec
                    ? `border-current ${colorClasses[color]} bg-nema-black/60`
                    : 'border-nema-gray-darker text-nema-gray-darker bg-nema-black/20'
                }`}
              >
                <span className="text-sm">{spec.label}</span>
                <span className="font-bold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated indicator */}
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-20 animate-pulse"></div>
      </div>
    </div>
  );
};

const EvolutionTimeline = () => {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const phases = [
    {
      title: "Enhanced Mobility",
      description: "Implement neuroplasticity in basic locomotion with dynamic adaptation to environmental stimuli and learning-based movement optimization.",
      status: "BUILDING",
      progress: 75
    },
    {
      title: "Cognitive Verification",
      description: "Deploy on-chain verification of learning processes, transparent neurogenesis tracking, and verifiable cognitive development milestones.",
      status: "PLANNING",
      progress: 30
    },
    {
      title: "NemaLink Integration",
      description: "Launch neural bridge technology enabling higher-order cognitive functions and advanced behavioral learning capabilities.",
      status: "RESEARCH",
      progress: 15
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="nema-display nema-display-2 text-nema-cyan mb-2 font-intranet">Development Roadmap</h3>
        <div className="w-16 h-0.5 bg-nema-cyan mx-auto"></div>
      </div>

      {phases.map((phase, index) => (
        <div
          key={index}
          className={`relative nema-card p-6 transition-all duration-500 cursor-pointer ${
            index === activePhase
              ? 'border-nema-cyan bg-nema-cyan/5'
              : 'bg-nema-black/40 hover:border-nema-cyan/50'
          }`}
          onClick={() => setActivePhase(index)}
        >
          {/* Phase indicator */}
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm font-anonymous ${
              index === activePhase ? 'border-nema-cyan text-nema-cyan' : 'border-nema-gray-darker text-nema-gray-darker'
            }`}>
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`nema-header-2 font-intranet ${index === activePhase ? 'text-nema-cyan' : 'text-nema-gray'}`}>
                  Phase {index + 1}: {phase.title}
                </h4>
                <span className={`text-xs px-2 py-1 font-anonymous ${
                  phase.status === 'BUILDING' ? 'bg-green-900/50 text-green-400 border border-green-400/30' :
                  phase.status === 'PLANNING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400/30' :
                  'bg-purple-900/50 text-purple-400 border border-purple-400/30'
                }`}>
                  {phase.status}
                </span>
              </div>

              <p className="text-nema-gray text-sm mb-4 font-anonymous">{phase.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-nema-black/60 h-2 rounded-full overflow-hidden border border-nema-gray/20">
                <div
                  className="h-full bg-gradient-to-r from-nema-cyan to-nema-purple transition-all duration-1000 ease-out"
                  style={{ width: `${index === activePhase ? phase.progress : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-nema-gray-darker mt-1 font-anonymous">
                <span>Progress</span>
                <span>{phase.progress}%</span>
              </div>
            </div>
          </div>

          {/* Connection line */}
          {index < phases.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-6 bg-nema-gray-darker"></div>
          )}
        </div>
      ))}
    </div>
  );
};

const AboutSections = () => {
  const foundationSpecs = [
    { label: "BASE_NEURONS", value: "302" },
    { label: "TOTAL_CELLS", value: "397" },
    { label: "SENSORY_NEURONS", value: "8" },
    { label: "MOTOR_NEURONS", value: "21" },
    { label: "RUNTIME_ENV", value: "TEE" }
  ];

  const enhancementSpecs = [
    { label: "PLASTICITY_ALGO", value: "ACTIVE" },
    { label: "SYNAPSE_ADAPT", value: "DYNAMIC" },
    { label: "LEARNING_CYCLES", value: "∞" },
    { label: "MEMORY_PERSIST", value: "TRUE" },
    { label: "GROWTH_LIMIT", value: "NONE" }
  ];

  const architectureSpecs = [
    { label: "BASE_LAYER", value: "C.ELEGANS" },
    { label: "PLASTICITY_LYR", value: "ENABLED" },
    { label: "GROWTH_LAYER", value: "ACTIVE" },
    { label: "BRIDGE_LAYER", value: "NEMALINK" },
    { label: "BLOCKCHAIN", value: "SOLANA" }
  ];

  return (
    <div className="space-y-16">
      {/* Vision Statement */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="nema-card p-8 bg-nema-black/40">
          <h2 className="nema-display nema-display-2 text-nema-cyan mb-6 font-intranet">The Vision</h2>
          <p className="text-lg text-nema-gray leading-relaxed mb-4 font-anonymous">
            Building on DeepWorm's pioneering work in digital biology, Nema introduces
            groundbreaking neuroplasticity and neurogenesis capabilities. Our implementation
            not only faithfully reproduces the C. elegans nervous system but enhances it
            with the ability to learn and grow through advanced neural plasticity algorithms.
          </p>
          <p className="text-lg text-nema-gray leading-relaxed font-anonymous">
            Through NemaLink, our innovative neural bridge technology, we enable higher
            cognitive functions while preserving authentic worm-like behaviors. This creates
            a unique fusion of biological neural networks and artificial intelligence,
            establishing new possibilities for autonomous digital organisms.
          </p>
        </div>
      </div>

      {/* Interactive Neural Network */}
      <div>
        <InteractiveNeuralNetwork />
      </div>

      {/* Evolution Timeline */}
      <div className="max-w-4xl mx-auto">
        <EvolutionTimeline />
      </div>

      {/* Future Vision */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="nema-card p-8 bg-nema-black/40">
          <h3 className="nema-display nema-display-2 text-nema-cyan mb-6 font-intranet">The Future of Digital Life</h3>
          <p className="text-lg text-nema-gray leading-relaxed font-anonymous">
            Nema doesn't just create digital organisms, it creates digital organisms capable
            of genuine growth, learning, and evolution. By combining the biological accuracy
            of DeepWorm with revolutionary neuroplasticity and neurogenesis capabilities,
            we're opening entirely new frontiers in autonomous digital life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSections;
