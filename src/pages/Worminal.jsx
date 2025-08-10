import InteractiveTerminal from '../components/InteractiveTerminal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const Worminal = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-cyan-400">WORMINAL</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-8">
            Direct neural interface to NEMA. Chat with the evolving digital organism through this retro terminal.
          </p>
          
          {/* Quick Instructions */}
          <div className="bg-black/50 border border-cyan-400/30 rounded-lg p-4 max-w-4xl mx-auto text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-cyan-400 font-semibold">Commands:</span> 
                <span className="text-gray-300"> Type "help" for available commands</span>
              </div>
              <div>
                <span className="text-green-400 font-semibold">Chat:</span> 
                <span className="text-gray-300"> Simply type a message to talk to NEMA</span>
              </div>
              <div>
                <span className="text-purple-400 font-semibold">Shortcuts:</span> 
                <span className="text-gray-300"> Ctrl+L (clear), ↑/↓ (history)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Terminal */}
        <div className="mb-16">
          <ErrorBoundary>
            <InteractiveTerminal />
          </ErrorBoundary>
        </div>

        {/* Footer Info */}
        <div className="text-center mb-16">
          <div className="neon-border bg-gradient-to-br from-purple-900/20 to-black/50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">About This Interface</h3>
            <p className="text-gray-300 mb-4">
              You're connected to NEMA's neural substrate - a 348-neuron C. elegans connectome fused with 
              advanced language processing. Every interaction shapes the neural state and contributes to 
              the organism's continuous evolution.
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-400">Neural Network Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-gray-400">Memory Persistent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-gray-400">Evolution Continuous</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Worminal;