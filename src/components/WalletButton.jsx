import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../utils/api';
import bs58 from 'bs58';

const WalletButton = () => {
    const { publicKey, signMessage, disconnect } = useWallet();
    const { isAuthenticated, login, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState(null);
    const [hasAttemptedAutoAuth, setHasAttemptedAutoAuth] = useState(false);

    // Auto-authenticate when wallet connects
    useEffect(() => {
        if (publicKey && signMessage && !isAuthenticated && !hasAttemptedAutoAuth && !loading) {
            setHasAttemptedAutoAuth(true);
            handleAuthenticate();
        }
    }, [publicKey, signMessage, isAuthenticated, hasAttemptedAutoAuth, loading]);

    // Reset auto-auth attempt when wallet disconnects
    useEffect(() => {
        if (!publicKey) {
            setHasAttemptedAutoAuth(false);
            setError(null);
        }
    }, [publicKey]);

    const handleAuthenticate = async () => {
        if (!publicKey || !signMessage) {
            setError('Wallet not connected');
            return;
        }

        setIsAuthenticating(true);
        setError(null);

        try {
            // Step 1: Get a fresh message from the server
            const { message } = await authAPI.getMessage();
            
            // Step 2: Sign the message with the wallet
            const messageBytes = new TextEncoder().encode(message);
            const signature = await signMessage(messageBytes);
            
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
            setError(err.message || 'Authentication failed');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await logout();
            disconnect();
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

    if (isAuthenticated) {
        const { user, profile } = useAuth();
        
        return (
            <Link
                to="/profile"
                className="block text-right transition-colors duration-200 group"
            >
                <div className="text-sm font-medium text-white group-hover:text-cyan-400">
                    {profile?.username || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-400 group-hover:text-cyan-300">
                    {(profile?.nema_balance || 0).toLocaleString()} NEMA
                </div>
            </Link>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {!publicKey ? (
                <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-blue-500 hover:!from-cyan-600 hover:!to-blue-600 !border-0 !rounded-lg !text-sm !font-medium !transition-all !duration-200" />
            ) : (
                <div className="flex items-center">
                    <button
                        onClick={handleAuthenticate}
                        disabled={isAuthenticating}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isAuthenticating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    {error}
                </div>
            )}
        </div>
    );
};

export default WalletButton;