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
    <div className="min-h-screen bg-nema-black text-nema-white pt-28 relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/bg-texture.png')", backgroundSize: '100% 100%', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center">
          <h1 className="nema-display nema-display-1 mb-12 text-nema-cyan font-intranet">
            TOKENOMICS & TOKEN
          </h1>

          <div className="nema-card p-8 bg-nema-black/40">
            {/* Token Economics */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Supply & Market Cap */}
              <div className="bg-nema-black/30 p-6 border border-nema-cyan/20">
                <h4 className="nema-header-2 text-nema-cyan mb-4 font-intranet">Token Supply</h4>
                <div className="space-y-3 font-anonymous">
                  <div className="flex justify-between items-center">
                    <span className="text-nema-gray text-left">Initial Supply</span>
                    <span className="text-nema-white font-bold text-right">
                      {loadingTokenData ? 'Loading...' : '1B $NEMA'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nema-gray text-left">Current Supply</span>
                    <span className="text-nema-cyan font-bold text-right">
                      {loadingTokenData
                        ? 'Loading...'
                        : `${tokenData?.currentSupply?.toLocaleString() || '0'} $NEMA`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nema-gray text-left">Tokens Burned</span>
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
              <div className="bg-nema-black/30 p-6 border border-nema-cyan/20">
                <h4 className="nema-header-2 text-nema-cyan mb-4 font-intranet">Contract Address</h4>
                <div className="space-y-3 font-anonymous">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-nema-gray">CA</span>
                      <button
                        onClick={() => navigator.clipboard.writeText('5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups')}
                        className="text-nema-gray-darker hover:text-nema-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-nema-black/50 p-2">
                      <span className="text-nema-cyan text-xs sm:text-sm font-bold break-all">
                        5hUL8iHMXcUj9AS7yBErJmmTXyRvbdwwUqbtB2udjups
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-nema-gray">Chart</span>
                    <a
                      href="https://dexscreener.com/solana/4nyhzno8noeabnj9fgmsk7ympxgssacqswjuhrg3xucz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nema-cyan hover:text-nema-white transition-colors underline font-bold"
                    >
                      Dexscreener →
                    </a>
                  </div>
                  <p className="text-sm text-nema-gray-darker mt-4">
                    Token is live on Solana. Click chart link to view trading data.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="mb-8">
              <h4 className="nema-display nema-display-2 text-nema-cyan mb-6 text-center font-intranet">Token Allocation</h4>
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-nema-black/30 p-4 border border-nema-cyan/30 text-center">
                  <div className="text-3xl font-bold text-nema-cyan mb-2 font-intranet">60%</div>
                  <div className="text-sm text-nema-gray mb-1 font-anonymous">Token Launch</div>
                  <div className="text-xs text-nema-gray-darker font-anonymous">Jupiter Studio launch</div>
                </div>
                <div className="bg-nema-black/30 p-4 border border-nema-cyan/30 text-center">
                  <div className="text-3xl font-bold text-nema-cyan mb-2 font-intranet">30%</div>
                  <div className="text-sm text-nema-gray mb-1 font-anonymous">Airdrop</div>
                  <div className="text-xs text-nema-gray-darker font-anonymous">Completed distribution</div>
                </div>
                <div className="bg-nema-black/30 p-4 border border-nema-cyan/30 text-center">
                  <div className="text-3xl font-bold text-nema-cyan mb-2 font-intranet">10%</div>
                  <div className="text-sm text-nema-gray mb-1 font-anonymous">Team</div>
                  <div className="text-xs text-nema-gray-darker font-anonymous">12-month linear vest</div>
                </div>
              </div>
            </div>

            {/* Team Vesting Schedule */}
            <div className="mb-8 bg-nema-black/30 p-4 border border-nema-cyan/20">
              <h5 className="text-lg font-bold text-nema-cyan mb-2 font-anonymous">Team Vesting Schedule</h5>
              <p className="text-sm text-nema-gray font-anonymous">
                Team allocation vests linearly over 12 months with weekly releases, ensuring long-term alignment
                and sustainable tokenomics. Any leftover team funds remain locked under the same schedule.
              </p>
            </div>

            {/* Token Airdrop Section */}
            <div className="border-t border-nema-gray/20 pt-8">
              <div className="text-center mb-8">
                <h3 className="nema-display nema-display-2 text-nema-cyan mb-6 font-intranet">Airdrop Completed</h3>
                <p className="text-lg text-nema-gray leading-relaxed font-anonymous">
                  The $NEMA airdrop has been successfully completed. Here's the final distribution summary:
                </p>
              </div>

              {/* Completed Airdrop Details */}
              <div className="space-y-4 mb-8">
                <h4 className="nema-header-2 text-nema-cyan mb-4 font-intranet">Final Distribution</h4>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-nema-black/30 border border-nema-cyan/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-nema-cyan rounded-full"></div>
                      <div>
                        <div className="text-nema-white font-bold font-anonymous">August 1st Drop</div>
                        <div className="text-sm text-nema-gray-darker font-anonymous">First distribution to eligible wallets</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-nema-cyan font-intranet">5%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-nema-black/30 border border-nema-cyan/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-nema-cyan rounded-full"></div>
                      <div>
                        <div className="text-nema-white font-bold font-anonymous">August 4th Drop</div>
                        <div className="text-sm text-nema-gray-darker font-anonymous">Main distribution to eligible wallets</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-nema-cyan font-intranet">20%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-nema-black/30 border border-nema-cyan/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-nema-cyan rounded-full"></div>
                      <div>
                        <div className="text-nema-white font-bold font-anonymous">Diamond Hand Reward</div>
                        <div className="text-sm text-nema-gray-darker font-anonymous">Future reward for holders who didn't sell</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-nema-cyan font-intranet">5%</div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-nema-black/30 border border-nema-cyan/30">
                  <div className="text-nema-cyan font-bold mb-2 font-anonymous">Total Distributed</div>
                  <div className="text-lg text-nema-white font-bold font-intranet">25% of Supply</div>
                  <div className="text-sm text-nema-gray-darker font-anonymous">250M $NEMA tokens</div>
                </div>
                <div className="p-4 bg-nema-black/30 border border-nema-cyan/30">
                  <div className="text-nema-cyan font-bold mb-2 font-anonymous">Diamond Hand Reserve</div>
                  <div className="text-lg text-nema-white font-bold font-intranet">5% Reserved</div>
                  <div className="text-sm text-nema-gray-darker font-anonymous">Future reward for loyal holders</div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-nema-black/30 p-6 border border-nema-cyan/20">
                <h4 className="text-lg font-bold text-nema-cyan mb-3 font-anonymous">Airdrop Summary</h4>
                <ul className="space-y-2 text-sm text-nema-gray font-anonymous">
                  <li>• 5% of total supply airdropped to eligible wallets on August 1st</li>
                  <li>• 20% of total supply airdropped to eligible wallets on August 4th</li>
                  <li>• 5% of total supply held as "diamond hand" reward for eligible airdrop wallets that have not sold their $NEMA</li>
                  <li>• <strong className="text-nema-cyan">The airdrop is now complete</strong></li>
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
