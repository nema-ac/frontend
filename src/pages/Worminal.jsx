import { useState } from 'react';
import InteractiveTerminal from '../components/InteractiveTerminal.jsx';
import WorminalModal from '../components/WorminalModal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const Worminal = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section - 3 Columns on desktop, stacked on mobile */}
        <div className="mb-2 md:grid md:grid-cols-[auto_1fr_auto] md:gap-2">
          {/* Column 1: WORMINAL */}
          <div className="md:border border-nema-gray p-8 max-md:p-2 flex items-center justify-center">
            <h1 className="nema-display nema-display-1 max-md:nema-display-2 text-nema-white">
              WORMINAL
            </h1>
          </div>

          {/* Column 2: Description */}
          <div className="max-md:hidden md:border border-nema-gray p-8">
            <p className="text-nema-white font-anonymous text-base leading-relaxed">
              Use this interface to chat with NEMA's neural substrate.<br />
              A 302-neuron C. elegans connectome fused with advanced language processing.<br/>
              Every interaction shapes the neural state and contributes to the organism's continuous evolution.
            </p>
          </div>

          {/* Column 3: NEMA (rotated 90 degrees left) - hidden on mobile */}
          <div className="max-md:hidden border border-nema-gray p-8 flex items-center justify-center">
            <h1 className="nema-display nema-display-2 text-nema-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              NEMA
            </h1>
          </div>
        </div>

        {/* Interactive Terminal */}
        <div className="mb-8">
          <ErrorBoundary>
            <InteractiveTerminal
              onToggleFullscreen={handleToggleFullscreen}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <WorminalModal
        isOpen={isFullscreen}
        onClose={handleCloseFullscreen}
      />
    </div>
  );
};

export default Worminal;
