/**
 * ViewSelector component - Dropdown for switching between public and personal nema views
 * Similar to Nema selector styling
 */

import { useState, useRef, useEffect } from 'react';

const ViewSelector = ({
  selectedNemaId,
  nemas = [],
  onViewChange,
  showPublicOption = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Build views array: one option per nema + public worminal (if allowed)
  const nemaViews = nemas.map(nema => ({
    id: `nema-${nema.id}`,
    nemaId: nema.id,
    label: nema.name.toUpperCase(),
    description: nema.description || 'Your private conversation',
    avatar: nema.avatar_encoded,
    isPublic: false
  }));

  const publicView = {
    id: 'public',
    label: 'PUBLIC WORMINAL',
    description: 'Live global worminal feed',
    isPublic: true
  };

  const views = [
    ...nemaViews,
    ...(showPublicOption ? [publicView] : [])
  ];

  // Find current view based on selectedNemaId (null = public)
  const currentView = selectedNemaId
    ? views.find(v => v.nemaId === selectedNemaId)
    : views.find(v => v.isPublic);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-nema-black/50 border border-nema-gray rounded px-3 py-2 hover:border-nema-secondary transition-colors cursor-pointer"
        >
          <span className="text-nema-secondary text-xs sm:text-sm font-anonymous font-bold whitespace-nowrap">
            {currentView?.label}
          </span>
          <svg
            className={`w-3 h-3 text-nema-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-nema-black border border-nema-gray rounded-lg shadow-lg z-50 min-w-64">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => {
                onViewChange(view.nemaId || null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-nema-gray/20 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                currentView?.id === view.id ? 'bg-nema-gray/10' : ''
              }`}
            >
              {view.avatar && (
                <img
                  src={view.avatar}
                  alt={`${view.label} Avatar`}
                  className="w-8 h-8 rounded-full border-2 border-nema-secondary"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              <div className="flex-1">
                <div className="text-nema-white font-bold text-sm">{view.label}</div>
                <div className="text-nema-gray-darker text-xs">{view.description}</div>
              </div>
              {currentView?.id === view.id && (
                <svg className="w-5 h-5 text-nema-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
