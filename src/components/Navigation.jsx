import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import WalletButton from './WalletButton';
import BuyTokenButton from './BuyTokenButton';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-nema-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 gap-3">
          {/* Mobile: Logo */}
          <div className="md:hidden">
            <Link to="/" className="flex items-center">
              <img
                src="/mobile-nema-logo.png"
                alt="NEMA"
                className="object-contain"
                style={{ height: 28, width: 28 }}
              />
            </Link>
          </div>

          {/* Desktop: Logo */}
          <div className="hidden md:block flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/nema-lab-logo.png"
                alt="NEMA LAB Logo"
                className="object-contain"
                style={{ height: 24, width: 'auto' }}
              />
            </Link>
          </div>

          {/* Navigation Links - Show on md and up */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5 flex-1 justify-center min-w-0">
            {/* Always visible: Worminal and Gallery */}
            <Link
              to="/"
              className={`nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${location.pathname === '/'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                }`}
            >
              Worminal
              <span className="nav-badge-new">NEW</span>
            </Link>
            <Link
              to="/gallery"
              className={`nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${location.pathname === '/gallery'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                }`}
            >
              Gallery
              <span className="nav-badge-new">NEW</span>
            </Link>
            
            {/* Show on xl and up, hide on md/lg */}
            <Link
              to="/about"
              className={`hidden xl:block nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${location.pathname === '/about'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                }`}
            >
              About
            </Link>
            <Link
              to="/roadmap"
              className={`hidden xl:block nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${location.pathname === '/roadmap'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                }`}
            >
              Roadmap
            </Link>
            <Link
              to="/airdrop"
              className={`hidden xl:block nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${location.pathname === '/airdrop'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                }`}
            >
              Token
            </Link>
            
            {/* Dropdown menu button for md/lg screens */}
            <div ref={dropdownRef} className="xl:hidden relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`nav-link nema-display nema-header-2 transition-all duration-200 whitespace-nowrap ${isDropdownOpen || ['/about', '/roadmap', '/airdrop'].includes(location.pathname)
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                  }`}
              >
                More
                <svg 
                  className={`w-3 h-3 ml-1 inline-block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-nema-black border border-nema-gray shadow-lg z-50 min-w-[120px]">
                  <div className="py-2">
                    <Link
                      to="/about"
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                      className={`nav-link nav-link-dropdown nema-display nema-header-2 transition-all duration-200 block ${location.pathname === '/about'
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                        }`}
                    >
                      About
                    </Link>
                    <Link
                      to="/roadmap"
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                      className={`nav-link nav-link-dropdown nema-display nema-header-2 transition-all duration-200 block ${location.pathname === '/roadmap'
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                        }`}
                    >
                      Roadmap
                    </Link>
                    <Link
                      to="/airdrop"
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                      className={`nav-link nav-link-dropdown nema-display nema-header-2 transition-all duration-200 block ${location.pathname === '/airdrop'
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                        }`}
                    >
                      Token
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side buttons - Show on md and up */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Wallet Button */}
            <div className="relative">
              <WalletButton />
            </div>

            {/* Buy Token Button */}
            <BuyTokenButton />
          </div>

          {/* Mobile: Wallet + Menu */}
          <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
            <WalletButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-nema-secondary hover:text-nema-cyan focus:outline-none cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-nema-black border-t border-nema-secondary">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link nav-link-mobile nema-display nema-header-2 transition-all duration-200 ${location.pathname === '/'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                  }`}
              >
                Worminal
                <span className="nav-badge-new">NEW</span>
              </Link>
              <Link
                to="/gallery"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link nav-link-mobile nema-display nema-header-2 transition-all duration-200 ${location.pathname === '/gallery'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                  }`}
              >
                Gallery
                <span className="nav-badge-new">NEW</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link nav-link-mobile nema-display nema-header-2 transition-all duration-200 ${location.pathname === '/about'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                  }`}
              >
                About
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link nav-link-mobile nema-display nema-header-2 transition-all duration-200 ${location.pathname === '/roadmap'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
                  }`}
              >
                Roadmap
              </Link>
              <Link
                to="/airdrop"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link nav-link-mobile nema-display nema-header-2 transition-all duration-200 ${location.pathname === '/airdrop'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                  }`}
              >
                Token
              </Link>
              <div className="pt-4 border-t border-nema-secondary">
                <BuyTokenButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
