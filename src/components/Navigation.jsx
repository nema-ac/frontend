import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import WalletButton from './WalletButton';
import BuyTokenButton from './BuyTokenButton';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-nema-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:justify-between">
          {/* Mobile: Logo */}
          <div className="lg:hidden">
            <Link to="/" className="flex items-center">
              <img
                src="/mobile-nema-logo.png"
                alt="NEMA"
                className="object-contain"
                style={{ height: 48, width: 48 }}
              />
            </Link>
          </div>

          {/* Mobile: Wallet + Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <WalletButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-nema-secondary hover:text-nema-cyan focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop: Logo */}
          <div className="hidden lg:block">
            <Link to="/" className="flex items-center">
              <img
                src="/nema-lab-logo.png"
                alt="NEMA LAB Logo"
                className="object-contain"
                style={{ height: 40, width: 'auto' }}
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 font-anonymous">
            <Link
              to="/"
              className={`text-xl font-medium transition-colors duration-200 hover:text-nema-cyan ${
                location.pathname === '/'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
              }`}
            >
              Worminal
            </Link>
            <Link
              to="/about"
              className={`text-xl font-medium transition-colors duration-200 hover:text-nema-cyan ${
                location.pathname === '/about'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
              }`}
            >
              About
            </Link>
            <Link
              to="/roadmap"
              className={`text-xl font-medium transition-colors duration-200 hover:text-nema-cyan ${
                location.pathname === '/roadmap'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
              }`}
            >
              Roadmap
            </Link>
            <Link
              to="/airdrop"
              className={`text-xl font-medium transition-colors duration-200 hover:text-nema-cyan ${
                location.pathname === '/airdrop'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
              }`}
            >
              Token
            </Link>
          </div>

          {/* Desktop Navigation and Wallet */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Wallet Button */}
            <div className="relative">
              <WalletButton />
            </div>

            {/* Buy Token Button */}
            <BuyTokenButton />
          </div>

        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-nema-black border-t border-nema-secondary">
            <div className="px-4 py-6 space-y-6 font-anonymous">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-nema-cyan ${
                  location.pathname === '/'
                    ? 'text-nema-cyan'
                    : 'text-nema-secondary'
                }`}
              >
                Worminal
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-nema-cyan ${location.pathname === '/about'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
                  }`}
              >
                About
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-nema-cyan ${location.pathname === '/roadmap'
                  ? 'text-nema-cyan'
                  : 'text-nema-secondary'
                  }`}
              >
                Roadmap
              </Link>
              <Link
                to="/airdrop"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-nema-cyan ${
                  location.pathname === '/airdrop'
                    ? 'text-nema-cyan'
                    : 'text-nema-secondary'
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
