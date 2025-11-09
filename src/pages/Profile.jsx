import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profile.js';
import nemaService from '../services/nema.js';
import ProfileTabs from '../components/ProfileTabs.jsx';
import NemaCreationFlow from '../components/NemaCreationFlow.jsx';
import NemaCard from '../components/NemaCard.jsx';
import { getProfileAvatarUrl } from '../utils/avatarUtils.js';
import EmotionalStateVisualization from '../components/EmotionalStateVisualization.jsx';

const Profile = () => {
  const { isAuthenticated, logout, profile: contextProfile, fetchProfile: contextFetchProfile, refreshNemaBalance } = useContext(AuthContext);
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    twitter_handle: '',
    telegram_handle: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [emotionalState, setEmotionalState] = useState(null);
  const [emotionalStateHistory, setEmotionalStateHistory] = useState([]);
  const [loadingEmotionalState, setLoadingEmotionalState] = useState(false);
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

      // Note: Nemas data is now accessed directly from contextProfile.nemas

      // Fetch emotional state for the first nema
      if (contextProfile.nemas && contextProfile.nemas.length > 0) {
        fetchEmotionalState(contextProfile.nemas[0].id);
      }
    }
  }, [contextProfile]);

  const fetchEmotionalState = async (nemaId) => {
    if (!nemaId) return;

    setLoadingEmotionalState(true);
    try {
      // Fetch current state
      const currentState = await nemaService.getNeuralState(nemaId);
      if (currentState.emotionalState) {
        setEmotionalState(currentState.emotionalState);
      }

      // Fetch state history for timeline (last 50 states)
      const history = await nemaService.getStateHistory(nemaId, { limit: 50, order: 'desc' });
      if (history.states && history.states.length > 0) {
        setEmotionalStateHistory(history.states);
      }
    } catch (err) {
      console.error('Failed to fetch emotional state:', err);
      // Don't show error to user, just don't display visualization
    } finally {
      setLoadingEmotionalState(false);
    }
  };

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
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
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
      return new Promise((resolve) => {
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
            .catch((shareError) => {
              console.log('Share failed:', shareError);
              handleMobileFallback(borderedImage);
            });
          return;
        } catch (shareError) {
          console.log('Share API failed, using fallback:', shareError);
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


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section with Nema Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Left: Main Nema */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 relative">
              <div className="bg-white hover:bg-cyan-400 p-0.5 rounded-full transition-colors duration-200">
                <img
                  src={getProfileAvatarUrl(contextProfile)}
                  alt="Nema Avatar"
                  className="w-20 h-20 rounded-full object-cover cursor-pointer"
                  style={{ imageRendering: 'pixelated' }}
                  onClick={() => setShowAvatarModal(true)}
                />
              </div>
              {contextProfile?.profile_pic && (
                <button
                  onClick={handleDownloadAvatar}
                  className="absolute -bottom-2 left-2 w-8 h-8 border border-white/50 hover:border-cyan-300 rounded-full text-white hover:text-cyan-300 hover:bg-cyan-400/10 transition-all duration-200 flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: 'rgba(44, 44, 44, 1)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 10L12 15M12 15L7 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1">
              <h1 className="nema-display nema-display-2 max-md:nema-header-2 text-nema-cyan mb-1.5 text-xl max-md:text-base">
                {contextProfile?.nemas?.[0]?.name || 'MY MAIN NEMA'}
              </h1>
              <div className="space-y-0.5 font-anonymous">
                <div>
                  <span className="text-nema-secondary text-xs">Age: </span>
                  <span className="text-nema-white text-xs">
                    {contextProfile?.nemas?.[0]?.created_at ?
                      (() => {
                        const createdDate = new Date(contextProfile.nemas[0].created_at);
                        const now = new Date();
                        const diffMs = now - createdDate;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffWeeks = Math.floor(diffDays / 7);
                        const diffMonths = Math.floor(diffDays / 30);
                        const diffYears = Math.floor(diffDays / 365);

                        if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
                        if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
                        if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
                        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                      })()
                      : '2 months'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-nema-white text-xs">
                    {contextProfile?.nemas?.[0]?.description || 'This is a description of my nema worm I love it so much'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio text bubble */}
          <div className="relative">
            <div className="nema-card p-4">
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-nema-cyan rounded-full"></div>
              <p className="text-nema-white font-anonymous text-xs leading-relaxed">
                Just generated my unique C. elegans avatar on @Nema_Lab.
                Building the future of digital biology on $NEMA
              </p>
            </div>
            <div className="flex justify-end mt-3">
              <div
                onClick={handleShareOnTwitter}
                className="px-4 py-1.5 bg-nema-button-500 rounded-lg text-nema-white-light hover:bg-nema-button-600 transition-colors font-anonymous text-xs cursor-pointer"
              >
                Share on X
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Current State and Emotional Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Current State */}
          <div className="nema-card p-4">
            <h2 className="text-base font-intranet text-nema-cyan mb-3">CURRENT STATE</h2>
            <div className="aspect-square bg-nema-black/50 border border-nema-cyan/20 rounded-lg flex items-center justify-center">
              {/* Placeholder for 3D visualization */}
              <div className="text-center font-anonymous">
                <div className="w-20 h-20 mx-auto mb-2 border border-nema-cyan/30 rounded-lg flex items-center justify-center">
                  <span className="text-nema-secondary text-xs">3D Model</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button className="bg-nema-cyan/20 border border-nema-cyan/30 p-1.5 rounded text-xs">+</button>
                  <button className="bg-nema-cyan/20 border border-nema-cyan/30 p-1.5 rounded text-xs">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Emotional State Visualization */}
          <div className="lg:col-span-2">
            {loadingEmotionalState ? (
              <div className="nema-card p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nema-cyan"></div>
                </div>
              </div>
            ) : emotionalState ? (
              <EmotionalStateVisualization
                emotionalState={emotionalState}
                variant="full"
                showHistory={true}
                historyData={emotionalStateHistory}
                className="w-full"
              />
            ) : (
              <div className="nema-card p-4">
                <h2 className="text-base font-intranet text-nema-cyan mb-3">EMOTIONAL STATE</h2>
                <div className="h-48 bg-nema-black/50 border border-nema-cyan/20 rounded-lg flex items-center justify-center">
                  <span className="text-nema-secondary text-xs font-anonymous px-4 text-center">
                    No emotional state data available yet. Start chatting with your Nema to see emotional states evolve.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MY ACCOUNT Section */}
        <div className="nema-card p-5">
          {/* Header with Avatar on mobile */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar - shows on mobile */}
            <div className="flex-shrink-0 md:hidden">
              <div className="relative">
                <img
                  src={getProfileAvatarUrl(contextProfile)}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-nema-white"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            <h2 className="nema-display nema-display-2 max-md:nema-header-2 text-nema-cyan text-xl max-md:text-base">MY ACCOUNT</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            {/* Avatar - shows on desktop */}
            <div className="hidden md:block flex-shrink-0">
              <div className="relative">
                <img
                  src={getProfileAvatarUrl(contextProfile)}
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-nema-white"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Account Details */}
            <div className="flex-1 space-y-4 w-full">
              {/* Top Row - Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-anonymous">
                <div className="max-w-full">
                  <label className="block text-nema-white text-sm mb-2">Username*</label>
                  <input
                    ref={usernameInputRef}
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full max-w-full bg-textbox-background border border-textbox-border h-[40px] py-3 px-4 rounded-lg text-nema-white text-sm focus:outline-none focus:border-nema-cyan transition-colors"
                    placeholder="nemauser123"
                  />
                </div>

                <div className="max-w-full">
                  <label className="block text-nema-white text-sm mb-2">Twitter Handle</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="twitter_handle"
                      value={formData.twitter_handle}
                      onChange={handleInputChange}
                      className="flex-1 max-w-full bg-textbox-background border border-textbox-border h-[40px] py-3 px-4 rounded-lg text-nema-white text-sm focus:outline-none focus:border-nema-cyan transition-colors"
                      placeholder="nematwitter"
                    />
                  </div>
                </div>

                <div className="max-w-full">
                  <label className="block text-nema-white text-sm mb-2">Telegram Handle</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="telegram_handle"
                      value={formData.telegram_handle}
                      onChange={handleInputChange}
                      className="flex-1 max-w-full bg-textbox-background border border-textbox-border h-[40px] py-3 px-4 rounded-lg text-nema-white text-sm focus:outline-none focus:border-nema-cyan transition-colors"
                      placeholder="nematelegram"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-nema-gray/20"></div>

              {/* Bottom Row - Read-only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-anonymous">
                <div className="max-w-full">
                  <label className="block text-nema-gray-darker text-sm mb-1">Wallet Address</label>
                  <div className="px-3 py-2 flex items-center max-w-full overflow-hidden">
                    <code className="text-nema-white text-sm mr-2 truncate flex-1 min-w-0">
                      {contextProfile?.wallet_address}
                    </code>
                    <button className="text-nema-white hover:text-nema-cyan transition-colors flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="max-w-full">
                  <label className="block text-nema-gray-darker text-sm mb-1">NEMA Balance</label>
                  <div className="px-3 py-2 flex items-center">
                    <span className="text-nema-white text-sm font-bold">
                      {(contextProfile?.nema_balance || 0).toLocaleString()} NEMA
                    </span>
                    <button
                      onClick={handleRefreshBalance}
                      disabled={balanceRefreshing}
                      className="text-nema-white hover:text-nema-cyan disabled:text-nema-secondary transition-colors ml-2 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 14C2 14 2.12132 14.8492 5.63604 18.364C9.15076 21.8787 14.8492 21.8787 18.364 18.364C19.6092 17.1187 20.4133 15.5993 20.7762 14M2 14V20M2 14H8M22 10C22 10 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604C4.39076 6.88131 3.58669 8.40072 3.22383 10M22 10V4M22 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={updateLoading}
              className="nema-button px-6 py-2"
            >
              {updateLoading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              onClick={handleDisconnect}
              className="nema-button px-6 py-2 text-red-600"
            >
              Disconnect Wallet
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {updateSuccess && (
            <div className="mt-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              Profile updated successfully!
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
                src={getProfileAvatarUrl(contextProfile)}
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
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
