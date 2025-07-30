import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-cyan-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size={36} />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                location.pathname === '/' 
                  ? 'text-cyan-400' 
                  : 'text-gray-300'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                location.pathname === '/about' 
                  ? 'text-cyan-400 ' 
                  : 'text-gray-300'
              }`}
            >
              ABOUT
            </Link>
            <div className="relative">
              <Link
                to="/worminal"
                className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  location.pathname === '/worminal' 
                    ? 'text-cyan-400 ' 
                    : 'text-gray-300'
                }`}
              >
                WORMINAL
              </Link>
              <span className="absolute -top-1 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-bold" style={{transform: 'scale(0.7)'}}>
                SOON
              </span>
            </div>
            <div className="relative">
              <Link
                to="/airdrop"
                className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  location.pathname === '/airdrop' 
                    ? 'text-cyan-400 ' 
                    : 'text-gray-300'
                }`}
              >
                AIRDROP
              </Link>
              <span className="absolute -top-1 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-bold" style={{transform: 'scale(0.7)'}}>
                SOON
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyan-400 focus:outline-none"
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-cyan-400/30">
            <div className="px-4 py-6 space-y-6">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  location.pathname === '/' 
                    ? 'text-cyan-400' 
                    : 'text-gray-300'
                }`}
              >
                HOME
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  location.pathname === '/about' 
                    ? 'text-cyan-400' 
                    : 'text-gray-300'
                }`}
              >
                ABOUT
              </Link>
              <div className="relative block">
                <Link
                  to="/worminal"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg font-medium transition-colors duration-200 hover:text-cyan-400 ${
                    location.pathname === '/worminal' 
                      ? 'text-cyan-400' 
                      : 'text-gray-300'
                  }`}
                >
                  WORMINAL
                </Link>
                <span className="absolute -top-1 left-24 md:-right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-bold" style={{transform: 'scale(0.7)'}}>
                  SOON
                </span>
              </div>
              <div className="relative block">
                <Link
                  to="/airdrop"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg font-medium transition-colors duration-200 hover:text-cyan-400 ${
                    location.pathname === '/airdrop' 
                      ? 'text-cyan-400' 
                      : 'text-gray-300'
                  }`}
                >
                  AIRDROP
                </Link>
                <span className="absolute -top-1 left-20 md:-right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-bold" style={{transform: 'scale(0.7)'}}>
                  SOON
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;