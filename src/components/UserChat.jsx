import { useState, useEffect, useRef, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import config from '../config/environment.js';

/**
 * Simple chat component for users to discuss the worminal chat
 * All messages are left-aligned
 */
const UserChat = () => {
    const [input, setInput] = useState('');
    const [connectedClients, setConnectedClients] = useState([]);
    const [showClientsModal, setShowClientsModal] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const clientsModalRef = useRef(null);
    const { profile, user, isAuthenticated } = useContext(AuthContext);

    const { messages, isConnected, error, sendMessage } = useWebSocket('/socket', {
        onMessage: () => {
            // Auto-scroll to bottom when new message arrives (only scroll the chat container)
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        },
    });

    const scrollToBottom = (smooth = true) => {
        const container = messagesContainerRef.current;
        if (container) {
            // Scroll the container itself, not the window
            container.scrollTo({
                top: container.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || !isConnected) return;

        // Get username and userID for optimistic message
        const username = profile?.username || user?.wallet_address?.slice(0, 8) || 'You';
        const userID = user?.wallet_address || profile?.wallet_address || 'local';

        sendMessage(trimmedInput, username, userID);
        setInput('');
        inputRef.current?.focus();

        // Scroll to show the new message after sending
        setTimeout(() => {
            scrollToBottom(true);
        }, 100);
    };

    // Poll connected clients every 15 seconds
    useEffect(() => {
        const fetchConnectedClients = async () => {
            try {
                const response = await fetch(`${config.api.baseUrl}/socket/clients`);
                if (response.ok) {
                    const data = await response.json();
                    setConnectedClients(data.clients || []);
                }
            } catch (err) {
                console.error('Error fetching connected clients:', err);
            }
        };

        // Fetch immediately
        fetchConnectedClients();

        // Then poll every 15 seconds
        const interval = setInterval(fetchConnectedClients, 15000);

        return () => clearInterval(interval);
    }, []);

    // Close modal when clicking outside (but not when clicking the button itself)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if clicking the button (it handles its own toggle)
            if (event.target.closest('button[title="View connected users"]')) {
                return;
            }

            if (clientsModalRef.current && !clientsModalRef.current.contains(event.target)) {
                setShowClientsModal(false);
            }
        };

        if (showClientsModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showClientsModal]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="h-full flex flex-col border border-nema-gray bg-nema-black/30 font-anonymous text-xs">
            {/* Chat Header */}
            <div className="relative flex items-center justify-between p-1.5 border-b border-nema-gray flex-shrink-0">
                <h3 className="nema-display nema-header-2 text-nema-cyan text-xs">USER CHAT</h3>
                <div className="flex items-center gap-2">
                    {/* Connected Clients Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowClientsModal(!showClientsModal);
                        }}
                        className="text-nema-white hover:text-nema-cyan transition-colors"
                        title="View connected users"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>

                    {/* Connection Status */}
                    <div className="relative group">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        {/* Tooltip */}
                        {isConnected && (
                            <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-nema-black border border-nema-gray text-nema-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                You are live
                            </div>
                        )}
                    </div>

                    {/* Connected Clients Modal */}
                    {showClientsModal && (
                        <div ref={clientsModalRef} className="absolute right-0 top-full mt-2 bg-nema-black border border-nema-gray rounded-lg shadow-lg z-50 min-w-[200px] max-w-[300px]">
                            <div className="p-3 border-b border-nema-gray">
                                <div className="text-nema-cyan text-xs font-bold">VIEWERS ({connectedClients.length})</div>
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2">
                                {connectedClients.length === 0 ? (
                                    <div className="text-nema-gray-darker text-xs text-center py-4">
                                        No one online
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {connectedClients.map((username, index) => (
                                            <div key={index} className="text-nema-white text-xs py-1 px-2 hover:bg-nema-gray/20 rounded">
                                                {username}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 p-3 overflow-y-auto min-h-0">
                {error && (
                    <div className="mb-3 p-1.5 border border-red-500 bg-red-500/10 rounded text-red-400 text-xs">
                        {error}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="text-nema-gray-darker text-xs text-center py-6">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map((message) => (
                            <div key={message.id} className="text-left">
                                <div className="text-nema-white text-xs break-words">
                                    {message.text}
                                </div>
                                <div className="text-nema-gray-darker text-[10px] mt-0.5 flex items-center gap-1.5">
                                    <span>{message.username || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{formatTimestamp(message.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Only show for authenticated users */}
            {isAuthenticated ? (
                <div className="p-2 border-t border-nema-gray flex-shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-1.5 w-full min-w-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isConnected ? "Type a message..." : "Connecting..."}
                            disabled={!isConnected}
                            className="flex-1 min-w-0 bg-transparent text-nema-white outline-none caret-nema-cyan placeholder-nema-gray-darker font-anonymous text-xs"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !input.trim()}
                            className="flex-shrink-0 px-3 py-1.5 bg-nema-cyan text-nema-black font-bold rounded hover:bg-nema-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                        >
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-2 border-t border-nema-gray flex-shrink-0">
                    <div className="text-nema-gray-darker text-[10px] text-center py-1.5">
                        Sign in to send messages
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserChat;

