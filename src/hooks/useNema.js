/**
 * React hooks for Nema API integration
 * Provides state management and data fetching for neural network interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import nemaService from '../services/nema.js';
import { NetworkError, ServerError } from '../services/api.js';

/**
 * Hook for fetching and managing neural state
 */
export const useNeuralState = (options = {}) => {
  const { 
    autoFetch = false, 
    refetchInterval = null,
    onError = null 
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const intervalRef = useRef(null);

  const fetchNeuralState = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const neuralState = await nemaService.getNeuralState();
      setState({
        data: neuralState,
        loading: false,
        error: null,
      });
      return neuralState;
    } catch (error) {
      const errorState = {
        data: null,
        loading: false,
        error: {
          message: error.message,
          type: error.constructor.name,
          status: error.status || null,
        },
      };
      setState(errorState);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [onError]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNeuralState();
    }
  }, [autoFetch, fetchNeuralState]);

  // Set up polling interval
  useEffect(() => {
    if (refetchInterval && typeof refetchInterval === 'number' && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!state.loading) {
          fetchNeuralState();
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, state.loading, fetchNeuralState]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch: fetchNeuralState,
    isOnline: state.data !== null && !state.error,
  };
};

/**
 * Hook for sending prompts to Nema
 */
export const useSendPrompt = (options = {}) => {
  const { 
    onSuccess = null, 
    onError = null,
    onPromptSent = null 
  } = options;

  const [state, setState] = useState({
    loading: false,
    error: null,
    response: null,
  });

  const sendPrompt = useCallback(async (message) => {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      const error = new Error('Message cannot be empty');
      setState(prev => ({ ...prev, error: { message: error.message, type: 'ValidationError' } }));
      if (onError) onError(error);
      throw error;
    }

    setState({
      loading: true,
      error: null,
      response: null,
    });

    // Call onPromptSent callback immediately when starting
    if (onPromptSent) {
      onPromptSent(message.trim());
    }

    try {
      const response = await nemaService.sendPrompt(message);
      
      setState({
        loading: false,
        error: null,
        response,
      });

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      const errorState = {
        loading: false,
        error: {
          message: error.message,
          type: error.constructor.name,
          status: error.status || null,
        },
        response: null,
      };
      
      setState(errorState);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [onSuccess, onError, onPromptSent]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResponse = useCallback(() => {
    setState(prev => ({ ...prev, response: null }));
  }, []);

  return {
    ...state,
    sendPrompt,
    clearError,
    clearResponse,
  };
};

/**
 * Hook for managing a conversation history
 */
export const useConversation = (options = {}) => {
  const { 
    maxMessages = 100, 
    onError = null,
    loadHistory = false,
    historyLimit = 20,
    onNeuralStateUpdate = null
  } = options;
  
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const historyAttemptedRef = useRef(false);
  
  const { sendPrompt, loading, error } = useSendPrompt({
    onSuccess: (response) => {
      setIsTyping(false);
      addMessage({
        type: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
        neuralState: response.neuralState,
        stateChanges: response.stateChanges,
      });
      
      // Update neural state if callback provided and state exists
      if (onNeuralStateUpdate && response.neuralState) {
        onNeuralStateUpdate(response.neuralState);
      }
    },
    onError: (error) => {
      setIsTyping(false);
      if (onError) onError(error);
    },
    onPromptSent: (message) => {
      addMessage({
        type: 'user',
        content: message,
        timestamp: new Date(),
      });
      setIsTyping(true);
    },
  });

  const addMessage = useCallback((message) => {
    setConversation(prev => {
      const newConversation = [...prev, { id: Date.now(), ...message }];
      // Keep only the most recent messages
      return newConversation.slice(-maxMessages);
    });
  }, [maxMessages]);

  const sendMessage = useCallback(async (message) => {
    try {
      return await sendPrompt(message);
    } catch (error) {
      // Error handling is done in the useSendPrompt hook
      throw error;
    }
  }, [sendPrompt]);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setIsTyping(false);
    setHistoryLoaded(false);
    historyAttemptedRef.current = false; // Reset attempt flag
  }, []);

  // Load history on mount if enabled
  const loadHistoryMessages = useCallback(async () => {
    // Prevent multiple attempts - if we've tried once, don't try again
    if (!loadHistory || historyLoaded || isLoadingHistory || historyAttemptedRef.current) {
      return;
    }
    
    historyAttemptedRef.current = true; // Mark as attempted immediately
    setIsLoadingHistory(true);
    
    try {
      const historyData = await nemaService.getHistory(historyLimit);
      
      // Convert history messages to conversation format
      const historyMessages = historyData.messages.map(msg => ({
        id: msg.id,
        type: msg.type === 'nema' ? 'assistant' : msg.type, // Convert "nema" to "assistant" for consistency
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      
      // Set the conversation with history messages
      setConversation(historyMessages);
      setHistoryLoaded(true);
    } catch (error) {
      // If it fails, it fails - don't retry
      setHistoryLoaded(true); // Mark as "done" even on failure to prevent retries
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [loadHistory, historyLoaded, isLoadingHistory, historyLimit, onError]);

  // Load history when component mounts
  useEffect(() => {
    if (loadHistory && !historyLoaded && !isLoadingHistory) {
      loadHistoryMessages();
    }
  }, [loadHistory, historyLoaded, isLoadingHistory]); // Removed loadHistoryMessages from deps to prevent infinite loop

  return {
    conversation,
    isTyping,
    loading,
    error,
    isLoadingHistory,
    historyLoaded,
    sendMessage,
    clearConversation,
    addMessage,
    loadHistoryMessages,
  };
};

/**
 * Hook for health checking the Nema backend
 */
export const useNemaHealth = (options = {}) => {
  const { checkInterval = 30000, autoCheck = true } = options; // Check every 30 seconds by default
  
  const [isHealthy, setIsHealthy] = useState(null); // null = unknown, true/false = status
  const [lastChecked, setLastChecked] = useState(null);
  const intervalRef = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      const healthy = await nemaService.checkHealth();
      setIsHealthy(healthy);
      setLastChecked(new Date());
      return healthy;
    } catch {
      setIsHealthy(false);
      setLastChecked(new Date());
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      // Check immediately
      checkHealth();
      
      // Set up interval
      if (checkInterval > 0) {
        intervalRef.current = setInterval(checkHealth, checkInterval);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoCheck, checkInterval, checkHealth]);

  return {
    isHealthy,
    lastChecked,
    checkHealth,
  };
};