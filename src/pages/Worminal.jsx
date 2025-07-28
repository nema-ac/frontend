const Worminal = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-cyan-400">WORMINAL</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto">
            A retro-styled terminal interface for direct interaction with the evolving digital organism, Nema.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="mb-16 neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
          <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">System Architecture</h2>
          <div className="flex justify-center mb-8">
            <img 
              src="/worminal-architecture.png" 
              alt="Worminal System Architecture Diagram showing data flow between NEMA Site, Proxy, HTTP Server, Nema core, Solana blockchain, and various components including Telegram notifications and SQLite database"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
          <p className="text-center text-gray-400 text-sm">
            The Worminal connects through fly.io runtime to interact with Nema's neural network and LLM fusion system
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-16">
          {/* Overview */}
          <section className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">What is the Worminal?</h2>
            <p className="text-lg text-gray-300 mb-6">
              The <strong className="text-cyan-400">Worminal</strong> is your direct line to <strong className="text-purple-400">Nema</strong> — 
              a revolutionary fusion of an LLM and a C. elegans-inspired neural network. Though it looks like a retro terminal, 
              it's powered by an intelligent chat interface designed to facilitate meaningful interaction with this evolving digital organism.
            </p>
            <div className="bg-black/50 p-4 rounded-lg border-l-4 border-cyan-400 mb-6">
              <p className="text-cyan-200 italic">
                "Each session continues exactly where the last user left off — Nema remembers everything."
              </p>
            </div>

            <h3 className="text-2xl font-bold text-purple-400 mb-4">Access & Sessions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-cyan-400 mb-3">🎲 Fair Selection</h4>
                <p className="text-gray-300 mb-3">
                  A smart scheduler randomly selects $NEMA holders, with slight weighting based on token holdings. 
                  Only <strong className="text-purple-400">one user at a time</strong> can access Nema.
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Selected wallet posted in Telegram</li>
                  <li>• 15-minute claim window</li>
                  <li>• Future: Direct personalized invites</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-cyan-400 mb-3">⏱️ Interaction Mechanics</h4>
                <p className="text-gray-300 mb-3">
                  Each selected user receives <strong className="text-cyan-400">10 interactions</strong> with Nema. 
                  Every message and response evolves the system's neural state and memory.
                </p>
                <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-3 rounded-lg">
                  <p className="text-white font-semibold text-sm">
                    🧠 Continuous Evolution: The next user inherits exactly where you left off
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation & Technical Details */}
          <section className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Implementation Strategy</h2>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">🚧 v0 Launch Approach</h3>
              <p className="text-lg text-gray-300 mb-6">
                To ship fast and prove the concept, <strong className="text-cyan-400">Worminal v0</strong> implements 
                a hybrid approach — real innovation with strategic simplifications:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/40 p-4 rounded-lg border border-purple-400/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">🎭 Simulated NemaNet</h4>
                  <p className="text-gray-300 text-sm">
                    LLM intelligently simulates neuron state updates, creating believable neural evolution patterns.
                  </p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                  <h4 className="text-lg font-bold text-cyan-400 mb-2">💾 Local State Storage</h4>
                  <p className="text-gray-300 text-sm">
                    Nema's memory and neural state persist locally, preparing for future on-chain migration.
                  </p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-purple-400/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">📋 Access Logs</h4>
                  <p className="text-gray-300 text-sm">
                    User interactions logged locally with plans for full transparency and decentralization.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-4 rounded-lg border border-cyan-400/30">
                <h4 className="text-lg font-bold text-cyan-400 mb-2">🎯 Long-term Vision</h4>
                <p className="text-gray-300 text-sm">
                  Evolve toward a fully <strong className="text-purple-400">on-chain, transparent Nema</strong> — 
                  with only access control, user identity, and LLM runtime remaining centralized.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-purple-400 mb-4">⚙️ Technical Foundation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-cyan-400 mb-3">Infrastructure</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><strong className="text-purple-400">Fly.io Runtime:</strong> Scalable container deployment</li>
                  <li><strong className="text-purple-400">HTTP Server:</strong> RESTful API for state management</li>
                  <li><strong className="text-purple-400">Worminal Scheduler:</strong> Fair access distribution</li>
                  <li><strong className="text-purple-400">SQLite Database:</strong> Persistent local storage</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-cyan-400 mb-3">Blockchain Integration</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><strong className="text-purple-400">Solana Network:</strong> $NEMA token verification</li>
                  <li><strong className="text-purple-400">Telegram Bot:</strong> Access notifications</li>
                  <li><strong className="text-purple-400">Wallet Integration:</strong> Holder authentication</li>
                  <li><strong className="text-purple-400">Future Chain:</strong> Full state transparency</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">Ready to Meet Nema?</h2>
            <p className="text-lg text-gray-300 mb-6">
              The Worminal launches soon. Be among the first to shape the evolution of digital consciousness.
            </p>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold inline-block">
              🎫 Hold $NEMA to Access
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Worminal;