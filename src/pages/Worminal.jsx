import InteractiveTerminal from '../components/InteractiveTerminal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import EmotionVisualization from '../components/EmotionVisualization.jsx';

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

        {/* Emotion Visualization */}
        <div className="mb-16">
          <ErrorBoundary>
            <EmotionVisualization 
              neuralStates={[
                // Sample neural states with more comprehensive neuron data
                {
                  motorNeurons: { 
                    N_AVAL: 45, N_AVAR: 50, N_AVBL: -20, N_AVBR: -15, 
                    MVL01: 30, MVR01: 35, MVL02: 25, MVR02: 40,
                    N_RIAL: 35, N_RIAR: 30, N_RMGL: 20, N_RMGR: 25
                  },
                  sensoryNeurons: { 
                    N_AWAL: 60, N_AWAR: 55, N_AWCL: 40, N_AWCR: 45, 
                    N_ASHL: 10, N_ASHR: 15, N_ASEL: 30, N_ASER: 35,
                    N_AFDL: 25, N_AFDR: 20, N_AQR: 15, N_PQR: 18,
                    N_NSML: 40, N_NSMR: 35, N_ADFL: 50, N_ADFR: 45
                  }
                },
                {
                  motorNeurons: { 
                    N_AVAL: 60, N_AVAR: 65, N_AVBL: -5, N_AVBR: -10, 
                    MVL01: 50, MVR01: 55, MVL02: 45, MVR02: 50,
                    N_RIAL: 45, N_RIAR: 40, N_RMGL: 30, N_RMGR: 35
                  },
                  sensoryNeurons: { 
                    N_AWAL: 80, N_AWAR: 75, N_AWCL: 60, N_AWCR: 65, 
                    N_ASHL: 5, N_ASHR: 8, N_ASEL: 40, N_ASER: 45,
                    N_AFDL: 35, N_AFDR: 30, N_AQR: 25, N_PQR: 28,
                    N_NSML: 20, N_NSMR: 15, N_ADFL: 30, N_ADFR: 25
                  }
                },
                {
                  motorNeurons: { 
                    N_AVAL: 20, N_AVAR: 15, N_AVBL: -40, N_AVBR: -35, 
                    MVL01: 10, MVR01: 15, MVL02: 5, MVR02: 10,
                    N_RIAL: 15, N_RIAR: 10, N_RMGL: 5, N_RMGR: 8
                  },
                  sensoryNeurons: { 
                    N_AWAL: 30, N_AWAR: 25, N_AWCL: 20, N_AWCR: 15, 
                    N_ASHL: 40, N_ASHR: 45, N_ASEL: 10, N_ASER: 15,
                    N_AFDL: 5, N_AFDR: 8, N_AQR: 3, N_PQR: 5,
                    N_NSML: 60, N_NSMR: 65, N_ADFL: 70, N_ADFR: 75
                  }
                }
              ]}
              timestamps={['Exploration', 'Excitement', 'Rest']}
            />
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