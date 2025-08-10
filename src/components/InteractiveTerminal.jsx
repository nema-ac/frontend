/**
 * Interactive Terminal component for Worminal
 * Classic terminal interface with Nema chat functionality
 */

import { useState, useEffect, useRef } from 'react';
import { useConversation } from '../hooks/useNema.js';
import { ErrorDisplay } from './ErrorBoundary.jsx';

const InteractiveTerminal = () => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initializationRef = useRef(false);
  
  // Remove health checks to avoid CORS issues - we'll show connection status based on actual API calls
  const { 
    conversation, 
    isTyping, 
    loading, 
    error, 
    isLoadingHistory,
    historyLoaded,
    sendMessage, 
    clearConversation,
    addMessage
  } = useConversation({
    maxMessages: 100,
    loadHistory: true,
    historyLimit: 20,
    onError: (error) => {
      console.error('Conversation error:', error);
    }
  });

  // Initialize terminal with welcome message (using ref to prevent duplicates)
  // Only show welcome messages if we're not loading history or if history loading fails
  useEffect(() => {
    if (!initializationRef.current && !isLoadingHistory && (historyLoaded || error)) {
      initializationRef.current = true;
      
      // If history was loaded successfully, show a brief status
      if (historyLoaded && conversation.length > 0) {
        setTimeout(() => {
          addMessage({
            type: 'system',
            content: `Loaded ${conversation.length} previous messages. Type "help" for commands.`,
            timestamp: new Date()
          });
        }, 500);
      } else {
        // Show full welcome messages if no history or history failed
        setTimeout(() => {
          const welcomeMessages = [
            'NEMA Neural Network Terminal v2.0',
            'Initializing connection to neural substrate...',
            '348 neurons online | C. elegans connectome active',
            'Type "help" for available commands or start chatting with NEMA'
          ];
          
          // Add messages with delays for typing effect
          welcomeMessages.forEach((content, index) => {
            setTimeout(() => {
              addMessage({
                type: 'system', 
                content, 
                timestamp: new Date()
              });
            }, index * 800);
          });
        }, 500);
      }
    }
  }, [addMessage, isLoadingHistory, historyLoaded, error, conversation.length]);

  // Use conversation directly from the hook
  const allMessages = conversation;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, isTyping]);

  // Focus input on mount and clicks
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(1);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleClearTerminal();
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
    }
  };

  // Command history navigation
  const navigateHistory = (direction) => {
    if (commandHistory.length === 0) return;
    
    const newIndex = historyIndex + direction;
    if (newIndex >= -1 && newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - newIndex]);
    }
  };

  // Handle terminal commands
  const handleCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'help':
        return {
          type: 'system',
          content: `Available commands:
• help - Show this help message
• clear - Clear terminal history
• status - Show NEMA neural network status
• ping - Test connection to NEMA
• history - Show command history
• exit - Close terminal session

Or simply type a message to chat with NEMA!`,
          timestamp: new Date()
        };
        
      case 'clear':
        handleClearTerminal();
        return null;
        
      case 'status':
        return {
          type: 'system',
          content: `NEMA Status:
• Neural Network: Ready for interaction
• Total Neurons: 348 (95 motor + 253 sensory)
• Connection: Send a message to test connectivity
• Terminal: Active and ready`,
          timestamp: new Date()
        };
        
      case 'ping':
        return {
          type: 'system',
          content: 'PONG - Terminal ready. Send a message to test NEMA connectivity.',
          timestamp: new Date()
        };
        
      case 'history':
        return {
          type: 'system',
          content: commandHistory.length > 0 
            ? `Command history:\n${commandHistory.map((cmd, i) => `  ${i + 1}. ${cmd}`).join('\n')}`
            : 'No command history available',
          timestamp: new Date()
        };
        
      case 'exit':
        return {
          type: 'system',
          content: 'Neural connection terminated. Refresh page to reconnect.',
          timestamp: new Date()
        };
        
      default:
        return null; // Not a command, treat as regular message
    }
  };

  // Send message or execute command
  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);
    
    // Check if it's a command
    const commandResponse = handleCommand(trimmedInput);
    if (commandResponse) {
      addMessage(commandResponse);
      setInput('');
      return;
    }

    // Clear input immediately for better UX
    setInput('');

    try {
      await sendMessage(trimmedInput);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Clear terminal
  const handleClearTerminal = () => {
    clearConversation();
  };

  // Format timestamp for messages
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get message styling based on type
  const getMessageStyle = (type) => {
    switch (type) {
      case 'user':
        return 'text-green-400';
      case 'assistant':
      case 'nema': // Support both "assistant" (from hook) and "nema" (from API)
        return 'text-blue-400';
      case 'system':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  // Get prompt prefix based on type
  const getPromptPrefix = (type) => {
    switch (type) {
      case 'user':
        return 'user@worminal:~$';
      case 'assistant':
      case 'nema': // Support both "assistant" (from hook) and "nema" (from API)
        return 'nema@neural:~>';
      case 'system':
        return 'system@worminal:~#';
      default:
        return '>';
    }
  };

  return (
    <div className="neon-border bg-black rounded-lg font-mono text-sm h-[600px] flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400">WORMINAL - Neural Interface</div>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1 text-cyan-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span>READY</span>
          </div>
          <div className="text-gray-400">
            {formatTimestamp(new Date())}
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            className="mb-4"
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Loading History Indicator */}
        {isLoadingHistory && (
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 text-xs min-w-fit">
              [{formatTimestamp(new Date())}] system@worminal:~#
            </span>
            <div className="text-yellow-400 flex items-center space-x-1">
              <span>Loading message history</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2">
          {allMessages.map((message, index) => (
            <div key={message.id || index} className="flex flex-col">
              <div className="flex items-start space-x-2">
                <span className={`${getMessageStyle(message.type)} text-xs min-w-fit`}>
                  [{formatTimestamp(message.timestamp)}] {getPromptPrefix(message.type)}
                </span>
                <div className={`${getMessageStyle(message.type)} flex-1 whitespace-pre-wrap break-words`}>
                  {message.content}
                </div>
              </div>
              
              {/* Neural State Changes (for assistant messages) */}
              {message.stateChanges && (
                <div className="ml-4 mt-1 text-xs text-purple-400">
                  <span className="text-gray-400">Neural state changes:</span> {JSON.stringify(message.stateChanges)}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2">
              <span className="text-green-400 text-xs min-w-fit">
                [{formatTimestamp(new Date())}] nema@neural:~&gt;
              </span>
              <div className="text-green-400 flex items-center space-x-1">
                <span>thinking</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Terminal Input */}
      <div className="p-4 border-t border-cyan-400/30">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400 text-xs min-w-fit">
            [{formatTimestamp(new Date())}] user@worminal:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-cyan-400 outline-none caret-cyan-400"
            placeholder="Type a message or command..."
            disabled={loading}
            autoFocus
          />
          {loading && (
            <div className="text-yellow-400 text-xs">
              <span className="animate-pulse">...</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 border-t border-cyan-400/30 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div>
            Press Ctrl+L to clear, Ctrl+C to cancel, ↑/↓ for history
          </div>
          <div>
            Messages: {allMessages.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTerminal;