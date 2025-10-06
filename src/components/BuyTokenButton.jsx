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
      className={`px-8 py-2 rounded-lg font-anonymous text-base transition-colors ${
        isLoaded
          ? 'bg-nema-button-500 text-nema-white hover:bg-nema-button-600 cursor-pointer'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isLoaded ? 'Buy $NEMA' : 'Loading...'}
    </button>
  );
};

export default BuyTokenButton;
