"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface ConnectWalletProps {
  onConnect: (address: string) => void;
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // TODO: Replace with actual wallet connection
      // Simulating wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = '5KoP...xyz'; // This will be replaced with actual wallet address
      onConnect(mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-light-green border border-matrix-green/50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
