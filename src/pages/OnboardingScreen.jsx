import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profile.js';
import nemaService from '../services/nema.js';

const OnboardingScreen = () => {
  const { profile, fetchProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const usernameInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    username: '',
    twitter_handle: '',
    telegram_handle: ''
  });

  const [nemaData, setNemaData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Focus username field when component mounts
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }

    // If user already has username, redirect to profile
    if (profile?.username && profile.username.trim() !== '') {
      navigate('/profile');
    }

  }, [profile, navigate]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNemaInputChange = (e) => {
    const { name, value } = e.target;
    setNemaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    // Validate username is required
    if (!profileData.username || profileData.username.trim() === '') {
      setError('Username is required to continue');
      if (usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
      return;
    }

    setError('');
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!profileData.username || profileData.username.trim() === '') {
      setError('Username is required');
      setCurrentStep(1);
      return;
    }

    if (!nemaData.name || nemaData.name.trim() === '') {
      setError('Nema name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update profile first
      await profileService.updateProfile({
        username: profileData.username.trim(),
        twitter_handle: profileData.twitter_handle.trim() || undefined,
        telegram_handle: profileData.telegram_handle.trim() || undefined
      });

      // Get user's existing Nemas to update the first one
      const userNemas = await profileService.getNemas();
      
      if (userNemas && userNemas.length > 0) {
        // Update the first (auto-created) Nema
        await nemaService.updateNema({
          id: userNemas[0].id,
          name: nemaData.name.trim(),
          description: nemaData.description.trim() || undefined
        });
      } else {
        // Fallback: create a new Nema if none exists (shouldn't normally happen)
        await nemaService.createNema({
          name: nemaData.name.trim(),
          description: nemaData.description.trim() || undefined
        });
      }

      setSuccess(true);
      
      // Refresh profile to get updated data
      await fetchProfile();

      // Redirect to profile after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      setError('Failed to complete setup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-cyan-400 mb-2">Welcome to NEMA!</h1>
              <p className="text-gray-300">Your account setup is complete. Redirecting to your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-8">{/* */}

          {/* Header */}
          <div className="text-center mb-8">
            {/* Prominent Avatar Display */}
            {profile?.profile_pic && (
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-2 rounded-full animate-pulse">
                    <img
                      src={profile.profile_pic}
                      alt="Your Worm Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">Welcome to NEMA!</h1>
              <p className="text-gray-300">Let's set up your account and create your first Nema</p>
            </div>
          </div>
            
          {/* Progress indicator */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                currentStep >= 1 ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-gray-600 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-cyan-400' : 'bg-gray-600'}`}></div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                currentStep >= 2 ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-gray-600 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-2">Step 1: Your Profile</h2>
                  <p className="text-gray-300">Tell us a bit about yourself</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={usernameInputRef}
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileInputChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {/* Twitter Handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Handle <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                    <input
                      type="text"
                      name="twitter_handle"
                      value={profileData.twitter_handle}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="twitter_handle"
                    />
                  </div>
                </div>

                {/* Telegram Handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telegram Handle <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 z-10">@</span>
                    <input
                      type="text"
                      name="telegram_handle"
                      value={profileData.telegram_handle}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="telegram_handle"
                    />
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Nema Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-2">Step 2: Your First Nema</h2>
                  <p className="text-gray-300">Create your digital C. elegans companion</p>
                </div>

                {/* Nema Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nema Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={nemaData.name}
                    onChange={handleNemaInputChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Give your Nema a name (e.g., Wormy, Elegans, Neo)"
                    required
                  />
                </div>

                {/* Nema Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nema Description <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={nemaData.description}
                    onChange={handleNemaInputChange}
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors resize-vertical"
                    placeholder="Describe your Nema's personality, goals, or characteristics (optional)..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    )}
                    {loading ? 'Creating Your Account...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;