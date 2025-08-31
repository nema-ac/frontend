import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Roadmap = () => {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [activePhase, setActivePhase] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Update active phase based on scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      if (progress < 0.3) {
        setActivePhase(0);
      } else if (progress < 0.7) {
        setActivePhase(1);
      } else {
        setActivePhase(2);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const togglePhase = (index) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const phases = [
    {
      title: "POC & Worminal",
      subtitle: "Phase 1",
      description: "Building the foundation for neural state interaction",
      details: [
        "LLM interaction & neural state understanding",
        "User management & $NEMA utility system",
        "Custom C. Elegans connectome implementation"
      ],
      status: "current"
    },
    {
      title: "Individual Nemas",
      subtitle: "Phase 2",
      description: "Personal Nema creation and enhanced integration",
      details: [
        "Personal Nema creation for $NEMA holders",
        "Integrated bespoke connectome with LLM",
        "$NEMA token utility for LLM costs"
      ],
      status: "upcoming"
    },
    {
      title: "Fully On-Chain Brain",
      subtitle: "Phase 3",
      description: "Decentralized neural networks on blockchain",
      details: [
        "Decentralized, verifiable on-chain Nema brains",
        "$NEMA as the ecosystem currency",
        "Open integrations & expanded use cases"
      ],
      status: "future"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-cyan-400">ROADMAP</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto">
            This roadmap outlines our goals and where we want to take the NEMA project.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div ref={containerRef} className="relative min-h-[300vh]">
          {/* Phase Items with Stacking Animation */}
          <div className="sticky top-20">
            {phases.map((phase, index) => {
              const cardStart = index === 0 ? 0 : index * 0.3;
              const cardEnd = index === 0 ? 0.1 : cardStart + 0.3;
              
              const y = useTransform(
                scrollYProgress,
                [cardStart, cardEnd],
                index === 0 ? [0, 0] : [200, 0]
              );
              
              const scale = useTransform(
                scrollYProgress,
                [cardStart, cardEnd],
                index === 0 ? [1, 1] : [0.85, 1]
              );
              
              const opacity = useTransform(
                scrollYProgress,
                [cardStart - 0.05, cardStart],
                index === 0 ? [1, 1] : [0, 1]
              );

              const rotateX = useTransform(
                scrollYProgress,
                [cardStart, cardEnd],
                index === 0 ? [0, 0] : [15, 0]
              );

              return (
                <motion.div
                  key={index}
                  style={{
                    y,
                    scale,
                    opacity,
                    rotateX,
                    zIndex: index + 10,
                    position: index === 0 ? 'relative' : 'absolute',
                    top: index === 0 ? 0 : `${index * 30}px`,
                    left: 0,
                    right: 0,
                    transformPerspective: 1000,
                    pointerEvents: index === activePhase ? 'auto' : 'none'
                  }}
                  className="w-full"
                >
                  <div className="flex items-center relative">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-cyan-400/30 transition-all duration-300 shadow-2xl">
                        {/* Phase Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                          phase.status === 'current'
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                            : phase.status === 'upcoming'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}>
                          {phase.subtitle}
                          {phase.status === 'current' && (
                            <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                          {phase.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 mb-6 text-lg">
                          {phase.description}
                        </p>

                        {/* Details */}
                        <div className="space-y-3">
                          {phase.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 flex-shrink-0"></div>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {detail}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Collapsible Section Toggle */}
                        <div className="mt-6 border-t border-gray-700/50 pt-6">
                          <button
                            onClick={() => togglePhase(index)}
                            className="flex items-center justify-between w-full text-left hover:text-cyan-400 transition-colors duration-200 cursor-pointer relative z-10"
                          >
                            <span className="text-gray-300 font-medium">More Details</span>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                expandedPhases[index] ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Collapsible Content */}
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedPhases[index] ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                          }`}>
                            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                              <h4 className="text-cyan-400 font-semibold mb-3">Technical Implementation</h4>
                              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                              </p>
                              
                              <h4 className="text-cyan-400 font-semibold mb-3">Key Milestones</h4>
                              <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Initial architecture design and proof of concept development</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Core system integration and testing framework establishment</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>User interface development and beta testing deployment</span>
                                </li>
                              </ul>
                              
                              <div className="mt-4 pt-3 border-t border-gray-700/50">
                                <p className="text-xs text-gray-400">
                                  Timeline: This phase is expected to be completed within the current development cycle.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-cyan-400/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 max-w-3xl mx-auto">
            <p className="text-gray-300 text-sm">
              <span className="text-cyan-400 font-medium">Note:</span> We are currently in Phase 1.
              You will see tangible results such as User Management and LLM Interactions soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
