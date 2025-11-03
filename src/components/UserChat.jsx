import { useState, useEffect, useRef, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

/**
 * Simple chat component for users to discuss the worminal chat
 * All messages are left-aligned
 */
const UserChat = () => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { profile, user, isAuthenticated } = useContext(AuthContext);

    const { messages, isConnected, error, sendMessage } = useWebSocket('/socket', {
        onMessage: () => {
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        },
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Only auto-scroll when receiving messages from others (via onMessage callback)
    // Don't auto-scroll when user sends their own message

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
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="h-full flex flex-col border border-nema-gray bg-nema-black/30 font-anonymous text-sm">
            {/* Chat Header */}
            <div className="bg-nema-gray p-2 border-b border-nema-gray flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="nema-display nema-header-2 text-nema-black">USER CHAT</h3>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
                {error && (
                    <div className="mb-4 p-2 border border-red-500 bg-red-500/10 rounded text-red-400 text-xs">
                        {error}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="text-nema-gray-darker text-xs text-center py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((message) => (
                            <div key={message.id} className="text-left">
                                <div className="text-nema-white text-sm break-words">
                                    {message.text}
                                </div>
                                <div className="text-nema-gray-darker text-xs mt-1 flex items-center gap-2">
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
                <div className="p-4 border-t border-nema-gray flex-shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2 w-full min-w-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isConnected ? "Type a message..." : "Connecting..."}
                            disabled={!isConnected}
                            className="flex-1 min-w-0 bg-transparent text-nema-white outline-none caret-nema-cyan placeholder-nema-gray-darker font-anonymous text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !input.trim()}
                            className="flex-shrink-0 px-4 py-2 bg-nema-cyan text-nema-black font-bold rounded hover:bg-nema-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                        >
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-4 border-t border-nema-gray flex-shrink-0">
                    <div className="text-nema-gray-darker text-xs text-center py-2">
                        Sign in to send messages
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserChat;

