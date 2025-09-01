import { useState } from 'react';

const Roadmap = () => {
  const [expandedPhases, setExpandedPhases] = useState({});

  const togglePhase = (index) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const phases = [
    {
      title: "Initial Setup & User Accounts",
      subtitle: "Phase 0",
      description: "Getting the platform ready for users to join and create their first Nema",
      details: [
        { text: "Website launch with user registration", status: "completed" },
        { text: "Wallet connection for $NEMA holders", status: "completed" },
        { text: "Personal Nema avatar creation", status: "completed" },
        { text: "Account dashboard and profile setup", status: "completed" }
      ],
      status: "completed",
      technicalImplementation: "Phase 0 establishes the fundamental infrastructure required for the entire Nema ecosystem. This includes designing and implementing a scalable backend architecture using Go with PostgreSQL for data persistence, creating secure user authentication flows with Solana wallet integration, and developing the core API endpoints that will support future phases. Security measures include proper key management, encrypted data storage, and secure communication protocols between all system components.",
      keyMilestones: [
        "Complete system architecture design with scalable backend infrastructure using Go and PostgreSQL",
        "Implement secure user authentication system with Solana wallet integration and session management",
        "Deploy robust API framework with proper error handling, logging, and monitoring capabilities",
        "Create responsive frontend application using React, Vite, and Tailwind CSS with modern UI patterns",
        "Nema avatar generation on user account creation with $NEMA holding verifications",
        "Establish development and deployment pipelines with automated testing and continuous integration",
        "Launch Nema website and open up for users to create accounts"
      ],
      timeline: "Phase 0 was completed August 2025, establishing the foundational infrastructure that enables all subsequent development phases. User authentication, basic API endpoints, and frontend framework are now operational and ready for neural system integration."
    },
    {
      title: "POC & Worminal",
      subtitle: "Phase 1",
      description: "First hands-on experience with your Nema through the Worminal interface, limited to one user at a time",
      details: [
        { text: "Chat with your Nema through the Worminal terminal", status: "completed" },
        { text: "Nema learns and responds based on simulated neural behavior", status: "in-progress" },
        { text: "Earn badges and rewards for Nema interactions", status: "in-progress" },
        { text: "Queue system for accessing the shared Nema experience", status: "in-progress" },
        { text: "Live tracking of Nema's growth and personality development through visualizations of connectome and higher level interpretability", status: "unstarted" }
      ],
      status: "in-progress",
      technicalImplementation: "Phase 1 establishes the core infrastructure for neural state interaction using Large Language Models to mock and simulate C. elegans connectome behavior. Rather than implementing the full 302-neuron network, this phase uses sophisticated LLM prompting to simulate neural responses and behaviors that mirror what a real connectome would produce. The Worminal interface serves as the primary interaction point, translating user inputs into simulated neural stimulations and interpreting the organism's responses through structured LLM processing. This phase will restrict Nema access to a single user at a time and will be used to guide the development of the Nema project.",
      keyMilestones: [
        "Access system provides single user access to individual Nemas",
        "Deploy Worminal terminal interface with real-time neural visualization",
        "Integrate OpenAI API with structured response schemas for consistent neural interpretation",
        "Implement $NEMA token utility system for Nema progress and rewards",
        "Launch beta testing program with badge system and user feedback collection"
      ],
      timeline: "Phase 1 is currently in active development with expected completion by September 2025. User-LLM-Nema architecture is operational, with access systems and reward mechanisms in progress."
    },
    {
      title: "Individual Nemas",
      subtitle: "Phase 2",
      description: "Get your own personal Nema with real neural networks - no more waiting in line",
      details: [
        { text: "Upgrade to real neural networks powering each Nema", status: "unstarted" },
        { text: "Every $NEMA holder gets their own personal Nema companion", status: "unstarted" },
        { text: "Use $NEMA tokens to interact with and train your Nema", status: "unstarted" },
        { text: "Your Nema remembers you and develops unique personality over time", status: "unstarted" }
      ],
      status: "upcoming",
      technicalImplementation: "Phase 2 introduces the actual bespoke neural network implementation, replacing the LLM-mocked connectome from Phase 1 with a real 302-neuron C. elegans connectome based on OpenWorm research. Each individual Nema will possess distinct neural pathways influenced by the holder's interaction history, creating emergent behaviors and personalities. Users will have on-demand access to their Nemas rather than the single-user restriction from Phase 1. This phase establishes $NEMA as the official payment method for all LLM and Nema interaction costs, creating the token's core utility within the ecosystem.",
      keyMilestones: [
        "Complete transition from LLM-mocked to real neural network implementation",
        "Develop neural variation algorithms for unique Nema generation based on user interaction patterns",
        "Implement persistent memory systems with enhanced backend for long-term behavioral evolution",
        "Deploy $NEMA payment integration for all platform interactions and costs",
        "Remove single-user access restrictions, enabling on-demand Nema interaction",
        "Create advanced LLM fine-tuning pipeline for personalized Nema communication styles",
        "Launch Nema breeding and evolution mechanics allowing cross-pollination of neural traits"
      ],
      timeline: "Phase 2 development begins in Q4 2025 following Phase 1 completion, with full deployment targeted for Q2 2026. Individual Nema creation will roll out gradually to $NEMA holders based on token holding tiers."
    },
    {
      title: "Fully On-Chain Brain",
      subtitle: "Phase 3",
      description: "Your Nema lives permanently on the blockchain - truly owned digital life",
      details: [
        { text: "Nema brains stored and verified on Solana blockchain", status: "unstarted" },
        { text: "Trade, breed, and showcase your Nemas with full ownership", status: "unstarted" },
        { text: "Third-party apps and games can integrate with your Nemas", status: "unstarted" }
      ],
      status: "future",
      technicalImplementation: "Phase 3 represents the ultimate evolution of the Nema ecosystem: fully decentralized, on-chain neural networks operating on Solana blockchain infrastructure. Neural states become verifiable through zero-knowledge proofs, enabling trustless interaction and evolution. Smart contracts govern Nema lifecycle, breeding, and evolution, while maintaining the complex neural computations through a hybrid on-chain/off-chain architecture. This creates an autonomous digital biology ecosystem where Nemas can interact, evolve, and develop independently of centralized infrastructure.",
      keyMilestones: [
        "Develop zero-knowledge proof system for verifiable neural state transitions on Solana",
        "Implement smart contract architecture for autonomous Nema lifecycle management",
        "Create decentralized compute network for complex neural simulations using Solana validators",
        "Deploy cross-platform integration APIs enabling third-party applications and games"
      ],
      timeline: "Phase 3 represents the long-term vision for the Nema ecosystem, beginning research and development in 2026. Full deployment is projected for 2027-2028, establishing Nema as the first fully decentralized digital biology platform."
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
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 z-0"></div>

          {/* Phase Items */}
          <div className="space-y-16">
            {phases.map((phase, index) => (
              <div key={index} className="relative flex items-center">
                {/* Timeline Node */}
                <div className={`absolute left-4 md:left-8 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${phase.status === 'completed'
                  ? 'border-green-400 bg-green-400'
                  : phase.status === 'in-progress'
                    ? 'border-cyan-400 bg-black'
                    : phase.status === 'upcoming'
                      ? 'border-purple-500 bg-black'
                      : 'border-gray-600 bg-black'
                  }`}>
                  {phase.status === 'in-progress' && (
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse"></div>
                  )}
                  {phase.status === 'completed' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 ml-8 md:ml-20">
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-cyan-400/30 transition-all duration-300">
                    {/* Phase Badge */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${phase.status === 'completed'
                      ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                      : phase.status === 'in-progress'
                        ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                        : phase.status === 'upcoming'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}>
                      {phase.subtitle}
                      {phase.status === 'in-progress' && (
                        <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                      )}
                      {phase.status === 'completed' && (
                        <span className="ml-2 w-2 h-2">
                          <svg className="w-2 h-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
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
                          <div className="mt-2 flex-shrink-0">
                            {detail.status === 'completed' ? (
                              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : detail.status === 'in-progress' ? (
                              <div className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-black"></div>
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-500 bg-transparent"></div>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${detail.status === 'completed' ? 'text-gray-300' :
                            detail.status === 'in-progress' ? 'text-white' :
                              'text-gray-400'
                            }`}>
                            {detail.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Collapsible Section Toggle */}
                    <div className="mt-6 border-t border-gray-700/50 pt-6">
                      <button
                        onClick={() => togglePhase(index)}
                        className="flex items-center justify-between w-full text-left hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
                      >
                        <span className="text-gray-300 font-medium">More Details</span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedPhases[index] ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Collapsible Content */}
                      {expandedPhases[index] && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/30">
                            <h4 className="text-cyan-400 font-semibold mb-3">Technical Implementation</h4>
                            <p className="text-gray-300 text-sm leading-relaxed mb-6">
                              {phase.technicalImplementation}
                            </p>

                            <h4 className="text-cyan-400 font-semibold mb-3">Key Milestones</h4>
                            <ul className="space-y-3 text-sm text-gray-300 mb-6">
                              {phase.keyMilestones.map((milestone, milestoneIndex) => (
                                <li key={milestoneIndex} className="flex items-start gap-3">
                                  <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                                  <span className="leading-relaxed">{milestone}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="pt-4 border-t border-gray-700/50">
                              <h4 className="text-cyan-400 font-semibold mb-2 text-sm">Timeline</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {phase.timeline}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
