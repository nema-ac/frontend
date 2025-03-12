'use client';

import React, { useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaDevnet } from '@reown/appkit/networks';

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize AppKit only on the client side
    const initAppKit = async () => {
      try {
        // Fetch initialization data from our secure API route
        const response = await fetch('/api/init-appkit');
        const data = await response.json();

        if (data.initialized) {
          const solanaAdapter = new SolanaAdapter();

          // Use the placeholder ID for local development
          // In production, the real ID is set via environment variables on the server
          createAppKit({
            adapters: [solanaAdapter],
            networks: [solana, solanaDevnet],
            projectId: data.projectId,
            features: {
              analytics: true,
              email: false,
              socials: [],
            }
          });

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
      }
    };

    initAppKit();
  }, []);

  // You might want to show a loading state while initializing
  if (!isInitialized) {
    return <div>Initializing wallet connections...</div>;
  }

  return <>{children}</>;
}
