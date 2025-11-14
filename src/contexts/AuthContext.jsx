import { createContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import config from '../config/environment.js';
import profileService from '../services/profile.js';
import avatarService from '../services/avatar.js';
import { fetchNemaBalance } from '../utils/solanaBalance.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { disconnect } = useWallet();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const fetchProfile = async () => {
        try {
            const profileData = await profileService.getProfile();

            // Fetch real NEMA balance from Solana if wallet address is available
            let nemaBalance = profileData.nema_balance || 0;
            if (profileData.wallet_address) {
                try {
                    nemaBalance = await fetchNemaBalance(profileData.wallet_address);
                } catch (balanceError) {
                    console.error('Error fetching NEMA balance:', balanceError);
                    // Fall back to stored balance if Solana fetch fails
                    nemaBalance = profileData.nema_balance || 0;
                }
            }

            // Fetch user's avatar from the dedicated avatar endpoint
            let userAvatar = null;
            try {
                userAvatar = await avatarService.getAvatar();
            } catch (avatarError) {
                console.error('Error fetching avatar:', avatarError);
            }

            setProfile({
                ...profileData,
                nema_balance: nemaBalance,
                profile_pic: userAvatar || profileData.profile_pic,
                avatar_base64: userAvatar || profileData.profile_pic
            });
        } catch (error) {
            console.error('Error fetching profile:', error);

            // If we get a 404 error, it means the user profile doesn't exist
            // This indicates the user session is invalid, so we should disconnect and clear everything
            if (error.status === 404) {
                console.log('Profile not found (404), disconnecting wallet and clearing session');

                // Clear authentication state
                setIsAuthenticated(false);
                setUser(null);
                setProfile(null);

                // Disconnect the wallet
                try {
                    disconnect();
                } catch (disconnectError) {
                    console.error('Error disconnecting wallet:', disconnectError);
                }
            } else {
                setProfile(null);
            }
        }
    };

    const loadOrGenerateAvatar = async (walletAddress) => {
        try {
            // Try to get or generate avatar using the new avatar service
            const avatar = await avatarService.getOrGenerateAvatar(walletAddress);

            // Refresh profile after avatar operations
            await fetchProfile();

            return avatar;
        } catch (error) {
            console.error('Error loading/generating avatar:', error);

            // If avatar already exists (409 error), just refresh profile
            if (error.message.includes('already been set')) {
                await fetchProfile();
            }

            return null;
        }
    };

    const generateNewAvatarVariation = async (walletAddress) => {
        try {
            // Try to generate a new variation avatar
            const avatar = await avatarService.generateAndSetVariationAvatar(walletAddress);

            // Refresh profile after avatar operations
            await fetchProfile();

            return avatar;
        } catch (error) {
            console.error('Error generating new avatar variation:', error);

            // If avatar already exists (409 error), inform user
            if (error.message.includes('already been set')) {
                throw new Error('Avatar has already been set and cannot be changed');
            }

            throw error;
        }
    };

    const refreshNemaBalance = async (walletAddress = null) => {
        try {
            const addressToUse = walletAddress || profile?.wallet_address;
            if (!addressToUse) {
                return;
            }

            const nemaBalance = await fetchNemaBalance(addressToUse);
            setProfile(prev => ({
                ...prev,
                nema_balance: nemaBalance
            }));
            return nemaBalance;
        } catch (error) {
            console.error('Error refreshing NEMA balance:', error);
            return null;
        }
    };

    const checkAuthStatus = async () => {
        try {
            const baseUrl = config.api.baseUrl;
            const response = await fetch(`${baseUrl}/auth/verify`, {
                method: 'POST',
                credentials: 'include', // Important for cookies
            });

            if (response.ok) {
                const userData = await response.json();
                setIsAuthenticated(true);
                setUser(userData);
                // Fetch profile data after successful auth check
                await fetchProfile();
                // Generate avatar if user doesn't have one yet
                if (userData.wallet_address) {
                    await loadOrGenerateAvatar(userData.wallet_address);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (walletAddress, message, signature) => {
        try {
            const baseUrl = config.api.baseUrl;
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    message,
                    signature,
                }),
            });

            if (response.ok) {
                // Check auth status after successful login
                await checkAuthStatus();
                // Load or generate avatar immediately after sign-in
                await loadOrGenerateAvatar(walletAddress);
                return { success: true };
            } else {
                // Parse JSON error response
                let errorMessage = 'Authentication failed';
                let errorCode = null;
                let requiredBalance = null;

                try {
                    const responseText = await response.text();
                    const contentType = response.headers.get('content-type') || '';

                    // Try to parse as JSON if content-type indicates JSON or response looks like JSON
                    if (contentType.includes('application/json') || responseText.trim().startsWith('{')) {
                        try {
                            const errorData = JSON.parse(responseText);
                            errorCode = errorData.error;
                            requiredBalance = errorData.required_balance;

                            if (errorCode === 'insufficient_token_balance' && requiredBalance != null) {
                                const formattedBalance = requiredBalance.toLocaleString('en-US', {
                                    maximumFractionDigits: 0
                                });
                                errorMessage = `Your wallet needs to hold at least ${formattedBalance} NEMA tokens to create an account.`;
                            } else if (errorData.message) {
                                errorMessage = errorData.message;
                            }
                        } catch {
                            // If JSON parsing fails, use the text response
                            errorMessage = responseText || errorMessage;
                        }
                    } else {
                        errorMessage = responseText || errorMessage;
                    }
                } catch {
                    // If reading fails, use default error message
                }

                return {
                    success: false,
                    error: errorMessage,
                    errorCode,
                    requiredBalance
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            const baseUrl = config.api.baseUrl;
            await fetch(`${baseUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setProfile(null);
        }
    };

    const value = {
        isAuthenticated,
        user,
        profile,
        loading,
        login,
        logout,
        checkAuthStatus,
        fetchProfile,
        loadOrGenerateAvatar,
        generateNewAvatarVariation,
        refreshNemaBalance,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
