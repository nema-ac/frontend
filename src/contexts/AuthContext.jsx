import { createContext, useState, useEffect } from 'react';
import config from '../config/environment.js';
import profileService from '../services/profile.js';
import { fetchNemaBalance } from '../utils/solanaBalance.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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

            setProfile({
                ...profileData,
                nema_balance: nemaBalance,
                avatar_base64: profileData.profile_pic,
                profile_pic: profileData.profile_pic
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    const loadOrGenerateAvatar = async (walletAddress) => {
        try {
            // Check if user already has an avatar from the server
            const currentProfile = await profileService.getProfile();

            // Set profile data (avatars are now handled per-Nema)
            setProfile(currentProfile);
        } catch (error) {
            console.error('Error loading/generating avatar:', error);
        }
    };

    const generateNewAvatarVariation = (walletAddress) => {
        console.warn('Avatar regeneration is not supported - avatars can only be set once per user');
        return null;
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
                const error = await response.text();
                return { success: false, error };
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
