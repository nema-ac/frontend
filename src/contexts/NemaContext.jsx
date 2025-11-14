import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import profileService from '../services/profile.js';

export const NemaContext = createContext();

const SELECTED_NEMA_KEY = 'selected_nema_id';

export const NemaProvider = ({ children }) => {
  const { isAuthenticated, profile } = useContext(AuthContext);
  const [nemas, setNemas] = useState([]);
  const [selectedNema, setSelectedNema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load nemas when user is authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      loadNemas();
    } else {
      // Clear nemas when not authenticated
      setNemas([]);
      setSelectedNema(null);
      localStorage.removeItem(SELECTED_NEMA_KEY);
    }
  }, [isAuthenticated, profile]);

  // Auto-select nema when nemas list changes
  useEffect(() => {
    if (nemas.length > 0 && !selectedNema) {
      // Try to restore last selected nema from localStorage
      const savedNemaId = localStorage.getItem(SELECTED_NEMA_KEY);
      if (savedNemaId) {
        const savedNema = nemas.find(nema => nema.id.toString() === savedNemaId);
        if (savedNema) {
          setSelectedNema(savedNema);
          return;
        }
      }
      
      // If no saved selection or saved nema not found, select first active nema
      const firstActiveNema = nemas.find(nema => !nema.archived);
      if (firstActiveNema) {
        setSelectedNema(firstActiveNema);
        localStorage.setItem(SELECTED_NEMA_KEY, firstActiveNema.id.toString());
      }
    }
  }, [nemas, selectedNema]);

  const loadNemas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get nemas from profile (which includes caching)
      const userNemas = await profileService.getNemas();
      setNemas(userNemas);
    } catch (err) {
      console.error('Failed to load nemas:', err);
      setError(err.message);
      setNemas([]);
    } finally {
      setLoading(false);
    }
  };

  const selectNema = (nema) => {
    if (!nema) {
      setSelectedNema(null);
      localStorage.removeItem(SELECTED_NEMA_KEY);
      return;
    }

    setSelectedNema(nema);
    localStorage.setItem(SELECTED_NEMA_KEY, nema.id.toString());
  };

  const refreshNemas = async () => {
    // Clear cache and reload
    profileService.clearCache();
    await loadNemas();
  };

  const createNema = async (nemaData) => {
    try {
      const newNema = await profileService.createNema(nemaData);
      // Refresh nemas list to include the new one
      await refreshNemas();
      // Auto-select the newly created nema
      selectNema(newNema);
      return newNema;
    } catch (error) {
      throw new Error(`Failed to create nema: ${error.message}`);
    }
  };

  const updateNema = async (nemaData) => {
    try {
      await profileService.updateNema(nemaData);
      // Update local state
      setNemas(prev => prev.map(nema => 
        nema.id === nemaData.id ? { ...nema, ...nemaData } : nema
      ));
      // Update selected nema if it's the one being updated
      if (selectedNema && selectedNema.id === nemaData.id) {
        setSelectedNema(prev => ({ ...prev, ...nemaData }));
      }
    } catch (error) {
      throw new Error(`Failed to update nema: ${error.message}`);
    }
  };

  const deleteNema = async (nemaId) => {
    try {
      await profileService.deleteNema(nemaId);
      // Remove from local state
      setNemas(prev => prev.filter(nema => nema.id !== nemaId));
      // Clear selection if the deleted nema was selected
      if (selectedNema && selectedNema.id === nemaId) {
        setSelectedNema(null);
        localStorage.removeItem(SELECTED_NEMA_KEY);
      }
    } catch (error) {
      throw new Error(`Failed to delete nema: ${error.message}`);
    }
  };

  // Get available (non-archived) nemas
  const availableNemas = nemas.filter(nema => !nema.archived);

  const value = {
    nemas,
    availableNemas,
    selectedNema,
    loading,
    error,
    selectNema,
    loadNemas,
    refreshNemas,
    createNema,
    updateNema,
    deleteNema,
  };

  return (
    <NemaContext.Provider value={value}>
      {children}
    </NemaContext.Provider>
  );
};

// Custom hook for using NemaContext
export const useNema = () => {
  const context = useContext(NemaContext);
  if (!context) {
    throw new Error('useNema must be used within a NemaProvider');
  }
  return context;
};