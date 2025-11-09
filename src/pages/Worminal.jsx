import { useState } from 'react';
import InteractiveTerminal from '../components/InteractiveTerminal.jsx';
import WorminalModal from '../components/WorminalModal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import UserChat from '../components/UserChat.jsx';

const Worminal = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileView, setMobileView] = useState('worminal'); // 'worminal' or 'chat'

  const handleToggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div className={`h-screen flex flex-col pt-14 ${mobileView === 'chat' ? 'max-lg:overflow-hidden' : 'max-lg:overflow-y-auto'} lg:overflow-hidden`}>
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex-1 flex flex-col min-h-0 ${mobileView === 'chat' ? 'max-lg:pb-0' : 'pb-4'}`}>
        {/* Header Section - 3 Columns on desktop, stacked on mobile */}
        <div className="mb-2 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-2 flex-shrink-0">
          {/* Column 1: WORMINAL / Mobile View Selector */}
          <div className="lg:border border-nema-gray p-2 max-lg:p-1.5 flex items-center justify-center">
            {/* Desktop: Show WORMINAL text */}
            <h1 className="hidden lg:block nema-display nema-display-2 text-nema-white text-xl">
              WORMINAL
            </h1>

            {/* Mobile: Show view selector */}
            <div className="lg:hidden flex items-center gap-1 w-full">
              <button
                onClick={() => setMobileView('worminal')}
                className={`flex-1 py-1.5 px-2 border transition-colors ${mobileView === 'worminal'
                  ? 'border-nema-cyan bg-nema-cyan/10 text-nema-cyan'
                  : 'border-nema-gray text-nema-gray-darker hover:border-nema-gray-darker'
                  }`}
              >
                <span className="nema-display nema-header-2 text-xs">WORMINAL</span>
              </button>
              <button
                onClick={() => setMobileView('chat')}
                className={`flex-1 py-1.5 px-2 border transition-colors ${mobileView === 'chat'
                  ? 'border-nema-cyan bg-nema-cyan/10 text-nema-cyan'
                  : 'border-nema-gray text-nema-gray-darker hover:border-nema-gray-darker'
                  }`}
              >
                <span className="nema-display nema-header-2 text-xs">CHAT</span>
              </button>
            </div>
          </div>

          {/* Column 2: Description */}
          <div className="max-lg:hidden lg:border border-nema-gray p-2">
            <p className="text-nema-white font-anonymous text-xs leading-relaxed">
              Use this interface to chat with NEMA's neural substrate. A 302-neuron C. elegans connectome fused with advanced language processing. Every interaction shapes the neural state and contributes to the organism's continuous evolution.
            </p>
          </div>

          {/* Column 3: NEMA (rotated 90 degrees left) - hidden on mobile */}
          <div className="max-lg:hidden border border-nema-gray p-2 flex items-center justify-center">
            <h1 className="nema-display nema-header-2 text-nema-white text-xs" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              NEMA
            </h1>
          </div>
        </div>

        {/* Main Content Area - Chat on left, Terminal on right */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-2">
          {/* User Chat - Left Side (hidden on mobile, shown when mobileView === 'chat') */}
          <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex lg:w-80 flex-shrink-0 min-h-0 h-full flex-col`}>
            <ErrorBoundary>
              <UserChat />
            </ErrorBoundary>
          </div>

          {/* Interactive Terminal - Right Side (hidden on mobile when chat is selected) */}
          <div className={`${mobileView === 'worminal' ? 'flex' : 'hidden'} lg:flex flex-1 min-h-0 flex flex-col`}>
            <ErrorBoundary>
              <InteractiveTerminal
                onToggleFullscreen={handleToggleFullscreen}
              />
            </ErrorBoundary>
          </div>
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
