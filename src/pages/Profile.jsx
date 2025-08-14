import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AuthContext } from '../contexts/AuthContext';
import profileService from '../services/profile.js';

const Profile = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setFormData({
        username: profileData.username || '',
        twitter_handle: profileData.twitter_handle || '',
        telegram_handle: profileData.telegram_handle || ''
      });
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
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
      username: profile?.username || '',
      twitter_handle: profile?.twitter_handle || '',
      telegram_handle: profile?.telegram_handle || ''
    });
    setIsEditing(false);
    setError('');
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

          {profile && (
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
                            {profile.wallet_address}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-400 whitespace-nowrap">
                          NEMA Balance
                        </td>
                        <td className="py-3 text-sm">
                          <span className="text-yellow-400 font-bold">
                            {(profile.nema_balance || 0).toLocaleString()} NEMA
                          </span>
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
                              {profile.username || 'Not set'}
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
                              {profile.twitter_handle || 'Not set'}
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
                              {profile.telegram_handle || 'Not set'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Account created:</span>
                    <span className="text-white ml-2">{formatDate(profile.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last updated:</span>
                    <span className="text-white ml-2">{formatDate(profile.updated_at)}</span>
                  </div>
                  {profile.verified_at && (
                    <div>
                      <span className="text-gray-400">Verified:</span>
                      <span className="text-green-400 ml-2">{formatDate(profile.verified_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Disconnect Section */}
              <div className="border-t border-gray-700 pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-red-400 mb-1">Danger Zone</h3>
                    <p className="text-sm text-gray-400">Disconnect your wallet from Nema</p>
                  </div>
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