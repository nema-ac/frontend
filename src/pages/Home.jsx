import Terminal from '../components/Terminal';
import InteractiveNeuralNetwork from '../components/InteractiveNeuralNetwork';
import NeuralDashboard from '../components/NeuralDashboard';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-cyan-400">NEMA</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl mb-8 text-gray-300">
              The Evolution of Digital Life
            </h2>
          </div>

          {/* Terminal Component */}
          <div className="mb-16">
            <Terminal />
          </div>

          {/* Interactive Neural Network */}
          <div className="mb-16">
            <InteractiveNeuralNetwork />
          </div>

          {/* Neural Dashboard */}
          <div className="mb-16">
            <NeuralDashboard />
          </div>

          {/* Launch Information */}
          <div className="text-center neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h3 className="text-3xl font-bold text-cyan-400 mb-4">Launch Details</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-lg">
              <div>
                <div className="text-purple-400 font-bold">Platform</div>
                <div className="text-gray-300">Jupiter Launchpad</div>
              </div>
              <div>
                <div className="text-purple-400 font-bold">Blockchain</div>
                <div className="text-gray-300">Solana</div>
              </div>
              <div>
                <div className="text-purple-400 font-bold">Token</div>
                <div className="text-gray-300">$NEMA</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;