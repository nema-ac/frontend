import { useState } from 'react';
import nemaService from '../services/nema.js';

const NemaCard = ({ nema, onNemaUpdated, onNemaDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: nema.name,
    description: nema.description,
    archived: nema.archived || false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [interactionError, setInteractionError] = useState('');

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

    if (!formData.description.trim()) {
      setError('Nema description is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await nemaService.updateNema({
        id: nema.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        archived: formData.archived
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
      description: nema.description,
      archived: nema.archived || false
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
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="archived"
              name="archived"
              checked={formData.archived}
              onChange={handleInputChange}
              className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-600 rounded"
            />
            <label htmlFor="archived" className="ml-2 text-sm text-gray-300">
              Archived
            </label>
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium text-cyan-400 mb-2">
                {nema.name}
                {nema.archived && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
                    Archived
                  </span>
                )}
              </h3>
              <p className="text-gray-300 text-sm">{nema.description}</p>
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

          <div className="text-sm text-gray-400 mb-4">
            <div>Created: {formatDate(nema.created_at)}</div>
            <div>Updated: {formatDate(nema.updated_at)}</div>
          </div>

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
    </div>
  );
};

export default NemaCard;