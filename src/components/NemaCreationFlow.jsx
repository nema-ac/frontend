import { useState } from 'react';
import nemaService from '../services/nema.js';

const NemaCreationFlow = ({ onNemaCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const newNema = await nemaService.createNema({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      onNemaCreated(newNema);
    } catch (err) {
      setError('Failed to create Nema: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setError('');
    setShowForm(false);
    if (onCancel) onCancel();
  };

  if (!showForm) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h3 className="text-xl font-medium text-cyan-400 mb-2">Create Your First Nema</h3>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            Get started by creating your personal AI companion. Each Nema has its own unique neural network 
            that evolves through your interactions.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-left bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300">
            <h4 className="font-medium text-cyan-400 mb-2">What is a Nema?</h4>
            <ul className="space-y-1 text-xs">
              <li>• An AI companion based on C. elegans neural networks</li>
              <li>• Learns and evolves through conversations with you</li>
              <li>• Has 348 simulated neurons that change over time</li>
              <li>• Currently limited to 1 Nema per user</li>
            </ul>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create My Nema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-cyan-400 mb-2">Create Your Nema</h3>
        <p className="text-gray-300 text-sm">
          Give your Nema a unique name and describe its personality or purpose.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nema Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
            placeholder="Enter a name for your Nema (1-50 characters)"
            maxLength={50}
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            {formData.name.length}/50 characters
          </div>
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
            placeholder="Describe your Nema's personality, purpose, or any special traits..."
            rows={4}
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            )}
            {isSubmitting ? 'Creating Nema...' : 'Create Nema'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NemaCreationFlow;