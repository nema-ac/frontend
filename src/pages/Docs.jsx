const Docs = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8">
            <span className="text-cyan-400">DOCUMENTATION</span>
          </h1>
          
          <div className="neon-border p-12 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Comprehensive documentation for the NEMA digital biology platform 
              is currently under development. This will include technical specifications, 
              API references, and developer guides for building with NEMA.
            </p>
            
            <div className="mt-8 p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-cyan-400/30">
              <p className="text-sm text-gray-400">
                For now, visit our README and source code for technical details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;