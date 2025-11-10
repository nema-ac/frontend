import { createContext, useContext } from 'react';
import { useWorminalAccess } from '../hooks/useWorminalAccess.js';

/**
 * WorminalAccessContext provides a shared instance of useWorminalAccess
 * to prevent duplicate polling when multiple components need access state
 */
const WorminalAccessContext = createContext(null);

export const WorminalAccessProvider = ({ children }) => {
  const accessData = useWorminalAccess();

  return (
    <WorminalAccessContext.Provider value={accessData}>
      {children}
    </WorminalAccessContext.Provider>
  );
};

export const useWorminalAccessContext = () => {
  const context = useContext(WorminalAccessContext);
  if (!context) {
    throw new Error('useWorminalAccessContext must be used within WorminalAccessProvider');
  }
  return context;
};

