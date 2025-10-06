import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../utils/api';
import bs58 from 'bs58';

// Format token amounts for display (e.g., 1.2M, 45.3K)
const formatTokenAmount = (amount) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  } else {
    return amount.toLocaleString();
  }
};

// Module-level flag to prevent double authentication across React StrictMode
let isAuthenticatingGlobal = false;
let lastWalletGlobal = null;

const WalletButton = () => {
    const { publicKey, signMessage, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const { isAuthenticated, login, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState(null);
    const [hasAttemptedAutoAuth, setHasAttemptedAutoAuth] = useState(false);
    const [authAttemptCount, setAuthAttemptCount] = useState(0);

    const handleAuthenticate = useCallback(async () => {
        if (!publicKey || !signMessage) {
            setError('Wallet not connected');
            return;
        }

        // Prevent multiple simultaneous authentication attempts
        if (isAuthenticating) {
            return;
        }

        isAuthenticatingGlobal = true;
        setIsAuthenticating(true);
        setError(null);
        setAuthAttemptCount(prev => prev + 1);

        try {
            // Step 1: Get a fresh message from the server
            const { message } = await authAPI.getMessage();
            
            // Step 2: Sign the message with the wallet
            // Simple check to prevent the signMessage error
            if (typeof signMessage !== 'function') {
                throw new Error('Wallet signing function not available');
            }
            
            const messageBytes = new TextEncoder().encode(message);
            
            // Include Nema logo in the sign message display
            // Try multiple format options for different wallet compatibility
            const signature = await signMessage(messageBytes, {
                // Standard display options
                display: {
                    uri: `${window.location.origin}/nema-lab-logo.png`,
                    name: 'NEMA',
                    description: 'Sign in to NEMA - Digital Biology Platform'
                },
                // Alternative property names some wallets might use
                appIcon: `${window.location.origin}/nema-lab-logo.png`,
                appName: 'NEMA',
                appDescription: 'Sign in to NEMA - Digital Biology Platform',
                // Phantom-specific options
                icon: `${window.location.origin}/nema-lab-logo.png`,
                title: 'NEMA'
            });
            
            // Step 3: Convert signature to base58 string (Solana standard)
            const signatureBase58 = bs58.encode(signature);
            
            // Step 4: Send login request
            const result = await login(publicKey.toString(), message, signatureBase58);
            
            if (!result.success) {
                setError(result.error || 'Authentication failed');
            } else {
                // Redirect to profile page on successful login
                navigate('/profile');
            }
        } catch (err) {
            console.error('Authentication error:', err);
            const errorMessage = err.message || 'Authentication failed';
            
            // If this is a signing error and we've tried multiple times, offer to disconnect
            if (authAttemptCount >= 2 && (errorMessage.includes('User rejected') || errorMessage.includes('signing') || errorMessage.includes('cancelled'))) {
                setError(`${errorMessage}. Having trouble? Click here to disconnect and try again.`);
            } else {
                setError(errorMessage);
            }
        } finally {
            isAuthenticatingGlobal = false;
            setIsAuthenticating(false);
        }
    }, [publicKey, signMessage, isAuthenticating, login, navigate]);

    // Auto-authenticate when wallet connects (only once per wallet)
    useEffect(() => {
        const currentWallet = publicKey?.toString();
        
        // Use module-level variables to survive React StrictMode double execution
        if (currentWallet && currentWallet === lastWalletGlobal) {
            return;
        }
        
        if (isAuthenticatingGlobal) {
            return;
        }
        
        if (publicKey && signMessage && !isAuthenticated && !loading && currentWallet) {
            // Set global flags IMMEDIATELY
            lastWalletGlobal = currentWallet;
            isAuthenticatingGlobal = true;
            handleAuthenticate();
        }
    }, [publicKey, signMessage, isAuthenticated, loading, isAuthenticating]);

    // Reset when wallet disconnects
    useEffect(() => {
        if (!publicKey) {
            lastWalletGlobal = null;
            isAuthenticatingGlobal = false;
            setHasAttemptedAutoAuth(false);
            setError(null);
            setAuthAttemptCount(0);
        }
    }, [publicKey]);

    const handleDisconnect = async () => {
        try {
            await logout();
            disconnect();
            navigate('/');
        } catch (err) {
            console.error('Disconnect error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    const { user, profile } = useAuth();

    if (isAuthenticated) {
        
        return (
            <Link
                to="/profile"
                className="flex items-center space-x-3 pr-6 transition-colors duration-200 group"
            >
                {/* Worm Avatar */}
                {profile?.avatar_base64 && (
                    <img
                        src={profile.avatar_base64}
                        alt="Worm Avatar"
                        className="w-12 h-12 rounded-full border-2 border-white group-hover:border-cyan-400 transition-colors duration-200"
                        style={{ imageRendering: 'pixelated' }}
                    />
                )}

                {/* User Info */}
                <div className="text-left">
                    <div className="text-sm font-medium text-white group-hover:text-cyan-400">
                        {profile?.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-cyan-300">
                        {formatTokenAmount(profile?.nema_balance || 0)} NEMA
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {!publicKey ? (
                <button
                    onClick={() => setVisible(true)}
                    className="px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-all duration-200 font-medium cursor-pointer"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="flex items-center">
                    <button
                        onClick={handleAuthenticate}
                        disabled={isAuthenticating}
                        className="px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium cursor-pointer"
                    >
                        {isAuthenticating ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </div>
            )}
            
            {error && (
                <div className="absolute top-full mt-2 right-0 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 max-w-xs">
                    {error.includes('Click here to disconnect') ? (
                        <div>
                            <span>{error.split('. Click here')[0]}. </span>
                            <button 
                                onClick={handleDisconnect}
                                className="underline hover:text-red-200 transition-colors"
                            >
                                Click here to disconnect and try again.
                            </button>
                        </div>
                    ) : (
                        <div>
                            {error}
                            {authAttemptCount >= 1 && (
                                <div className="mt-2 pt-2 border-t border-red-400">
                                    <button 
                                        onClick={handleDisconnect}
                                        className="underline hover:text-red-200 transition-colors text-xs"
                                    >
                                        Disconnect wallet and start over
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WalletButton;