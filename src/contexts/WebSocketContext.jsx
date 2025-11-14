import { createContext, useContext, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { AuthContext } from './AuthContext.jsx';

/**
 * WebSocket Context for User Chat
 * This context maintains a persistent WebSocket connection that stays open
 * even when navigating away from the Worminal page, ensuring messages are
 * always received and persisted.
 * Reconnects when authentication status changes.
 */
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const reconnectRef = useRef(null);

    const { messages, isConnected, error, sendMessage, disconnect, connect } = useWebSocket('/socket', {
        onMessage: () => {
            // Messages are automatically persisted via the hook
        },
    });

    // Reconnect WebSocket when authentication status changes
    useEffect(() => {
        // Small delay to ensure auth cookie is set before reconnecting
        if (reconnectRef.current) {
            clearTimeout(reconnectRef.current);
        }

        reconnectRef.current = setTimeout(() => {
            // Disconnect and reconnect to establish authenticated connection
            disconnect();
            // Small delay before reconnecting to ensure disconnect completes
            setTimeout(() => {
                connect();
            }, 100);
        }, 200);

        return () => {
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
            }
        };
    }, [isAuthenticated, disconnect, connect]);

    return (
        <WebSocketContext.Provider value={{ messages, isConnected, error, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
};

