'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkWalletEligibility, linkWalletAddresses } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { encode } from '@/lib/utils';

interface CheckResult {
  isEligible: boolean | null;
  projectedAmount?: number;
  message: string | null;
}

interface AirdropCheckerProps {
  apiBaseUrl: string;
}

export function AirdropChecker({ apiBaseUrl }: AirdropCheckerProps) {
  const { publicKey, signMessage, connected, connecting } = useWallet();
  const [inputAddress, setInputAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState('');
  const [isEthAddressValid, setIsEthAddressValid] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult>({
    isEligible: null,
    message: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkResult, setLinkResult] = useState<{ success: boolean; message: string | null }>({
    success: false,
    message: null
  });

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

  // Check connected wallet eligibility automatically
  useEffect(() => {
    if (publicKey && connected && !walletAddress) {
      const address = publicKey.toString();
      setInputAddress(address);
      setWalletAddress(address);
      checkEligibility(address);
    }
  }, [publicKey, connected, walletAddress, checkEligibility]);

  // Validate ETH address
  useEffect(() => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(ethAddress);
    setIsEthAddressValid(isValid);
  }, [ethAddress]);

  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputAddress.trim()) return;

    setWalletAddress(inputAddress);
    await checkEligibility(inputAddress);
  };

  const handleLinkWallets = async () => {
    if (!publicKey || !signMessage || !ethAddress || !isEthAddressValid) return;

    setIsLinking(true);
    try {
      // Create a message to sign that includes the ETH address
      const message = `I am linking my Solana wallet ${publicKey.toString()} to Ethereum wallet ${ethAddress} for the NEMA airdrop.`;

      // Convert message to Uint8Array for signing
      const messageBytes = new TextEncoder().encode(message);

      // Request wallet to sign the message
      const signature = await signMessage(messageBytes);

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
    setCheckResult({ isEligible: null, message: null });
    setLinkResult({ success: false, message: null });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-code text-nema-light">NEMA Airdrop Checker</h1>
        <WalletMultiButton className="h-10" style={{}} />
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
              className="bg-nema-dark/50 border-nema-midday/30 text-nema-light placeholder:text-nema-light/50 font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputAddress || isChecking}
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
          <div className="flex items-center justify-between p-4 rounded border">
            <span className="text-lg">Wallet</span>
            <span className="font-mono text-lg break-all pl-4">{walletAddress}</span>
          </div>

          {isChecking ? (
            <p className="text-center text-xl">Checking eligibility...</p>
          ) : checkResult.message && (
            <div className={cn(
              'text-center p-6 border rounded-lg space-y-4',
              checkResult.isEligible
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-red-500/50 bg-red-500/10'
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

          {checkResult.isEligible && connected && publicKey && (
            <div className="space-y-4 border p-6 rounded-lg">
              <h3 className="text-xl font-medium">Link Your Ethereum Wallet</h3>
              <p className="text-sm text-nema-light/80">
                To receive your airdrop, please provide your Ethereum wallet address.
                You&apos;ll need to sign a message with your Solana wallet to verify ownership.
              </p>

              <Input
                type="text"
                placeholder="Ethereum wallet address (0x...)"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                className="bg-nema-dark/50 border-nema-midday/30 text-nema-light placeholder:text-nema-light/50 font-mono"
              />

              {ethAddress && !isEthAddressValid && (
                <p className="text-red-500 text-sm">Please enter a valid Ethereum address</p>
              )}

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

              {linkResult.message && (
                <div className={cn(
                  'p-4 border rounded text-sm',
                  linkResult.success
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/50 bg-red-500/10 text-red-400'
                )}>
                  {linkResult.message}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={resetForm}
            variant="outline"
            className="w-full text-lg py-4"
          >
            Check Another Wallet
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4 border-t pt-6">
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
