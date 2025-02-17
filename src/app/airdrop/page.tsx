"use client";

import { useState } from 'react';
import { ConnectWallet } from '@/components/wallet/connect-wallet';
import { checkWalletEligibility } from '@/lib/api-client';
import { PageLayout } from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CheckResult {
  isEligible: boolean | null;
  error: string | null;
}

export default function AirdropPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult>({
    isEligible: null,
    error: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const handleWalletConnect = async (address: string) => {
    setWalletAddress(address);
    await checkEligibility(address);
  };

  const checkEligibility = async (address: string) => {
    setIsChecking(true);
    try {
      const result = await checkWalletEligibility(address);
      setCheckResult({
        isEligible: result.data,
        error: result.error
      });
    } catch (error) {
      setCheckResult({
        isEligible: null,
        error: 'Failed to check eligibility'
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
        <Card>
          {!walletAddress ? (
            <div className="text-center space-y-4">
              <p className="text-lg">
                Connect your Solana wallet to check eligibility
              </p>
              <ConnectWallet onConnect={handleWalletConnect} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-matrix-black/50 rounded border border-matrix-green/20">
                <span className="text-matrix-green">Connected Wallet</span>
                <span className="font-mono text-matrix-light-green">{walletAddress}</span>
              </div>

              {isChecking ? (
                <p className="text-center text-lg text-matrix-green">Checking eligibility...</p>
              ) : checkResult.error ? (
                <p className="text-center text-lg text-red-500">{checkResult.error}</p>
              ) : checkResult.isEligible !== null && (
                <div className={cn(
                  "text-center p-4 border rounded-lg space-y-2",
                  checkResult.isEligible
                    ? "border-matrix-light-green/50 bg-matrix-light-green/10"
                    : "border-red-500/50 bg-red-500/10"
                )}>
                  <p className="text-xl font-medium">
                    {checkResult.isEligible ?
                      "🎉 Congratulations! You're eligible for the airdrop." :
                      "Sorry, this wallet is not eligible for the airdrop."
                    }
                  </p>
                  {checkResult.isEligible && (
                    <p className="text-lg text-matrix-green">
                      Stay tuned for claiming instructions.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="text-center text-lg text-matrix-green/80">
          <p>
            The $NEMA airdrop is available to existing $WORM token holders on the Solana chain.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
