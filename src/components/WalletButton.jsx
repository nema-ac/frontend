import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../utils/api';
import bs58 from 'bs58';

const WalletButton = () => {
    const { publicKey, signMessage, disconnect } = useWallet();
    const { isAuthenticated, login, logout, loading } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState(null);

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
        return (
            <div className="flex items-center space-x-3">
                <span className="text-sm text-cyan-400">Connected</span>
                <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {!publicKey ? (
                <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-blue-500 hover:!from-cyan-600 hover:!to-blue-600 !border-0 !rounded-lg !text-sm !font-medium !transition-all !duration-200" />
            ) : (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-400">Wallet Connected</span>
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