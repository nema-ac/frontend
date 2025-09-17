import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profile.js';
import ProfileTabs from '../components/ProfileTabs.jsx';
import NemaCreationFlow from '../components/NemaCreationFlow.jsx';
import NemaCard from '../components/NemaCard.jsx';

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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState('nemas');
  const [nemas, setNemas] = useState([]);
  const usernameInputRef = useRef(null);

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

      // Note: New user onboarding is now handled by OnboardingScreen component

      // Set nemas from context profile
      if (contextProfile.nemas) {
        setNemas(contextProfile.nemas);
        // Keep nemas tab active by default unless username is blank (already handled above)
      }
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

    // Validate username is required
    if (!formData.username || formData.username.trim() === '') {
      setError('Username is required. Please enter a username to continue.');
      // Scroll to and focus username field
      setTimeout(() => {
        if (usernameInputRef.current) {
          usernameInputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          usernameInputRef.current.focus();
        }
      }, 100);
      return;
    }

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
    if (!contextProfile?.profile_pic) return;

    const filename = `nema-worm-avatar-${contextProfile.wallet_address?.slice(-8) || 'avatar'}.png`;

    // Create bordered version using canvas
    const createBorderedAvatar = () => {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 256;
          const borderWidth = 8;
          const radius = (size - borderWidth * 2) / 2;

          canvas.width = size;
          canvas.height = size;

          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            try {
              // Clear canvas with transparent background
              ctx.clearRect(0, 0, size, size);

              // Draw border circle
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, radius + borderWidth / 2, 0, 2 * Math.PI);
              ctx.fillStyle = '#00BCD4'; // Cyan border color
              ctx.fill();

              // Create clipping mask for circular image
              ctx.save();
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
              ctx.clip();

              // Draw the avatar image (scaled and centered)
              ctx.imageSmoothingEnabled = false; // Preserve pixelated look
              ctx.drawImage(img, borderWidth, borderWidth, size - borderWidth * 2, size - borderWidth * 2);
              ctx.restore();

              // Convert to base64
              const borderedBase64 = canvas.toDataURL('image/png');
              resolve(borderedBase64);
            } catch (canvasError) {
              console.warn('Canvas processing failed, using original:', canvasError);
              resolve(contextProfile.profile_pic);
            }
          };

          img.onerror = () => {
            console.warn('Image loading failed, using original');
            resolve(contextProfile.profile_pic);
          };

          img.src = contextProfile.profile_pic;
        } catch (error) {
          console.warn('Canvas creation failed, using original:', error);
          resolve(contextProfile.profile_pic);
        }
      });
    };

    // Detect mobile/embedded browser environment using modern APIs
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const isMobile = isTouchDevice && isSmallScreen;
    const isEmbeddedBrowser = window.navigator.standalone ||
                             window.matchMedia('(display-mode: standalone)').matches ||
                             !window.location.ancestorOrigins;

    // Create the bordered version first
    createBorderedAvatar().then((borderedImage) => {
      // Try Web Share API first (best for mobile)
      if (navigator.share && (isMobile || isEmbeddedBrowser)) {
        try {
          // Convert bordered base64 to blob for sharing
          fetch(borderedImage)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], filename, { type: 'image/png' });
              navigator.share({
                title: 'My NEMA Worm Avatar',
                text: 'Check out my unique C. elegans avatar from NEMA!',
                files: [file]
              }).catch(() => {
                handleMobileFallback(borderedImage);
              });
            })
            .catch(() => handleMobileFallback(borderedImage));
          return;
        } catch (error) {
          console.log('Share API failed, using fallback');
        }
      }

      // Fallback methods
      handleMobileFallback(borderedImage);
    });

    // Mobile fallback: Open in new tab for long-press save
    function handleMobileFallback(imageData) {
      if (isMobile || isEmbeddedBrowser) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>NEMA Avatar - Long press to save</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    background: #000;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    text-align: center;
                  }
                  img {
                    max-width: 90vw;
                    max-height: 70vh;
                    width: auto;
                    height: auto;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                  }
                  p { margin-top: 20px; font-size: 16px; }
                </style>
              </head>
              <body>
                <h2>Your NEMA Worm Avatar</h2>
                <img src="${imageData}" alt="NEMA Avatar" />
                <p>Long press the image above and select "Save Image" or "Download"</p>
                <p style="font-size: 14px; color: #888;">Tip: You can also screenshot this page!</p>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          handleCopyFallback();
        }
      } else {
        // Desktop: Use direct download with bordered image
        handleDirectDownload(imageData);
      }
    }

    // Copy base64 to clipboard fallback
    function handleCopyFallback() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(contextProfile.profile_pic).then(() => {
          alert('Avatar image data copied to clipboard! You can paste it into any image editor or messaging app.');
        }).catch(() => {
          alert('Unable to download avatar. Please take a screenshot of your avatar image on the profile page.');
        });
      } else {
        alert('Unable to download avatar. Please take a screenshot of your avatar image on the profile page.');
      }
    }

    // Direct download for desktop
    function handleDirectDownload(imageData) {
      try {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Direct download failed:', error);
        handleMobileFallback(imageData);
      }
    }
  };

  const handleShareOnTwitter = () => {
    const tweetText = `Just generated my unique C. elegans avatar on @Nema_Lab! 🪱

Building the future of digital biology with $NEMA 🧠`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.origin)}`;

    // Open Twitter in a new window/tab
    window.open(tweetUrl, '_blank', 'width=600,height=400');
  };

  const handleNemaCreated = async (newNema) => {
    // Add the new nema to the local state
    setNemas([newNema]);
    // Refresh the profile to get updated data
    await fetchProfile();
  };

  const handleNemaUpdated = (updatedNema) => {
    setNemas(prevNemas =>
      prevNemas.map(nema => nema.id === updatedNema.id ? updatedNema : nema)
    );
  };

  const handleNemaDeleted = async (nemaId) => {
    setNemas(prevNemas => prevNemas.filter(nema => nema.id !== nemaId));
    // Refresh the profile to get updated data
    await fetchProfile();
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
            <div className="flex items-center space-x-4">
              {contextProfile?.profile_pic && (
                <div className="bg-cyan-400 p-1 rounded-full">
                  <img
                    src={contextProfile.profile_pic}
                    alt="Profile Picture"
                    className="w-16 h-16 rounded-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-cyan-400 mb-2">Profile</h1>
                <p className="text-gray-300">Manage your Nema account settings</p>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
              {/* Nemas Tab */}
              {activeTab === 'nemas' && (
                <div className="space-y-6">
                  {nemas.length === 0 ? (
                    <NemaCreationFlow
                      onNemaCreated={handleNemaCreated}
                    />
                  ) : nemas.length >= 1 ? (
                    <div>
                      {nemas.map((nema) => (
                        <NemaCard
                          key={nema.id}
                          nema={nema}
                          onNemaUpdated={handleNemaUpdated}
                          onNemaDeleted={handleNemaDeleted}
                        />
                      ))}
                    </div>
                  ) : null}

                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
              {/* Wallet Info Card */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
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


              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          ref={usernameInputRef}
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 pr-12 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                          placeholder="Enter username (required)"
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
                      Twitter Handle <span className="text-gray-500 text-xs">(optional)</span>
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
                            placeholder="twitter_handle (optional)"
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
                      Telegram Handle <span className="text-gray-500 text-xs">(optional)</span>
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
                            placeholder="telegram_handle (optional)"
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
                      {updateLoading ? 'Updating Profile...' : 'Save Profile'}
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
          )}
        </div>
      </div>

      {/* Avatar Modal for Mobile */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative max-w-sm w-full">
            {/* Close button */}
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Avatar with border */}
            <div className="bg-cyan-400 p-2 rounded-full mx-auto w-fit mb-6">
              <img
                src={contextProfile?.profile_pic}
                alt="Your Worm Avatar"
                className="w-64 h-64 rounded-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Instructions and Download Button */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-cyan-400">Your NEMA Worm Avatar</h3>
              <p className="text-gray-300 text-sm">
                Long press the image above to save it to your photos, or use the download button below.
              </p>

              <button
                onClick={() => {
                  handleDownloadAvatar();
                  setShowAvatarModal(false);
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download Avatar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
