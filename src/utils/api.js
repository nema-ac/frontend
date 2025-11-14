import config from '../config/environment.js';

// Use the centralized config system
const API_BASE_URL = config.api.baseUrl;

export const authAPI = {
    // Get a fresh timestamped message for wallet signing
    async getMessage() {
        const response = await fetch(`${API_BASE_URL}/auth/message`);
        if (!response.ok) {
            throw new Error('Failed to get message');
        }
        return response.json();
    },

    // Login with wallet signature
    async login(walletAddress, message, signature) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

        if (!response.ok) {
            // Try to parse JSON error response
            let errorMessage = 'Login failed';
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    const errorCode = errorData.error;
                    const requiredBalance = errorData.required_balance;
                    
                    if (errorCode === 'insufficient_token_balance' && requiredBalance !== null && requiredBalance !== undefined) {
                        // Format the balance with commas for readability
                        const formattedBalance = requiredBalance.toLocaleString('en-US', {
                            maximumFractionDigits: 0
                        });
                        errorMessage = `Your wallet needs to hold at least ${formattedBalance} NEMA tokens to create an account.`;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } else {
                    // Fallback to text response
                    errorMessage = await response.text() || errorMessage;
                }
            } catch (parseError) {
                // If JSON parsing fails, try text response
                try {
                    errorMessage = await response.text() || errorMessage;
                } catch (textError) {
                    console.error('Failed to parse error response:', textError);
                }
            }
            
            throw new Error(errorMessage);
        }

        return response;
    },

    // Verify current authentication status
    async verify() {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        return response.json();
    },

    // Logout
    async logout() {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        return response;
    },
};

export const userAPI = {
    // Get user profile
    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get profile');
        }

        return response.json();
    },

    // Update user profile
    async updateProfile(profileData) {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        return response;
    },
};

export const nemaAPI = {
    // Get current neural state
    async getState() {
        const response = await fetch(`${API_BASE_URL}/nema/state`);
        
        if (!response.ok) {
            throw new Error('Failed to get state');
        }

        return response.json();
    },

    // Send prompt to Nema
    async sendPrompt(prompt) {
        const response = await fetch(`${API_BASE_URL}/nema/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Failed to send prompt');
        }

        return response.json();
    },

    // Get chat history
    async getHistory(limit = 50) {
        const response = await fetch(`${API_BASE_URL}/nema/history?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error('Failed to get history');
        }

        return response.json();
    },
};