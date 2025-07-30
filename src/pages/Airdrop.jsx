const Airdrop = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8">
            <span className="text-cyan-400">AIRDROP</span>
          </h1>
          
          <div className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <div className="text-6xl mb-6">🪂</div>
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Phased Airdrop Distribution</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              30% of total $NEMA supply will be distributed to the community through a multi-phase airdrop program following Jupiter Studio bonding.
            </p>

            {/* Airdrop Phases */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Distribution Schedule</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-cyan-900/20 to-black/50 rounded-lg border border-cyan-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <div>
                      <div className="text-white font-bold">Phase 1</div>
                      <div className="text-gray-400 text-sm">1 day after bonding</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">5%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-900/20 to-black/50 rounded-lg border border-purple-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div>
                      <div className="text-white font-bold">Phase 2</div>
                      <div className="text-gray-400 text-sm">2 weeks after bonding</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">10%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-900/20 to-black/50 rounded-lg border border-orange-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <div>
                      <div className="text-white font-bold">Phase 3</div>
                      <div className="text-gray-400 text-sm">2 months after bonding</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">10%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-900/20 to-black/50 rounded-lg border border-green-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <div className="text-white font-bold">Loyalty Bonus</div>
                      <div className="text-gray-400 text-sm">3 months after bonding</div>
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
                <div className="text-white text-lg font-bold">30% of Supply</div>
                <div className="text-gray-400 text-sm">30M $NEMA tokens</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-purple-400/30">
                <div className="text-purple-400 font-bold mb-2">Loyalty Bonus</div>
                <div className="text-white text-lg font-bold">Hold to Earn</div>
                <div className="text-gray-400 text-sm">Extra 5% for 3-month holders</div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-6 rounded-lg border border-cyan-400/20">
              <h4 className="text-lg font-bold text-cyan-400 mb-3">Important Details</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
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
  );
};

export default Airdrop;