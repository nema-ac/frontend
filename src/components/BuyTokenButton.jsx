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
      className={`px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-all duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
        !isLoaded && 'bg-gray-700 text-gray-400'
      }`}
    >
      <span>{isLoaded ? 'Buy $NEMA' : 'Loading...'}</span>
      {isLoaded && (
        <img
          src="/jupiter-logo.webp"
          alt="Jupiter"
          className="w-4 h-4"
        />
      )}
    </button>
  );
};

export default BuyTokenButton;
