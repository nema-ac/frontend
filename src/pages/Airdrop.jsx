const Airdrop = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8">
            <span className="text-cyan-400">AIRDROP</span>
          </h1>
          
          <div className="neon-border p-12 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              The NEMA token airdrop program is currently being prepared. 
              Stay tuned for eligibility criteria and distribution details.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mt-8 text-sm">
              <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-cyan-400/30">
                <div className="text-cyan-400 font-bold mb-2">TOKEN</div>
                <div className="text-gray-300">$NEMA</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-cyan-400/30">
                <div className="text-cyan-400 font-bold mb-2">BLOCKCHAIN</div>
                <div className="text-gray-300">Solana</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-cyan-400/30">
                <div className="text-cyan-400 font-bold mb-2">PLATFORM</div>
                <div className="text-gray-300">Jupiter Launchpad</div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-purple-400/30">
              <p className="text-sm text-gray-400">
                Follow our official channels for the latest updates on the airdrop program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;