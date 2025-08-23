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
      <div className="group relative overflow-hidden bg-gradient-to-br from-black/80 via-gray-900/50 to-black/80 rounded-lg border-2 border-gray-700 hover:border-current transition-all duration-500">
        {/* Header */}
        <div className={`p-6 border-b border-gray-700 ${colorClasses[color]}`}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div>
              <h3 className="text-2xl font-bold">{title}</h3>
              <p className="text-sm opacity-80">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Specs Display */}
        <div className="p-6">
          <div className="space-y-4">
            {specs.map((spec, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded bg-black/40 border-l-4 transition-all duration-500 ${
                  index === activeSpec 
                    ? `border-current ${colorClasses[color]} bg-black/60` 
                    : 'border-gray-600 text-gray-400'
                }`}
              >
                <span className="font-mono text-sm">{spec.label}</span>
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
        <h3 className="text-2xl font-bold text-cyan-400 mb-2">Development Roadmap</h3>
        <div className="w-16 h-0.5 bg-cyan-400 mx-auto"></div>
      </div>

      {phases.map((phase, index) => (
        <div 
          key={index}
          className={`relative p-6 rounded-lg border-2 transition-all duration-500 cursor-pointer ${
            index === activePhase 
              ? 'border-cyan-400 bg-gradient-to-r from-cyan-900/20 to-purple-900/20' 
              : 'border-gray-600 bg-black/40 hover:border-gray-500'
          }`}
          onClick={() => setActivePhase(index)}
        >
          {/* Phase indicator */}
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
              index === activePhase ? 'border-cyan-400 text-cyan-400' : 'border-gray-600 text-gray-400'
            }`}>
              {index + 1}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-xl font-bold ${index === activePhase ? 'text-cyan-400' : 'text-gray-300'}`}>
                  Phase {index + 1}: {phase.title}
                </h4>
                <span className={`text-xs px-2 py-1 rounded font-mono ${
                  phase.status === 'BUILDING' ? 'bg-green-900/50 text-green-400' :
                  phase.status === 'PLANNING' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-purple-900/50 text-purple-400'
                }`}>
                  {phase.status}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{phase.description}</p>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-1000 ease-out"
                  style={{ width: `${index === activePhase ? phase.progress : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Progress</span>
                <span>{phase.progress}%</span>
              </div>
            </div>
          </div>

          {/* Connection line */}
          {index < phases.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-6 bg-gray-600"></div>
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
        <div className="p-8 bg-gradient-to-r from-purple-900/30 via-black/50 to-cyan-900/30 rounded-lg border border-cyan-400/50">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6">The Vision</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Building on DeepWorm's pioneering work in digital biology, Nema introduces 
            groundbreaking neuroplasticity and neurogenesis capabilities. Our implementation 
            not only faithfully reproduces the C. elegans nervous system but enhances it 
            with the ability to learn and grow through advanced neural plasticity algorithms.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
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

      {/* Technical Specifications Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <TechSpecPanel
          title="Foundation"
          subtitle="DeepWorm Heritage"
          specs={foundationSpecs}
          icon="🧬"
          color="cyan"
          delay={0}
        />
        <TechSpecPanel
          title="Enhancements"
          subtitle="NEMA Innovations"
          specs={enhancementSpecs}
          icon="⚡"
          color="purple"
          delay={200}
        />
        <TechSpecPanel
          title="Architecture"
          subtitle="System Design"
          specs={architectureSpecs}
          icon="🏗️"
          color="green"
          delay={400}
        />
      </div>

      {/* Evolution Timeline */}
      <div className="max-w-4xl mx-auto">
        <EvolutionTimeline />
      </div>

      {/* Revolutionary Applications */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-black/60 rounded-lg border border-cyan-400/50">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">Autonomous Digital Evolution</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>Self-improving systems that genuinely learn and evolve</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>Adaptive smart contracts improving through usage patterns</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>Evolutionary finance systems that optimize autonomously</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-purple-900/20 to-black/60 rounded-lg border border-purple-400/50">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Biological AI Fusion</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>AI systems grounded in biological neural principles</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Organic learning patterns mirroring neural development</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Emergent behaviors with beneficial unpredictability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Research Focus */}
      <div className="text-center p-8 bg-gradient-to-r from-black/80 via-gray-900/50 to-black/80 rounded-lg border border-gray-600">
        <h3 className="text-2xl font-bold text-cyan-400 mb-6">Research & Development Focus</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-300">
          <div className="p-4 bg-black/40 rounded border-l-4 border-cyan-400">
            <div className="font-bold text-cyan-400 mb-2">Digital Biology</div>
            <div className="text-sm">Computational neuroscience and neural simulation</div>
          </div>
          <div className="p-4 bg-black/40 rounded border-l-4 border-purple-400">
            <div className="font-bold text-purple-400 mb-2">Blockchain Verification</div>
            <div className="text-sm">On-chain biological process validation</div>
          </div>
          <div className="p-4 bg-black/40 rounded border-l-4 border-green-400">
            <div className="font-bold text-green-400 mb-2">Neuroplasticity</div>
            <div className="text-sm">Advanced learning algorithm implementation</div>
          </div>
          <div className="p-4 bg-black/40 rounded border-l-4 border-red-400">
            <div className="font-bold text-red-400 mb-2">Autonomous Systems</div>
            <div className="text-sm">Self-evolving digital organism development</div>
          </div>
        </div>
      </div>

      {/* Future Vision */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="p-8 bg-gradient-to-r from-red-900/20 via-black/50 to-cyan-900/20 rounded-lg border border-gradient-to-r border-cyan-400/50">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6">The Future of Digital Life</h3>
          <p className="text-lg text-gray-300 leading-relaxed">
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