import { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';

/**
 * WebSocket Context for User Chat
 * This context maintains a persistent WebSocket connection that stays open
 * even when navigating away from the Worminal page, ensuring messages are
 * always received and persisted.
 */
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { messages, isConnected, error, sendMessage } = useWebSocket('/socket', {
        onMessage: () => {
            // Messages are automatically persisted via the hook
        },
    });

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

