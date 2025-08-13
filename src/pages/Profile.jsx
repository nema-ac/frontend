import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profile.js';

const Profile = () => {
  const { isAuthenticated, logout, profile: contextProfile, fetchProfile: contextFetchProfile, refreshNemaBalance } = useContext(AuthContext);
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    twitter_handle: '',
    telegram_handle: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (contextProfile) {
      setFormData({
        username: contextProfile.username || '',
        twitter_handle: contextProfile.twitter_handle || '',
        telegram_handle: contextProfile.telegram_handle || ''
      });
      setLoading(false);
    }
  }, [contextProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      await contextFetchProfile();
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setUpdateSuccess(false);

    try {
      await profileService.updateProfile(formData);
      setUpdateSuccess(true);
      // Refresh profile data
      await fetchProfile();
      setIsEditing(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: contextProfile?.username || '',
      twitter_handle: contextProfile?.twitter_handle || '',
      telegram_handle: contextProfile?.telegram_handle || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleRefreshBalance = async () => {
    setBalanceRefreshing(true);
    try {
      await refreshNemaBalance();
    } catch (err) {
      console.error('Error refreshing balance:', err);
    } finally {
      setBalanceRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // First logout from authentication
      await logout();
      // Then disconnect the wallet
      disconnect();
      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleDownloadAvatar = () => {
    if (!contextProfile?.avatar_base64) return;
    
    try {
      // Create canvas to render circular avatar with border
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 256; // Higher resolution for better quality
      const borderWidth = 8;
      const radius = (size - borderWidth * 2) / 2;
      
      canvas.width = size;
      canvas.height = size;
      
      // Create image from base64
      const img = new Image();
      img.onload = () => {
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, size, size);
        
        // Draw border circle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius + borderWidth / 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#00BCD4'; // Cyan border color
        ctx.fill();
        
        // Create clipping mask for circular image
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
        ctx.clip();
        
        // Draw the avatar image (scaled and centered)
        ctx.imageSmoothingEnabled = false; // Preserve pixelated look
        ctx.drawImage(img, borderWidth, borderWidth, size - borderWidth * 2, size - borderWidth * 2);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `nema-worm-avatar-${contextProfile.wallet_address?.slice(-8) || 'avatar'}.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.src = contextProfile.avatar_base64;
      
    } catch (error) {
      console.error('Error downloading avatar:', error);
      // Fallback: download original image
      const link = document.createElement('a');
      link.href = contextProfile.avatar_base64;
      link.download = `nema-worm-avatar-${contextProfile.wallet_address?.slice(-8) || 'avatar'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareOnTwitter = () => {
    const tweetText = `Just generated my unique C. elegans avatar on @Nema_Lab! 🪱 

Building the future of digital biology with $NEMA 🧠`;
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.origin)}`;
    
    // Open Twitter in a new window/tab
    window.open(tweetUrl, '_blank', 'width=600,height=400');
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">Profile</h1>
              <p className="text-gray-300">Manage your Nema account settings</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {updateSuccess && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              Profile updated successfully!
            </div>
          )}

          {contextProfile && (
            <div className="space-y-6">
              {/* Avatar & Wallet Info Card */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {/* Worm Avatar */}
                  {contextProfile.avatar_base64 && (
                    <img 
                      src={contextProfile.avatar_base64} 
                      alt="Your Worm Avatar"
                      className="w-16 h-16 rounded-full border-3 border-cyan-400"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-cyan-400">Your Nema Worm</h3>
                    <p className="text-sm text-gray-400">Unique C. elegans avatar generated from your wallet</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-cyan-400 mb-4">Wallet Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-700">
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-400 whitespace-nowrap">
                          Wallet Address
                        </td>
                        <td className="py-3 text-sm">
                          <code className="text-cyan-400 break-all">
                            {contextProfile.wallet_address}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-400 whitespace-nowrap">
                          NEMA Balance
                        </td>
                        <td className="py-3 text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="text-yellow-400 font-bold">
                              {(contextProfile.nema_balance || 0).toLocaleString()} NEMA
                            </span>
                            <button
                              onClick={handleRefreshBalance}
                              disabled={balanceRefreshing}
                              className="text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 text-xs transition-colors duration-200 cursor-pointer"
                              title="Refresh NEMA balance from Solana blockchain"
                            >
                              {balanceRefreshing ? (
                                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '🔄'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Share on Twitter Section */}
              {contextProfile.avatar_base64 && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-cyan-400">Share Your Nema Worm</h3>
                    <p className="text-sm text-gray-400">Show off your unique digital C. elegans avatar</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <img 
                      src={contextProfile.avatar_base64} 
                      alt="Your Worm Avatar Preview"
                      className="w-12 h-12 rounded-full border-2 border-cyan-400"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        "Just generated my unique C. elegans avatar on @Nema_Lab! 🪱 
                        Building the future of digital biology with $NEMA 🧠"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownloadAvatar}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span>Download Avatar</span>
                    </button>
                    
                    <button
                      onClick={handleShareOnTwitter}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Share on X</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 pr-12 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                          placeholder="Enter username"
                        />
                      ) : (
                        <>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 pr-12">
                            <span className="text-white">
                              {contextProfile.username || 'Not set'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                            title="Edit username"
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Twitter Handle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter Handle
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <>
                          <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                          <input
                            type="text"
                            name="twitter_handle"
                            value={formData.twitter_handle}
                            onChange={handleInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-12 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                            placeholder="twitter_handle"
                          />
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 pr-12 pl-8">
                            <span className="text-white">
                              {contextProfile.twitter_handle || 'Not set'}
                            </span>
                          </div>
                          <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                            title="Edit Twitter handle"
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Telegram Handle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telegram Handle
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <>
                          <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                          <input
                            type="text"
                            name="telegram_handle"
                            value={formData.telegram_handle}
                            onChange={handleInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-12 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                            placeholder="telegram_handle"
                          />
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 pr-12 pl-8">
                            <span className="text-white">
                              {contextProfile.telegram_handle || 'Not set'}
                            </span>
                          </div>
                          <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                            title="Edit Telegram handle"
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      {updateLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      )}
                      {updateLoading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Account Info */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-cyan-400 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-400">Account created:</span>
                    <span className="text-white ml-2">{contextProfile.created_at ? formatDate(contextProfile.created_at) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last updated:</span>
                    <span className="text-white ml-2">{contextProfile.updated_at ? formatDate(contextProfile.updated_at) : 'N/A'}</span>
                  </div>
                </div>
                
                {/* Disconnect Button */}
                <div className="pt-4 border-t border-gray-600">
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;