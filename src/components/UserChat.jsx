import { useState, useEffect, useRef, useContext } from 'react';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import config from '../config/environment.js';
import EmojiPicker from './EmojiPicker.jsx';
import TransactionMessage from './TransactionMessage.jsx';
import SessionClaimMessage from './SessionClaimMessage.jsx';
import { useWorminalAccessContext } from '../contexts/WorminalAccessContext.jsx';
import { validateChatMessage, getByteLength } from '../utils/validation.js';

/**
 * Simple chat component for users to discuss the worminal chat
 * All messages are left-aligned
 */
const UserChat = () => {
    const [input, setInput] = useState('');
    const [connectedClients, setConnectedClients] = useState([]);
    const [showClientsModal, setShowClientsModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const clientsModalRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const { profile, user, isAuthenticated } = useContext(AuthContext);

    const { messages, isConnected, error, sendMessage } = useWebSocketContext();
    const { claimSession, refreshSession } = useWorminalAccessContext();
    const lastClaimedSessionIdRef = useRef(null);
    const lastClaimSessionIdRef = useRef(null);

    // Refresh session state when session_claimed message is received
    useEffect(() => {
        const claimedMessage = messages.find(msg =>
            msg.type === 'session_claimed' &&
            msg.sessionId !== lastClaimedSessionIdRef.current
        );

        if (claimedMessage) {
            lastClaimedSessionIdRef.current = claimedMessage.sessionId;
            refreshSession();
        }
    }, [messages, refreshSession]);

    // Refresh session state when session_claim message is received (session became open for anyone)
    useEffect(() => {
        const claimMessage = messages.find(msg =>
            msg.type === 'session_claim' &&
            msg.sessionId !== lastClaimSessionIdRef.current
        );

        if (claimMessage) {
            lastClaimSessionIdRef.current = claimMessage.sessionId;
            refreshSession();
        }
    }, [messages, refreshSession]);

    const scrollToBottom = (smooth = false) => {
        const container = messagesContainerRef.current;
        if (container) {
            // Scroll the container itself, not the window
            container.scrollTo({
                top: container.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    // Scroll to bottom immediately on mount
    useEffect(() => {
        scrollToBottom(false);
    }, []);

    // Auto-scroll to bottom when new message arrives (immediate, no animation)
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom(false);
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || !isConnected) return;

        // Validate message (200 byte limit, no URLs)
        const validation = validateChatMessage(trimmedInput);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // Get username and userID for optimistic message
        const username = profile?.username || user?.wallet_address?.slice(0, 8) || 'You';
        const userID = user?.wallet_address || profile?.wallet_address || 'local';

        sendMessage(trimmedInput, username, userID);
        setInput('');
        setShowEmojiPicker(false);
        inputRef.current?.focus();

        // Scroll to show the new message after sending (immediate, no animation)
        setTimeout(() => {
            scrollToBottom(false);
        }, 0);
    };

    const handleEmojiSelect = (emoji) => {
        const textarea = inputRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = input.substring(0, start) + emoji + input.substring(end);
            setInput(text);

            // Set cursor position after emoji
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setInput(input + emoji);
        }
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

            // Close emoji picker when clicking outside
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                // Don't close if clicking the emoji button
                if (!event.target.closest('button[title="Add emoji"]')) {
                    setShowEmojiPicker(false);
                }
            }
        };

        if (showClientsModal || showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showClientsModal, showEmojiPicker]);

    // Auto-resize textarea to expand upward, then become scrollable
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height based on scrollHeight (content)
            const scrollHeight = textarea.scrollHeight;
            // Limit max height (e.g., 4 lines)
            const maxHeight = 96; // ~4 lines at 24px line height
            const newHeight = Math.min(scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;

            // Enable scrolling if content exceeds max height
            if (scrollHeight > maxHeight) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    }, [input]);

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
                        {messages.map((message) => {
                            // Render transaction messages differently
                            if (message.type === 'transaction') {
                                return (
                                    <div key={message.id} className="text-left">
                                        <TransactionMessage
                                            transactionId={message.transactionId}
                                            username={message.username}
                                            nemaName={message.nemaName}
                                            completed={message.completed}
                                            timestamp={message.timestamp}
                                        />
                                    </div>
                                );
                            }

                            // Render session claim messages
                            if (message.type === 'session_claim') {
                                return (
                                    <div key={message.id} className="text-left">
                                        <SessionClaimMessage
                                            sessionId={message.sessionId}
                                            message={message.message}
                                            timestamp={message.timestamp}
                                            onClaim={claimSession}
                                            refreshSession={refreshSession}
                                        />
                                    </div>
                                );
                            }

                            // Render session claimed messages (when someone claims a session)
                            if (message.type === 'session_claimed') {
                                return (
                                    <div key={message.id} className="text-left">
                                        <div className="p-2 bg-nema-black/30 border border-nema-gray rounded text-xs">
                                            <div className="text-nema-cyan text-[10px] font-bold mb-1">SESSION CLAIMED</div>
                                            <div className="text-nema-white text-[10px]">{message.message}</div>
                                            <div className="text-nema-gray-darker text-[10px] mt-1">
                                                {formatTimestamp(message.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Render regular chat messages
                            return (
                                <div key={message.id} className="text-left">
                                    <div className="text-nema-white text-xs break-words">
                                        {message.text}
                                    </div>
                                    <div className="text-nema-gray-darker text-[10px] mt-0.5 flex items-center gap-1.5">
                                        <span>@{message.username || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{formatTimestamp(message.timestamp)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Only show for authenticated users */}
            {isAuthenticated ? (
                <div className="p-2 border-t border-nema-gray flex-shrink-0">
                    <form onSubmit={handleSend} className="flex items-end gap-1.5 w-full min-w-0">
                        <div className="flex-1 min-w-0 relative flex items-end">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    // Allow Enter to submit, Shift+Enter for new line
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                                disabled={!isConnected}
                                rows={1}
                                className="flex-1 min-w-0 bg-transparent text-nema-white outline-none caret-nema-cyan placeholder-nema-gray-darker font-anonymous text-base resize-none min-h-[24px] max-h-[96px]"
                                style={{
                                    height: 'auto',
                                    lineHeight: '24px',
                                    overflowY: 'hidden'
                                }}
                            />
                            {/* Emoji Picker Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEmojiPicker(!showEmojiPicker);
                                }}
                                className="flex-shrink-0 ml-1.5 p-1 text-nema-gray-darker hover:text-nema-cyan transition-colors"
                                title="Add emoji"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50">
                                    <EmojiPicker
                                        isOpen={showEmojiPicker}
                                        onEmojiSelect={handleEmojiSelect}
                                        onClose={() => setShowEmojiPicker(false)}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!isConnected || !input.trim() || getByteLength(input.trim()) > 200}
                            className={`flex-shrink-0 px-3 py-1.5 font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap ${getByteLength(input.trim()) > 200
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-nema-cyan text-nema-black hover:bg-nema-cyan/80'
                                }`}
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

