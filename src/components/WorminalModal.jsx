import { useEffect } from 'react';
import InteractiveTerminal from './InteractiveTerminal';

const WorminalModal = ({ isOpen, onClose }) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full h-full max-w-none max-h-none p-4 lg:p-8 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-cyan-400">WORMINAL - Fullscreen Mode</h2>
            <div className="text-sm text-gray-400">Press ESC or click × to exit</div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors duration-200"
            title="Exit fullscreen (ESC)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fullscreen Terminal Container */}
        <div className="flex-1 min-h-0">
          <div className="h-full">
            <InteractiveTerminal 
              isFullscreen={true} 
              onToggleFullscreen={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorminalModal;