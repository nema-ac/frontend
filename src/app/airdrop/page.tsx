"use client";

import { useState } from 'react';
import { checkWalletEligibility } from '@/lib/api-client';
import { PageLayout } from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CheckResult {
  isEligible: boolean | null;
  projectedAmount?: number;
  message: string | null;
}

export default function AirdropPage() {
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
      const result = await checkWalletEligibility(address);
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
    <PageLayout
      title="$NEMA Airdrop"
      subtitle="Check your eligibility for the $NEMA airdrop"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-8">
          {!walletAddress ? (
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="wallet-address"
                  className="block text-lg font-medium text-matrix-green"
                >
                  Enter your Solana wallet address
                </label>
                <Input
                  id="wallet-address"
                  type="search"
                  placeholder="Solana wallet address"
                  value={inputAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputAddress(e.target.value)}
                  className="font-mono text-lg placeholder:text-sm"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputAddress.trim() || isChecking}
                className="w-full text-lg py-6"
              >
                Check Eligibility
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-matrix-black/50 rounded border border-matrix-green/20">
                <span className="text-lg text-matrix-green">Wallet</span>
                <span className="font-mono text-lg text-matrix-light-green break-all pl-4">{walletAddress}</span>
              </div>

              {isChecking ? (
                <p className="text-center text-xl text-matrix-green">Checking eligibility...</p>
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
                  <p className="text-lg text-matrix-green/90">
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
                className="w-full text-lg py-6"
              >
                Check Another Wallet
              </Button>
            </div>
          )}
        </Card>

        <div className="text-center text-xl text-matrix-green/80">
          <p>
            The $NEMA airdrop is available to existing $WORM token holders on the Solana chain.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
