import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-cyan-400/30 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size={40} />
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <a 
              href="https://t.me/deepwormportal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.618-1.407 3.068-2.896 1.518l-3.814-2.812-1.842 1.822c-.2.2-.373.373-.766.373l.274-3.908 7.064-6.391c.308-.274-.067-.427-.477-.153l-8.756 5.519-3.78-1.181c-.821-.256-.836-.821.171-1.218L16.9 7.458c.682-.256 1.279.153 1.057 1.218l-.389-.516z"/>
              </svg>
              <span>Telegram</span>
            </a>
            
            <a 
              href="https://x.com/Nema_Lab" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Twitter</span>
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-gray-500 text-sm text-center">
            <p>Made with ❤️ from Nema Lab</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;