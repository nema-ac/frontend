import { useEffect, useState } from 'react';
import { tokenService } from '../services/tokenService';

const Airdrop = () => {
  const [tokenData, setTokenData] = useState(null);
  const [loadingTokenData, setLoadingTokenData] = useState(true);

  // Fetch token supply data
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const data = await tokenService.getTokenSupply();
        setTokenData(data);
      } catch (error) {
        console.error('Failed to fetch token data:', error);
      } finally {
        setLoadingTokenData(false);
      }
    };

    fetchTokenData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-12">
            <span className="text-cyan-400">TOKENOMICS & TOKEN</span>
          </h1>

          <div className="neon-border p-8 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/50">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Tokenomics & Token</h2>

            {/* Token Economics */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Supply & Market Cap */}
              <div className="bg-black/30 p-6 rounded-lg border border-cyan-400/20">
                <h4 className="text-xl font-bold text-cyan-400 mb-4">Token Supply</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-left">Initial Supply</span>
                    <span className="text-white font-bold text-right">
                      {loadingTokenData ? 'Loading...' : '1B $NEMA'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-left">Current Supply</span>
                    <span className="text-cyan-400 font-bold text-right">
                      {loadingTokenData 
                        ? 'Loading...' 
                        : `${tokenData?.currentSupply?.toLocaleString() || '0'} $NEMA`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-left">Tokens Burned</span>
                    <span className="text-red-400 font-bold text-right">
                      {loadingTokenData 
                        ? 'Loading...' 
                        : `${tokenData?.burnedTokens?.toLocaleString() || '0'} $NEMA`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div className="bg-black/30 p-6 rounded-lg border border-purple-400/20">
                <h4 className="text-xl font-bold text-purple-400 mb-4">Contract Address</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">CA</span>
                      <button
                        onClick={() => navigator.clipboard.writeText('5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups')}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2">
                      <span className="text-cyan-400 font-mono text-xs sm:text-sm font-bold break-all">
                        5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Chart</span>
                    <a
                      href="https://dexscreener.com/solana/4nyhzno8noeabnj9fgmsk7ympxgssacqswjuhrg3xucz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 transition-colors underline font-bold"
                    >
                      Dexscreener →
                    </a>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Token is live on Solana. Click chart link to view trading data.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Token Allocation</h4>
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-900/30 to-black/50 p-4 rounded-lg border border-cyan-400/30 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">60%</div>
                  <div className="text-sm text-gray-300 mb-1">Token Launch</div>
                  <div className="text-xs text-gray-500">Jupiter Studio launch</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-black/50 p-4 rounded-lg border border-purple-400/30 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">30%</div>
                  <div className="text-sm text-gray-300 mb-1">Airdrop</div>
                  <div className="text-xs text-gray-500">Completed distribution</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-black/50 p-4 rounded-lg border border-green-400/30 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">10%</div>
                  <div className="text-sm text-gray-300 mb-1">Team</div>
                  <div className="text-xs text-gray-500">12-month linear vest</div>
                </div>
              </div>
            </div>

            {/* Team Vesting Schedule */}
            <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-4 rounded-lg border border-nema-cyan/20">
              <h5 className="text-lg font-bold text-cyan-400 mb-2">Team Vesting Schedule</h5>
              <p className="text-sm text-gray-300">
                Team allocation vests linearly over 12 months with weekly releases, ensuring long-term alignment
                and sustainable tokenomics. Any leftover team funds remain locked under the same schedule.
              </p>
            </div>

            {/* Token Airdrop Section */}
            <div className="border-t border-gray-700 pt-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-cyan-400 mb-6">Airdrop Completed</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  The $NEMA airdrop has been successfully completed. Here's the final distribution summary:
                </p>
              </div>

              {/* Completed Airdrop Details */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xl font-bold text-purple-400 mb-4">Final Distribution</h4>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-900/20 to-black/50 rounded-lg border border-green-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">August 1st Drop</div>
                        <div className="text-sm text-gray-400">First distribution to eligible wallets</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">5%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-900/20 to-black/50 rounded-lg border border-green-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">August 4th Drop</div>
                        <div className="text-sm text-gray-400">Main distribution to eligible wallets</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">20%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-900/20 to-black/50 rounded-lg border border-purple-400/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-bold">Diamond Hand Reward</div>
                        <div className="text-sm text-gray-400">Future reward for holders who didn't sell</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">5%</div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-green-900/10 to-black/30 rounded border border-green-400/30">
                  <div className="text-green-400 font-bold mb-2">Total Distributed</div>
                  <div className="text-lg text-white font-bold">25% of Supply</div>
                  <div className="text-sm text-gray-400">250M $NEMA tokens</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-900/10 to-black/30 rounded border border-purple-400/30">
                  <div className="text-purple-400 font-bold mb-2">Diamond Hand Reserve</div>
                  <div className="text-lg text-white font-bold">5% Reserved</div>
                  <div className="text-sm text-gray-400">Future reward for loyal holders</div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gradient-to-r from-green-900/20 to-purple-900/20 p-6 rounded-lg border border-green-400/20">
                <h4 className="text-lg font-bold text-green-400 mb-3">Airdrop Summary</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 5% of total supply airdropped to eligible wallets on August 1st</li>
                  <li>• 20% of total supply airdropped to eligible wallets on August 4th</li>
                  <li>• 5% of total supply held as "diamond hand" reward for eligible airdrop wallets that have not sold their $NEMA</li>
                  <li>• <strong className="text-cyan-400">The airdrop is now complete</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
