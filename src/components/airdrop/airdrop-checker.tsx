'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkWalletEligibility, linkWalletAddresses, checkWalletLink } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { encode } from '@/lib/utils';
import { PublicKey } from '@solana/web3.js';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { type Provider } from '@reown/appkit-adapter-solana/react';

interface CheckResult {
  isEligible: boolean | null;
  projectedAmount?: number;
  message: string | null;
}

interface AirdropCheckerProps {
  apiBaseUrl: string;
}

export function AirdropChecker({ apiBaseUrl }: AirdropCheckerProps) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { open } = useAppKit();

  // Convert address to PublicKey when needed
  const publicKey = address ? new PublicKey(address) : null;
  const connected = isConnected;

  const [inputAddress, setInputAddress] = useState('');
  const [isSolanaAddressValid, setIsSolanaAddressValid] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState('');
  const [isEthAddressValid, setIsEthAddressValid] = useState(false);
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult>({
    isEligible: null,
    message: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkResult, setLinkResult] = useState<{ success: boolean; message: string | null }>({
    success: false,
    message: null
  });
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkEligibility = useCallback(async (address: string) => {
    setIsChecking(true);
    try {
      const result = await checkWalletEligibility(apiBaseUrl, address);
      setCheckResult({
        isEligible: result.isEligible,
        projectedAmount: result.projectedAmount,
        message: result.message
      });
    } finally {
      setIsChecking(false);
    }
  }, [apiBaseUrl]);

  const checkLink = useCallback(async (address: string) => {
    setIsCheckingLink(true);
    try {
      const result = await checkWalletLink(apiBaseUrl, address);
      if (result.linked && result.eth_address) {
        setEthAddress(result.eth_address);
        setIsWalletLinked(true);
        setIsEthAddressValid(true);
      } else {
        setIsWalletLinked(false);
      }
    } finally {
      setIsCheckingLink(false);
    }
  }, [apiBaseUrl]);

  // Check connected wallet eligibility automatically
  useEffect(() => {
    if (publicKey && connected && !walletAddress) {
      const addressStr = publicKey.toString();
      setInputAddress(addressStr);
      setWalletAddress(addressStr);
      checkEligibility(addressStr);
      checkLink(addressStr);
    }
  }, [publicKey, connected, walletAddress, checkEligibility, checkLink]);

  // If wallet connects and matches the checked address, check for linked status
  useEffect(() => {
    if (publicKey && connected && walletAddress && publicKey.toString() === walletAddress) {
      checkLink(walletAddress);
    }
  }, [publicKey, connected, walletAddress, checkLink]);

  // Validate Solana address
  useEffect(() => {
    try {
      if (inputAddress.trim()) {
        new PublicKey(inputAddress);
        setIsSolanaAddressValid(true);
      } else {
        setIsSolanaAddressValid(false);
      }
    } catch {
      setIsSolanaAddressValid(false);
    }
  }, [inputAddress]);

  // Validate ETH address
  useEffect(() => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(ethAddress);
    setIsEthAddressValid(isValid);
  }, [ethAddress]);

  // Add this useEffect after your other useEffect hooks
  useEffect(() => {
    if (!connected && walletAddress) {
      resetForm();
    }
  }, [connected, walletAddress]);

  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputAddress.trim() || !isSolanaAddressValid) return;

    setWalletAddress(inputAddress);
    await checkEligibility(inputAddress);
  };

  const handleLinkWallets = async () => {
    if (!publicKey || !walletProvider || !ethAddress || !isEthAddressValid) return;

    setIsLinking(true);
    try {
      // Create a message to sign that includes the ETH address
      const message = `I am linking my Solana wallet ${publicKey.toString()} to Ethereum wallet ${ethAddress} for the NEMA airdrop.`;

      // Convert message to Uint8Array for signing
      const messageBytes = new TextEncoder().encode(message);

      // Request wallet to sign the message
      const signature = await walletProvider.signMessage(messageBytes);

      // Convert signature to base64 string for API
      const signatureString = encode(signature);

      // Send to API
      const result = await linkWalletAddresses(
        apiBaseUrl,
        publicKey.toString(),
        ethAddress,
        signatureString,
        message
      );

      if (result.success) {
        setIsWalletLinked(true);
      }

      setLinkResult({
        success: result.success,
        message: result.message
      });

    } catch (error) {
      setLinkResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sign message with wallet'
      });
    } finally {
      setIsLinking(false);
    }
  };

  const resetForm = () => {
    setWalletAddress(null);
    setInputAddress('');
    setEthAddress('');
    setIsWalletLinked(false);
    setCheckResult({ isEligible: null, message: null });
    setLinkResult({ success: false, message: null });
  };

  // Return early with minimal UI if not client-side yet
  if (!isClient) {
    return (
      <Card className="p-6 space-y-6 bg-nema-dark/30 border-nema-midday/30">
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-code text-nema-light text-center sm:text-left">NEMA Airdrop Checker</h1>
          <div className="flex justify-center w-full sm:w-auto">
            {/* Placeholder for wallet button */}
            <div className="h-10 w-32 bg-nema-dark/50 rounded-md"></div>
          </div>
        </div>

        <div className="p-4 border rounded-lg border-nema-sunset bg-nema-sunset/20 text-nema-light">
          <div className="flex items-start">
            <span className="mr-2 text-xl">⏰</span>
            <div>
              <h3 className="font-medium mb-1">Important: Airdrop Claim Period</h3>
              <p className="text-sm">
                The NEMA airdrop wallet linking period is now open and will close on <strong>March 21st, 2025</strong>.
                You must link your Ethereum wallet before this deadline to receive your tokens.
                After this date, unlinked wallets will no longer be available to claim.
              </p>
            </div>
          </div>
        </div>

        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nema-light"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6 bg-nema-dark/30 border-nema-midday/30">
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-code text-nema-light text-center sm:text-left">NEMA Airdrop Checker</h1>
        <div className="flex justify-center w-full sm:w-auto">
          <Button
            onClick={() => open()}
            className="h-10"
          >
            {connected ? 'Change Wallet' : 'Connect Wallet'}
          </Button>
        </div>
      </div>

      <div className="p-4 border rounded-lg border-nema-sunset bg-nema-sunset/20 text-nema-light">
        <div className="flex items-start">
          <span className="mr-2 text-xl">⏰</span>
          <div>
            <h3 className="font-medium mb-1">Important: Airdrop Claim Period</h3>
            <p className="text-sm">
              The NEMA airdrop wallet linking period is now open and will close on <strong>March 21st, 2025</strong>.
              You must link your Ethereum wallet before this deadline to receive your tokens.
              After this date, unlinked wallets will no longer be available to claim.
            </p>
          </div>
        </div>
      </div>

      {!connected && !walletAddress && (
        <form onSubmit={handleCheck} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-code text-nema-light">Enter your Solana address</h2>
            <Input
              type="text"
              placeholder="Solana wallet address"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className={cn(
                'bg-nema-dark/50 border-nema-midday/30 text-nema-light placeholder:text-nema-light/50 font-mono',
                inputAddress && !isSolanaAddressValid && 'border-red-500'
              )}
            />
            {inputAddress && !isSolanaAddressValid && (
              <p className="text-red-500 text-sm">Please enter a valid Solana address</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!inputAddress || !isSolanaAddressValid || isChecking}
            className="w-full text-lg py-4"
          >
            {isChecking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Checking...
              </div>
            ) : (
              'Check Eligibility'
            )}
          </Button>
        </form>
      )}

      {walletAddress && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded border border-nema-midday/30 bg-nema-dark/50">
            <span className="text-lg">Wallet</span>
            <span className="font-mono text-lg break-all pl-4">{walletAddress}</span>
          </div>

          {isChecking ? (
            <p className="text-center text-xl">Checking eligibility...</p>
          ) : checkResult.message && (
            <div className={cn(
              'text-center p-6 border rounded-lg space-y-4 border-nema-midday/30 bg-nema-dark/50',
              checkResult.isEligible
                ? 'border-l-4 border-l-emerald-500'
                : 'border-l-4 border-l-red-500'
            )}>
              <p className="text-2xl font-medium">
                {checkResult.isEligible ? '🎉 Congratulations!' : '❌ Not Eligible'}
              </p>
              {checkResult.projectedAmount && (
                <p className="text-xl font-medium">
                  Projected Airdrop: {checkResult.projectedAmount.toLocaleString()} $NEMA
                </p>
              )}
              <p className="text-lg">
                {checkResult.message}
              </p>
            </div>
          )}

          {checkResult.isEligible && !connected && (
            <div className="space-y-4 border p-6 rounded-lg border-nema-midday/30 bg-nema-dark/50 border-l-4 border-l-blue-500">
              <h3 className="text-xl font-medium">Connect Your Wallet</h3>
              <p className="text-sm text-nema-light/80">
                This wallet is eligible for the airdrop! Connect your Solana wallet to link an Ethereum address or check if you&apos;ve already linked one.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => open()} className="h-10">
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}

          {checkResult.isEligible && connected && publicKey && (
            <div className="space-y-4 border p-6 rounded-lg border-nema-midday/30 bg-nema-dark/50">
              <h3 className="text-xl font-medium">Link Your Ethereum Wallet</h3>

              {isCheckingLink ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  <span>Checking wallet link status...</span>
                </div>
              ) : isWalletLinked ? (
                <div className="p-4 border rounded border-nema-midday/30 bg-nema-dark/60 border-l-4 border-l-emerald-500 mb-4">
                  <p>Your wallet is already linked to the Ethereum address below. Your NEMA tokens will be sent to this address.</p>
                </div>
              ) : (
                <p className="text-sm text-nema-light/80">
                  To receive your airdrop, please provide your Ethereum wallet address.
                  You&apos;ll need to sign a message with your Solana wallet to verify ownership.
                </p>
              )}

              <Input
                type="text"
                placeholder="Ethereum wallet address (0x...)"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                disabled={isWalletLinked}
                className={cn(
                  'bg-nema-dark/50 border-nema-midday/30 text-nema-light placeholder:text-nema-light/50 font-mono',
                  isWalletLinked && 'opacity-80'
                )}
              />

              {ethAddress && !isEthAddressValid && !isWalletLinked && (
                <p className="text-red-500 text-sm">Please enter a valid Ethereum address</p>
              )}

              {!isWalletLinked && (
                <Button
                  onClick={handleLinkWallets}
                  disabled={!isEthAddressValid || isLinking}
                  className="w-full"
                >
                  {isLinking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Linking Wallets...
                    </div>
                  ) : (
                    'Link Wallets'
                  )}
                </Button>
              )}

              {linkResult.message && !isWalletLinked && (
                <div className={cn(
                  'p-4 border rounded text-sm border-nema-midday/30 bg-nema-dark/60',
                  linkResult.success && 'border-l-4 border-l-emerald-500'
                )}>
                  {linkResult.message}
                </div>
              )}
            </div>
          )}

          {!connected && (
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full text-lg py-4 border-nema-midday/30"
            >
              Check Another Wallet
            </Button>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4 border-t border-nema-midday/30 pt-6">
          <h3 className="text-lg font-medium mb-4">Important Airdrop Details:</h3>

          <div className="space-y-2">
            <p className="flex items-start">
              <span className="mr-2">📅</span>
              <span>The snapshot was taken on February 13th, 2025. Eligibility is based on a wallet&apos;s $WORM holdings at the time of snapshot.</span>
            </p>

            <p className="flex items-start">
              <span className="mr-2">ℹ️</span>
              <span>
                Users who held {'>'}1M $WORM tokens during January 2025 but sold on or before February 13th may still be eligible.
                Please reach out via our Telegram channel for a case-by-case review (no guarantees).
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
