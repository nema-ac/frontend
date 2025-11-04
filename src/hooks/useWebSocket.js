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
  const connectionIdRef = useRef(0); // Track connection instances to prevent stale handlers
  const seenMessagesRef = useRef(new Map()); // Track seen messages to prevent duplicates
  const lastActivityRef = useRef(null); // Track last activity time for heartbeat monitoring
  const heartbeatCheckIntervalRef = useRef(null); // Interval to check connection health
  
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
      // Increment connection ID to track this connection instance
      const currentConnectionId = ++connectionIdRef.current;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isManualCloseRef.current = false;

      ws.onopen = () => {
        // Only handle if this is still the current connection
        if (connectionIdRef.current !== currentConnectionId) {
          return;
        }
        
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        lastActivityRef.current = Date.now();
        
        // Browser WebSocket API automatically responds to server ping frames with pong frames
        // The server sends pings every 54 seconds and expects pong within 60 seconds
        // We track last activity to monitor connection health
        
        // Clear any existing heartbeat check interval
        if (heartbeatCheckIntervalRef.current) {
          clearInterval(heartbeatCheckIntervalRef.current);
        }
        
        // Optional: Monitor connection health by checking if we've received any activity
        // (messages or implicit pong responses) within a reasonable timeframe
        // Server pings are handled automatically by the browser, so we track message activity
        heartbeatCheckIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const now = Date.now();
            const timeSinceLastActivity = now - (lastActivityRef.current || now);
            
            // If we haven't received any activity in 90 seconds (server pings every 54s),
            // something might be wrong, but we'll let the server timeout handle it
            // This is mainly for debugging/monitoring purposes
            if (timeSinceLastActivity > 90000) {
              console.warn('WebSocket: No activity detected for', Math.floor(timeSinceLastActivity / 1000), 'seconds');
            }
          } else {
            // Connection is not open, clear the interval
            if (heartbeatCheckIntervalRef.current) {
              clearInterval(heartbeatCheckIntervalRef.current);
              heartbeatCheckIntervalRef.current = null;
            }
          }
        }, 30000); // Check every 30 seconds
        
        if (optionsRef.current.onOpen) {
          optionsRef.current.onOpen();
        }
      };

      ws.onmessage = (event) => {
        // Only handle if this is still the current connection
        if (connectionIdRef.current !== currentConnectionId) {
          return;
        }
        
        // Update last activity time - this includes both messages and implicit pong responses
        // to server ping frames (browser handles pongs automatically)
        lastActivityRef.current = Date.now();
        
        try {
          // Parse JSON message from backend
          // Backend sends: { user_id, username, text }
          // Note: WebSocket ping/pong frames are handled automatically by the browser
          // and don't trigger onmessage, but any regular messages do
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
        // Only handle if this is still the current connection
        if (connectionIdRef.current !== currentConnectionId) {
          return;
        }
        
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
        if (optionsRef.current.onError) {
          optionsRef.current.onError(err);
        }
      };

      ws.onclose = (event) => {
        // Only handle if this is still the current connection
        // This prevents stale connection handlers from interfering
        if (connectionIdRef.current !== currentConnectionId) {
          return;
        }
        
        setIsConnected(false);
        
        // Clean up heartbeat monitoring interval
        if (heartbeatCheckIntervalRef.current) {
          clearInterval(heartbeatCheckIntervalRef.current);
          heartbeatCheckIntervalRef.current = null;
        }
        
        // Reset activity tracking
        lastActivityRef.current = null;
        
        // Only clear wsRef if this is still the current connection
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        // Only attempt to reconnect if it wasn't manually closed
        if (!isManualCloseRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            // Double-check we still want to reconnect (component might have unmounted)
            if (connectionIdRef.current === currentConnectionId) {
              connect();
            }
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
    
    // Clean up heartbeat monitoring interval
    if (heartbeatCheckIntervalRef.current) {
      clearInterval(heartbeatCheckIntervalRef.current);
      heartbeatCheckIntervalRef.current = null;
    }
    
    // Reset activity tracking
    lastActivityRef.current = null;
    
    // Increment connection ID to invalidate any pending handlers
    connectionIdRef.current += 1;
    
    if (wsRef.current) {
      // Close with a normal closure code (not abnormal)
      try {
        wsRef.current.close(1000, 'Component unmounting');
      } catch (err) {
        // Ignore errors during close
      }
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

