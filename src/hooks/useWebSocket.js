import { useEffect, useRef, useState, useCallback } from 'react';
import config from '../config/environment.js';

/**
 * Custom hook for managing WebSocket connection
 * Handles connection, message sending/receiving, and reconnection
 */
export const useWebSocket = (url, options = {}) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const optionsRef = useRef(options);
  const isManualCloseRef = useRef(false);
  const seenMessagesRef = useRef(new Map()); // Track seen messages to prevent duplicates
  
  // Update options ref when options change (but don't trigger reconnection)
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectDelay = options.reconnectDelay || 3000;

  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (wsRef.current) {
      const state = wsRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return;
      }
      // If closing or closed, clean up first
      if (state === WebSocket.CLOSING || state === WebSocket.CLOSED) {
        wsRef.current = null;
      }
    }

    // Get WebSocket URL - use ws:// or wss:// based on the API base URL
    const apiUrl = config.api.baseUrl;
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsUrl = url.startsWith('ws') ? url : `${wsProtocol}://${wsHost}${url}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isManualCloseRef.current = false;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        if (optionsRef.current.onOpen) {
          optionsRef.current.onOpen();
        }
      };

      ws.onmessage = (event) => {
        try {
          // Parse JSON message from backend
          // Backend sends: { user_id, username, text }
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (err) {
            console.error('Failed to parse WebSocket message as JSON:', err);
            return;
          }

          // Extract message fields (backend uses snake_case: user_id, username, text)
          const messageText = data.text || '';
          const userID = data.user_id || data.userID || 'unknown';
          const username = data.username || 'Unknown';
          
          if (!messageText) {
            console.warn('Received message with no text:', data);
            return;
          }
          
          // Create a unique key for deduplication: user_id + text + timestamp (rounded to seconds)
          const now = Date.now();
          const nowSeconds = Math.floor(now / 1000);
          const dedupeKey = `${userID}-${messageText}-${nowSeconds}`;
          
          // Check if we've already seen this exact message recently (within 2 seconds)
          const lastSeen = seenMessagesRef.current.get(dedupeKey);
          
          if (lastSeen && (now - lastSeen < 2000)) {
            // Already seen this message within the last 2 seconds, skip it
            return;
          }
          
          // Add to seen messages with current timestamp
          seenMessagesRef.current.set(dedupeKey, now);
          
          // Clean up old entries (older than 5 seconds)
          seenMessagesRef.current.forEach((time, key) => {
            if (now - time > 5000) {
              seenMessagesRef.current.delete(key);
            }
          });

          const message = {
            id: `${now}-${Math.random()}-${userID}`,
            text: messageText,
            username: username,
            userID: userID,
            timestamp: new Date(now),
          };

          setMessages(prev => [...prev, message]);
          
          if (optionsRef.current.onMessage) {
            optionsRef.current.onMessage(message);
          }
        } catch (err) {
          console.error('Error processing websocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
        if (optionsRef.current.onError) {
          optionsRef.current.onError(err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        // Only attempt to reconnect if it wasn't manually closed
        if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to reconnect. Please refresh the page.');
        }

        if (optionsRef.current.onClose) {
          optionsRef.current.onClose();
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
      wsRef.current = null;
    }
  }, [url, maxReconnectAttempts, reconnectDelay]);

  const sendMessage = useCallback((messageText, username = 'You', userID = 'local') => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    const trimmedText = messageText.trim();
    if (!trimmedText) {
      return false;
    }

    // Add message optimistically (sender sees their own message immediately)
    const now = Date.now();
    const optimisticMessage = {
      id: `optimistic-${now}-${Math.random()}`,
      text: trimmedText,
      username: username,
      userID: userID,
      timestamp: new Date(now),
      isOptimistic: true, // Flag to identify optimistic messages
    };

    // Add to messages immediately
    setMessages(prev => [...prev, optimisticMessage]);

    // Send as plain text (backend expects raw bytes and will add user info)
    wsRef.current.send(trimmedText);
    
    return true;
  }, []);

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only reconnect if URL changes

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    disconnect,
    connect,
  };
};

