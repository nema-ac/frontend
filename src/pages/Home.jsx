import Terminal from '../components/Terminal';
import InteractiveNeuralNetwork from '../components/InteractiveNeuralNetwork';
import NeuralDashboard from '../components/NeuralDashboard';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-cyan-400">NEMΔ</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl mb-8 text-gray-300">
              302 neurons. Infinite possibilities. One NEMΔ
            </h2>
            
            {/* Contract Address */}
            <div className="bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 mb-8 max-w-full mx-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-400 text-sm whitespace-nowrap">CA:</span>
                  <span className="text-cyan-400 font-mono text-xs sm:text-sm font-bold truncate">
                    5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups
                  </span>
                </div>
                <button 
                onClick={() => navigator.clipboard.writeText('5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups')}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Terminal Component */}
          <div className="mb-16">
            <Terminal />
          </div>

          {/* Navigation Buttons */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row gap-4 max-w-6xl mx-auto">
              {/* Worminal Button */}
              <Link to="/worminal" className="w-full sm:flex-1 group">
                <div className="neon-border bg-black/50 rounded px-6 py-5 group-hover:bg-black/70 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-cyan-400 group-hover:text-white transition-colors duration-300">
                        WORMINAL
                      </h3>
                      <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-400/30">
                        LIVE
                      </span>
                    </div>
                    <div className="text-cyan-400 group-hover:text-white transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Airdrop Button */}
              <Link to="/airdrop" className="w-full sm:flex-1 group">
                <div className="neon-border bg-black/50 rounded px-6 py-5 group-hover:bg-black/70 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-cyan-400 group-hover:text-white transition-colors duration-300">
                        AIRDROP
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        COMING SOON
                      </span>
                    </div>
                    <div className="text-cyan-400 group-hover:text-white transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Interactive Neural Network */}
          <div className="mb-16">
            <InteractiveNeuralNetwork />
          </div>

          {/* Neural Dashboard */}
          <div className="mb-16">
            <NeuralDashboard />
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;