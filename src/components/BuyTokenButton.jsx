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
      className={`px-3 py-1.5 text-xs bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-all duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
        !isLoaded && 'bg-gray-700 text-gray-400'
      }`}
    >
      <span>{isLoaded ? 'Buy $NEMA' : 'Loading...'}</span>
      {isLoaded && (
        <img
          src="/jupiter-logo.webp"
          alt="Jupiter"
          className="w-3 h-3"
        />
      )}
    </button>
  );
};

export default BuyTokenButton;
