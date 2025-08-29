const Roadmap = () => {
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
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 z-0"></div>

          {/* Phase Items */}
          <div className="space-y-16">
            {phases.map((phase, index) => (
              <div key={index} className="relative flex items-center">
                {/* Timeline Node */}
                <div className="absolute left-4 md:left-8 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-cyan-400 bg-black z-10">
                  {phase.status === 'current' && (
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 ml-8 md:ml-20">
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-cyan-400/30 transition-all duration-300">
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
