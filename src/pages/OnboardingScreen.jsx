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
      <div className="min-h-screen flex items-center justify-center pt-16 relative">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/bg-texture.png')", backgroundSize: '100% 100%', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md relative z-10">
          <div className="nema-card bg-nema-black/40 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-nema-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="nema-display nema-display-2 text-nema-cyan mb-2 font-intranet">Welcome to NEMA!</h1>
              <p className="text-nema-gray font-anonymous">Your account setup is complete. Redirecting to your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/bg-texture.png')", backgroundSize: '100% 100%', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
        <div className="nema-card bg-nema-black/40 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            {/* Prominent Avatar Display */}
            {profile?.profile_pic && (
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="bg-gradient-to-r from-nema-cyan to-nema-purple p-2 rounded-full animate-pulse">
                    <img
                      src={profile.profile_pic}
                      alt="Your Worm Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-nema-white"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h1 className="nema-display nema-display-2 text-nema-cyan mb-2 font-intranet">Welcome to NEMA!</h1>
              <p className="text-nema-gray font-anonymous">Let's set up your account and create your first Nema</p>
            </div>
          </div>
            
          {/* Progress indicator */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold font-anonymous ${
                currentStep >= 1 ? 'bg-nema-cyan border-nema-cyan text-nema-black' : 'border-nema-gray-darker text-nema-gray-darker'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-nema-cyan' : 'bg-nema-gray-darker'}`}></div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold font-anonymous ${
                currentStep >= 2 ? 'bg-nema-cyan border-nema-cyan text-nema-black' : 'border-nema-gray-darker text-nema-gray-darker'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 mb-6 font-anonymous">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="nema-header-2 text-nema-cyan mb-2 font-intranet">Step 1: Your Profile</h2>
                  <p className="text-nema-gray font-anonymous">Tell us a bit about yourself</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-nema-gray mb-2 font-anonymous">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={usernameInputRef}
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileInputChange}
                    className="w-full bg-textbox-background border border-textbox-border px-3 py-3 text-nema-white focus:outline-none focus:border-nema-cyan transition-colors font-anonymous"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {/* Twitter Handle */}
                <div>
                  <label className="block text-sm font-medium text-nema-gray mb-2 font-anonymous">
                    Twitter Handle <span className="text-nema-gray-darker text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-nema-gray-darker z-10 font-anonymous">@</span>
                    <input
                      type="text"
                      name="twitter_handle"
                      value={profileData.twitter_handle}
                      onChange={handleProfileInputChange}
                      className="w-full bg-textbox-background border border-textbox-border pl-8 pr-3 py-3 text-nema-white focus:outline-none focus:border-nema-cyan transition-colors font-anonymous"
                      placeholder="twitter_handle"
                    />
                  </div>
                </div>

                {/* Telegram Handle */}
                <div>
                  <label className="block text-sm font-medium text-nema-gray mb-2 font-anonymous">
                    Telegram Handle <span className="text-nema-gray-darker text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-nema-gray-darker z-10 font-anonymous">@</span>
                    <input
                      type="text"
                      name="telegram_handle"
                      value={profileData.telegram_handle}
                      onChange={handleProfileInputChange}
                      className="w-full bg-textbox-background border border-textbox-border pl-8 pr-3 py-3 text-nema-white focus:outline-none focus:border-nema-cyan transition-colors font-anonymous"
                      placeholder="telegram_handle"
                    />
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="nema-button px-8 py-3"
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
                  <h2 className="nema-header-2 text-nema-cyan mb-2 font-intranet">Step 2: Your First Nema</h2>
                  <p className="text-nema-gray font-anonymous">Create your digital C. elegans companion</p>
                </div>

                {/* Nema Name */}
                <div>
                  <label className="block text-sm font-medium text-nema-gray mb-2 font-anonymous">
                    Nema Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={nemaData.name}
                    onChange={handleNemaInputChange}
                    className="w-full bg-textbox-background border border-textbox-border px-3 py-3 text-nema-white focus:outline-none focus:border-nema-cyan transition-colors font-anonymous"
                    placeholder="Give your Nema a name (e.g., Wormy, Elegans, Neo)"
                    required
                  />
                </div>

                {/* Nema Description */}
                <div>
                  <label className="block text-sm font-medium text-nema-gray mb-2 font-anonymous">
                    Nema Description <span className="text-nema-gray-darker text-xs">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={nemaData.description}
                    onChange={handleNemaInputChange}
                    rows="4"
                    className="w-full bg-textbox-background border border-textbox-border px-3 py-3 text-nema-white focus:outline-none focus:border-nema-cyan transition-colors resize-vertical font-anonymous"
                    placeholder="Describe your Nema's personality, goals, or characteristics (optional)..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="nema-button px-6 py-3"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="nema-button flex-1 px-8 py-3 flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nema-white"></div>
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