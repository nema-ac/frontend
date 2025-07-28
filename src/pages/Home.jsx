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
          <div className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h3 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Launch Details & Tokenomics</h3>
            
            {/* Basic Launch Info */}
            <div className="grid sm:grid-cols-3 gap-6 text-lg mb-8">
              <div className="text-center">
                <div className="text-purple-400 font-bold">Platform</div>
                <div className="text-gray-300">Jupiter Launchpad</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">Blockchain</div>
                <div className="text-gray-300">Solana</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">Token</div>
                <div className="text-gray-300">$NEMA</div>
              </div>
            </div>

            {/* Token Economics */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Supply & Market Cap */}
              <div className="bg-black/30 p-6 rounded-lg border border-cyan-400/20">
                <h4 className="text-xl font-bold text-cyan-400 mb-4">Token Supply</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Supply</span>
                    <span className="text-white font-bold">100M $NEMA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Initial Market Cap</span>
                    <span className="text-purple-400 font-bold">$200K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Graduation Target</span>
                    <span className="text-cyan-400 font-bold">$1M</span>
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div className="bg-black/30 p-6 rounded-lg border border-purple-400/20">
                <h4 className="text-xl font-bold text-purple-400 mb-4">Fee Structure</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Trading Fee</span>
                    <span className="text-white font-bold">1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">• Developer Fund</span>
                    <span className="text-cyan-400">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">• Dev Wallets</span>
                    <span className="text-purple-400">75%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="mt-8">
              <h4 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Token Allocation</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-900/30 to-black/50 p-4 rounded-lg border border-cyan-400/30 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">40%</div>
                  <div className="text-sm text-gray-300 mb-1">Open Supply</div>
                  <div className="text-xs text-gray-500">Tradeable at launch</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-black/50 p-4 rounded-lg border border-purple-400/30 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">30%</div>
                  <div className="text-sm text-gray-300 mb-1">Airdrop</div>
                  <div className="text-xs text-gray-500">Dropped after bonding</div>
                </div>
                <div className="bg-gradient-to-br from-orange-900/30 to-black/50 p-4 rounded-lg border border-orange-400/30 text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">20%</div>
                  <div className="text-sm text-gray-300 mb-1">Liquidity Pool</div>
                  <div className="text-xs text-gray-500">Market stability</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-black/50 p-4 rounded-lg border border-green-400/30 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">10%</div>
                  <div className="text-sm text-gray-300 mb-1">Team</div>
                  <div className="text-xs text-gray-500">12-month linear vest</div>
                </div>
              </div>
            </div>

            {/* Vesting Schedule */}
            <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-4 rounded-lg border border-cyan-400/20">
              <h5 className="text-lg font-bold text-cyan-400 mb-2">Team Vesting Schedule</h5>
              <p className="text-gray-300 text-sm">
                Team allocation vests linearly over 12 months with weekly releases, ensuring long-term alignment 
                and sustainable tokenomics. Any leftover team funds remain locked under the same schedule.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;