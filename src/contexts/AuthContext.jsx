import { createContext, useState, useEffect } from 'react';
import config from '../config/environment.js';
import profileService from '../services/profile.js';
import { getOrGenerateAvatar, generateNewVariation } from '../utils/avatarStorage.js';

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
            setProfile(profileData);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    const loadOrGenerateAvatar = (walletAddress) => {
        try {
            console.log('Loading or generating worm avatar...');
            const avatarBase64 = getOrGenerateAvatar(walletAddress);
            // Add avatar to existing profile data
            setProfile(prev => ({
                ...prev,
                avatar_base64: avatarBase64,
                wallet_address: walletAddress
            }));
        } catch (error) {
            console.error('Error loading/generating avatar:', error);
        }
    };

    const generateNewAvatarVariation = (walletAddress) => {
        try {
            console.log('Generating new avatar variation...');
            const avatarBase64 = generateNewVariation(walletAddress);
            // Update profile with new avatar
            setProfile(prev => ({
                ...prev,
                avatar_base64: avatarBase64
            }));
            return avatarBase64;
        } catch (error) {
            console.error('Error generating new avatar variation:', error);
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
                // Load avatar for existing session if we have wallet address
                if (userData.wallet_address) {
                    loadOrGenerateAvatar(userData.wallet_address);
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
                loadOrGenerateAvatar(walletAddress);
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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};