import { useEffect, useState, useCallback } from 'react';

const BuyTokenButton = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if Jupiter widget is loaded
  useEffect(() => {
    let intervalId;
    if (!isLoaded) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter?.init));
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded]);

  // Launch widget modal
  const launchWidget = useCallback(() => {
    if (window.Jupiter?.init) {
      // Create a new Jupiter instance in widget mode
      window.Jupiter.init({
        displayMode: 'modal',
        formProps: {
          initialInputMint: "So11111111111111111111111111111111111111112",
          initialOutputMint: "5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups",
        },
      });
    }
  }, []);

  return (
    <button
      onClick={launchWidget}
      disabled={!isLoaded}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        isLoaded 
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg cursor-pointer' 
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
      }`}
    >
      <img
        src="/jupiter-logo.webp"
        alt="Jupiter"
        className="w-4 h-4 object-contain"
      />
      <span>
        {isLoaded ? 'Buy $NEMA' : 'Loading...'}
      </span>
    </button>
  );
};

export default BuyTokenButton;