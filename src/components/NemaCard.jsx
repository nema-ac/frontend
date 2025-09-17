import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import nemaService from '../services/nema.js';
import EmotionRadarPlot from './EmotionRadarPlot.jsx';

const NemaCard = ({ nema, onNemaUpdated, onNemaDeleted }) => {
  const { profile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: nema.name,
    description: nema.description
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [interactionError, setInteractionError] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Get global avatar from profile
  const userAvatar = profile?.profile_pic;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nema name is required');
      return;
    }


    setIsSubmitting(true);
    setError('');

    try {
      await nemaService.updateNema({
        id: nema.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });
      
      const updatedNema = {
        ...nema,
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      };
      
      setIsEditing(false);
      onNemaUpdated(updatedNema);
    } catch (err) {
      setError('Failed to update Nema: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: nema.name,
      description: nema.description
    });
    setError('');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await nemaService.deleteNema(nema.id);
      onNemaDeleted(nema.id);
    } catch (err) {
      setError('Failed to delete Nema: ' + err.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadInteractions = async () => {
    setLoadingInteractions(true);
    setInteractionError('');
    try {
      const data = await nemaService.getInteractionHistory(nema.id, { limit: 10 });
      setInteractions(data.messages || []);
    } catch (err) {
      setInteractionError('Failed to load interactions: ' + err.message);
    } finally {
      setLoadingInteractions(false);
    }
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === 'interactions' && interactions.length === 0) {
        loadInteractions();
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareOnTwitter = () => {
    const text = `Just generated my unique C. elegans avatar for my Nema "${nema.name}" on @Nema_Lab! 🪱 Building the future of digital biology with $NEMA 🧠`;
    const url = window.location.origin;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleDownloadAvatar = () => {
    if (!userAvatar) return;

    const filename = `nema-${nema.name.replace(/[^a-zA-Z0-9]/g, '-')}-avatar.png`;
    
    // Create bordered version using canvas
    const createBorderedAvatar = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const borderWidth = 8;
          const size = img.width + (borderWidth * 2);
          
          canvas.width = size;
          canvas.height = size;
          
          // Set pixelated rendering
          ctx.imageSmoothingEnabled = false;
          
          // Draw cyan border
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(0, 0, size, size);
          
          // Draw avatar centered
          ctx.drawImage(img, borderWidth, borderWidth, img.width, img.height);
          
          canvas.toBlob(resolve, 'image/png');
        };
        img.src = userAvatar;
      });
    };

    // Check if Web Share API is supported and we're on mobile
    if (navigator.share && navigator.userAgentData?.mobile) {
      createBorderedAvatar()
        .then(blob => {
          const file = new File([blob], filename, { type: 'image/png' });
          navigator.share({
            title: `My NEMA Worm Avatar - ${nema.name}`,
            text: `Check out my unique C. elegans avatar for ${nema.name}!`,
            files: [file]
          }).catch(() => {
            // Fallback to download if share fails
            downloadBlob(blob, filename);
          });
        });
    } else {
      // Desktop or Web Share not supported - download directly
      createBorderedAvatar()
        .then(blob => {
          downloadBlob(blob, filename);
        });
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              rows={3}
              placeholder="Describe your Nema's personality or characteristics (optional)..."
            />
          </div>


          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              )}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          {/* Combined Header and Avatar */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {userAvatar && (
                <img
                  src={userAvatar}
                  alt={`${nema.name} Avatar`}
                  className="w-16 h-16 rounded-full border-3 border-cyan-400 cursor-pointer"
                  style={{ imageRendering: 'pixelated' }}
                  onClick={() => {
                    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    if (isTouchDevice) {
                      setShowAvatarModal(true);
                    }
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-medium text-cyan-400 mb-1">{nema.name}</h3>
                <p className="text-sm text-gray-400">{nema.description || "My first C. elegans"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors p-2"
                  title="Edit Nema"
                >
                  ✎
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                  title="Delete Nema"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleShareOnTwitter}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Share on Twitter</span>
              </button>
              {userAvatar && (
                <button
                  onClick={handleDownloadAvatar}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Avatar</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            <div>Created: {formatDate(nema.created_at)}</div>
            <div>Updated: {formatDate(nema.updated_at)}</div>
          </div>

          {/* Emotional State Radar Plot */}
          <EmotionRadarPlot nemaId={nema.id} className="mb-4" />

          {/* Expandable Sections */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('interactions')}
              className="w-full flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
            >
              <span className="text-cyan-400 font-medium">Recent Interactions</span>
              <span className={`transform transition-transform ${expandedSection === 'interactions' ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSection === 'interactions' && (
              <div className="p-3 bg-gray-900/30 rounded-lg">
                {loadingInteractions ? (
                  <div className="text-center text-gray-400">Loading interactions...</div>
                ) : interactionError ? (
                  <div className="text-red-400 text-sm">{interactionError}</div>
                ) : interactions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="text-sm">
                        <div className={`p-2 rounded ${
                          interaction.kind === 'user' 
                            ? 'bg-cyan-500/20 text-cyan-200' 
                            : 'bg-purple-500/20 text-purple-200'
                        }`}>
                          <div className="font-medium text-xs mb-1">
                            {interaction.kind === 'user' ? 'You' : 'Nema'}:
                          </div>
                          <div>{interaction.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm">No interactions yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-red-400 mb-4">Delete Nema</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{nema.name}"? This action cannot be undone and will 
              delete all interactions and neural state history.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal for Mobile */}
      {showAvatarModal && userAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-cyan-400 rounded-xl p-6 max-w-sm w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>

            {/* Large Avatar Display */}
            <div className="text-center">
              <div className="bg-cyan-400 p-2 rounded-full mx-auto w-fit mb-6">
                <img
                  src={userAvatar}
                  alt={`${nema.name} Worm Avatar`}
                  className="w-64 h-64 rounded-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-cyan-400">{nema.name} Worm Avatar</h3>
                <p className="text-gray-300 text-sm">
                  Long press the image above to save it to your photos, or use the download button below.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadAvatar}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={handleShareOnTwitter}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NemaCard;