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
    <div className="h-screen flex flex-col pt-16 max-lg:overflow-y-auto lg:overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex-1 flex flex-col min-h-0 pb-4">
        {/* Header Section - 3 Columns on desktop, stacked on mobile */}
        <div className="mb-2 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-2 flex-shrink-0">
          {/* Column 1: WORMINAL */}
          <div className="lg:border border-nema-gray p-3 max-lg:p-2 flex items-center justify-center">
            <h1 className="nema-display nema-display-2 max-lg:nema-header-2 text-nema-white">
              WORMINAL
            </h1>
          </div>

          {/* Column 2: Description */}
          <div className="max-lg:hidden lg:border border-nema-gray p-3">
            <p className="text-nema-white font-anonymous text-sm leading-relaxed">
              Use this interface to chat with NEMA's neural substrate. A 302-neuron C. elegans connectome fused with advanced language processing. Every interaction shapes the neural state and contributes to the organism's continuous evolution.
            </p>
          </div>

          {/* Column 3: NEMA (rotated 90 degrees left) - hidden on mobile */}
          <div className="max-lg:hidden border border-nema-gray p-3 flex items-center justify-center">
            <h1 className="nema-display nema-header-2 text-nema-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              NEMA
            </h1>
          </div>
        </div>

        {/* Interactive Terminal */}
        <div className="flex-1 min-h-0 flex flex-col">
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
