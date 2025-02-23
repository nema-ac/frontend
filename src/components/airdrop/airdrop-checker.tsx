"use client";

import { useState } from 'react';
import { checkWalletEligibility } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CheckResult {
  isEligible: boolean | null;
  projectedAmount?: number;
  message: string | null;
}

interface AirdropCheckerProps {
  apiBaseUrl: string;
}

export function AirdropChecker({ apiBaseUrl }: AirdropCheckerProps) {
  const [inputAddress, setInputAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult>({
    isEligible: null,
    message: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputAddress.trim()) return;

    setWalletAddress(inputAddress);
    await checkEligibility(inputAddress);
  };

  const checkEligibility = async (address: string) => {
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
  };

  return (
    <Card className="p-6 space-y-6">
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

      {walletAddress && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-matrix-black/50 rounded border border-matrix-green/20">
            <span className="text-lg">Wallet</span>
            <span className="font-mono text-lg text-matrix-light-green break-all pl-4">{walletAddress}</span>
          </div>

          {isChecking ? (
            <p className="text-center text-xl">Checking eligibility...</p>
          ) : checkResult.message && (
            <div className={cn(
              "text-center p-6 border rounded-lg space-y-4",
              checkResult.isEligible
                ? "border-matrix-light-green/50 bg-matrix-light-green/10"
                : "border-red-500/50 bg-red-500/10"
            )}>
              <p className="text-2xl font-medium">
                {checkResult.isEligible ? "🎉 Congratulations!" : "❌ Not Eligible"}
              </p>
              {checkResult.projectedAmount && (
                <p className="text-xl font-medium text-matrix-light-green">
                  Projected Airdrop: {checkResult.projectedAmount.toLocaleString()} $NEMA
                </p>
              )}
              <p className="text-lg">
                {checkResult.message}
              </p>
            </div>
          )}

          <Button
            onClick={() => {
              setWalletAddress(null);
              setInputAddress('');
              setCheckResult({ isEligible: null, message: null });
            }}
            variant="outline"
            className="w-full text-lg py-4"
          >
            Check Another Wallet
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4 border-t border-matrix-green/20 pt-6">
          <h3 className="text-lg font-medium mb-4">Important Airdrop Details:</h3>

          <div className="space-y-2">
            <p className="flex items-start">
              <span className="mr-2">📅</span>
              <span>The snapshot was taken on February 13th, 2025. Eligibility is based on a wallet's $WORM holdings at the time of snapshot.</span>
            </p>

            <p className="flex items-start">
              <span className="mr-2">ℹ️</span>
              <span>
                Users who held > 1M $WORM tokens during January 2025 but sold on or before February 13th may still be eligible.
                Please reach out via our Telegram channel for a case-by-case review (no guarantees).
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
