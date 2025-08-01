const Airdrop = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-12">
            <span className="text-cyan-400">TOKENOMICS & AIRDROP</span>
          </h1>
          
          {/* Combined Tokenomics & Airdrop Section */}
          <div className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Launch Details, Tokenomics & Airdrop</h2>
            
            {/* Basic Launch Info */}
            <div className="grid sm:grid-cols-3 gap-6 text-lg mb-8">
              <div className="text-center">
                <div className="text-purple-400 font-bold mb-2">Platform</div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <img 
                    src="/jupiter-logo.webp" 
                    alt="Jupiter Logo" 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-gray-300">Jupiter Studio</span>
                </div>
                <a 
                  href="https://lfg.jup.ag/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-orange-400 hover:opacity-80 transition-colors underline"
                >
                  Visit Launchpad →
                </a>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold mb-2">Blockchain</div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <img 
                    src="/solana-logo.png" 
                    alt="Solana Logo" 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-gray-300">Solana</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold mb-2">Token</div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <img 
                    src="/nema-logo.svg" 
                    alt="NEMA Logo" 
                    className="w-6 h-6 object-cover rounded-full"
                  />
                  <span className="text-gray-300">$NEMA</span>
                </div>
              </div>
            </div>

            {/* Token Economics */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Supply & Market Cap */}
              <div className="bg-black/30 p-6 rounded-lg border border-cyan-400/20">
                <h4 className="text-xl font-bold text-cyan-400 mb-4">Token Supply</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Supply</span>
                    <span className="text-white font-bold">1B $NEMA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Initial Market Cap</span>
                    <span className="text-purple-400 font-bold">$20K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bonding Target</span>
                    <span className="text-cyan-400 font-bold">$500K</span>
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div className="bg-black/30 p-6 rounded-lg border border-purple-400/20">
                <h4 className="text-xl font-bold text-purple-400 mb-4">Contract Address</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">CA</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText('5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups')}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2">
                      <span className="text-cyan-400 font-mono text-xs sm:text-sm font-bold break-all">
                        5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Chart</span>
                    <a 
                      href="https://dexscreener.com/solana/4nyhzno8noeabnj9fgmsk7ympxgssacqswjuhrg3xucz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 transition-colors underline font-bold"
                    >
                      Dexscreener →
                    </a>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Token is live on Solana. Click chart link to view trading data.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Token Allocation</h4>
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-900/30 to-black/50 p-4 rounded-lg border border-cyan-400/30 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">60%</div>
                  <div className="text-sm text-gray-300 mb-1">Token Launch</div>
                  <div className="text-xs text-gray-500">Jupiter Studio launch</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-black/50 p-4 rounded-lg border border-purple-400/30 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">30%</div>
                  <div className="text-sm text-gray-300 mb-1">Airdrop</div>
                  <div className="text-xs text-gray-500">Post bonding distribution</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-black/50 p-4 rounded-lg border border-green-400/30 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">10%</div>
                  <div className="text-sm text-gray-300 mb-1">Team</div>
                  <div className="text-xs text-gray-500">12-month linear vest</div>
                </div>
              </div>
            </div>

            {/* Team Vesting Schedule */}
            <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-4 rounded-lg border border-nema-cyan/20">
              <h5 className="text-lg font-bold text-cyan-400 mb-2">Team Vesting Schedule</h5>
              <p className="text-sm text-gray-300">
                Team allocation vests linearly over 12 months with weekly releases, ensuring long-term alignment 
                and sustainable tokenomics. Any leftover team funds remain locked under the same schedule.
              </p>
            </div>

            {/* Airdrop Section */}
            <div className="border-t border-gray-700 pt-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-6">🪂</div>
                <h3 className="text-3xl font-bold text-cyan-400 mb-6">Phased Airdrop Distribution</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  300M $NEMA tokens will be distributed to the community through a multi-phase airdrop program following Jupiter Studio bonding.
                </p>
              </div>

              {/* Airdrop Phases */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xl font-bold text-purple-400 mb-4">Distribution Schedule</h4>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-cyan-900/20 to-black/50 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">Phase 1</div>
                        <div className="text-sm text-gray-400">1 day after bonding</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">5%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-900/20 to-black/50 rounded-lg border border-purple-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">Phase 2</div>
                        <div className="text-sm text-gray-400">2 weeks after bonding</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">10%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-900/20 to-black/50 rounded-lg border border-orange-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">Phase 3</div>
                        <div className="text-sm text-gray-400">2 months after bonding</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">10%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-900/20 to-black/50 rounded-lg border border-green-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">Loyalty Bonus</div>
                        <div className="text-sm text-gray-400">3 months after bonding</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">5%</div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-cyan-400/30">
                  <div className="text-cyan-400 font-bold mb-2">Total Airdrop</div>
                  <div className="text-lg text-white font-bold">30% of Supply</div>
                  <div className="text-sm text-gray-400">300M $NEMA tokens</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-purple-400/30">
                  <div className="text-purple-400 font-bold mb-2">Loyalty Bonus</div>
                  <div className="text-lg text-white font-bold">Hold to Earn</div>
                  <div className="text-sm text-gray-400">Extra 5% for 3-month holders</div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-6 rounded-lg border border-cyan-400/20">
                <h4 className="text-lg font-bold text-cyan-400 mb-3">Important Details</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Airdrop begins after Jupiter Studio bonding is complete</li>
                  <li>• Loyalty bonus requires continuous holding from bonding to 3 months</li>
                  <li>• Distribution details and eligibility criteria will be announced</li>
                  <li>• Follow official channels for updates and claim instructions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;