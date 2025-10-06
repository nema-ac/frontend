/**
 * Interactive Terminal component for Worminal
 * Classic terminal interface with Nema chat functionality
 */

import { useState, useEffect, useRef, useContext } from 'react';
import { useConversation } from '../hooks/useNema.js';
import { useNema } from '../contexts/NemaContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { ErrorDisplay } from './ErrorBoundary.jsx';
import nemaService from '../services/nema.js';
import CompactEmotionRadar from './CompactEmotionRadar.jsx';

const InteractiveTerminal = ({ isFullscreen = false, onToggleFullscreen }) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showNeuralState, setShowNeuralState] = useState(true);
  const [currentNeuralState, setCurrentNeuralState] = useState(null);
  const [previousNeuralState, setPreviousNeuralState] = useState(null);
  const [recentNeuralChanges, setRecentNeuralChanges] = useState([]);
  const [neuralSearchTerm, setNeuralSearchTerm] = useState('');
  const [motorExpanded, setMotorExpanded] = useState(false);
  const [sensoryExpanded, setSensoryExpanded] = useState(false);
  const [emotionsExpanded, setEmotionsExpanded] = useState(true); // Expanded by default
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNemaDropdown, setShowNemaDropdown] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initializationRef = useRef(false);

  // Nema context for multi-nema support
  const {
    availableNemas,
    selectedNema,
    selectNema,
    loading: nemasLoading,
    error: nemasError
  } = useNema();

  // Auth context for user info
  const { profile } = useContext(AuthContext);

  // Calculate differences between two neural states
  const calculateNeuralChanges = (oldState, newState) => {
    if (!oldState || !newState) return [];

    const changes = [];

    // Check motor neuron changes
    const allMotorNeurons = new Set([
      ...Object.keys(oldState.motorNeurons || {}),
      ...Object.keys(newState.motorNeurons || {})
    ]);

    for (const neuron of allMotorNeurons) {
      const oldValue = oldState.motorNeurons?.[neuron] || 0;
      const newValue = newState.motorNeurons?.[neuron] || 0;
      if (oldValue !== newValue) {
        changes.push({
          neuron,
          type: 'motor',
          oldValue,
          newValue,
          delta: newValue - oldValue
        });
      }
    }

    // Check sensory neuron changes
    const allSensoryNeurons = new Set([
      ...Object.keys(oldState.sensoryNeurons || {}),
      ...Object.keys(newState.sensoryNeurons || {})
    ]);

    for (const neuron of allSensoryNeurons) {
      const oldValue = oldState.sensoryNeurons?.[neuron] || 0;
      const newValue = newState.sensoryNeurons?.[neuron] || 0;
      if (oldValue !== newValue) {
        changes.push({
          neuron,
          type: 'sensory',
          oldValue,
          newValue,
          delta: newValue - oldValue
        });
      }
    }

    return changes;
  };

  // Format neural changes for display
  const formatNeuralChanges = (changes) => {
    if (!changes || changes.length === 0) return 'No neural changes';

    return changes
      .slice(0, 5) // Limit to first 5 changes to avoid clutter
      .map(change => {
        const sign = change.delta > 0 ? '+' : '';
        return `${change.neuron} ${sign}${change.delta}`;
      })
      .join(', ');
  };

  // Filter neurons based on search term and active-only toggle
  const filterNeurons = (neurons) => {
    if (!neurons) return {};

    let filtered = { ...neurons };

    // Filter by search term
    if (neuralSearchTerm) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([name]) =>
          name.toLowerCase().includes(neuralSearchTerm.toLowerCase())
        )
      );
    }

    // Filter by active-only
    if (showActiveOnly) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([, value]) => value !== 0)
      );
    }

    return filtered;
  };

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
    nemaId: selectedNema?.id,
    maxMessages: 100,
    loadHistory: true,
    historyLimit: 20,
    onError: (error) => {
      console.error('Conversation error:', error);
    },
    onNeuralStateUpdate: (neuralState) => {
      // Calculate changes between previous and new state
      const changes = calculateNeuralChanges(currentNeuralState, neuralState);
      setRecentNeuralChanges(changes);

      // Update states
      setPreviousNeuralState(currentNeuralState);
      setCurrentNeuralState(neuralState);
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
            '302 neurons online | C. elegans connectome active',
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

  // Load initial neural state on mount
  // Load neural state when selectedNema changes
  useEffect(() => {
    if (selectedNema) {
      // Clear previous neural state and fetch new one
      setCurrentNeuralState(null);
      fetchCurrentNeuralState();
    } else {
      // Clear neural state when no nema selected
      setCurrentNeuralState(null);
    }
  }, [selectedNema]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use conversation directly from the hook
  const allMessages = conversation;

  // Auto-scroll to bottom (container only, not page)
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [allMessages, isTyping]);

  // Focus input when clicking within terminal area only
  useEffect(() => {
    const terminalElement = messagesEndRef.current?.closest('.neon-border');
    if (!terminalElement) return;

    const handleTerminalClick = (e) => {
      // Only focus if the click target is not an input or button
      if (!e.target.matches('input, button, a, [contenteditable="true"]')) {
        inputRef.current?.focus();
      }
    };

    terminalElement.addEventListener('click', handleTerminalClick);
    return () => terminalElement.removeEventListener('click', handleTerminalClick);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory(1); // Up = go back in history (older)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(-1); // Down = go forward in history (newer)
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
• status - Show NEMA neural network status
• ping - Test connection to NEMA
• state - Toggle neural state sidebar
• nemas - List all your nemas
• select <name> - Select a nema by name

Or simply type a message to chat with your selected NEMA!`,
          timestamp: new Date()
        };

      case 'status':
        return {
          type: 'system',
          content: `NEMA Status:
• Neural Network: Ready for interaction
• Total Neurons: 302 (95 motor + 207 sensory)
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

      case 'state':
        // Toggle neural state sidebar
        if (showNeuralState) {
          setShowNeuralState(false);
          return {
            type: 'system',
            content: 'Neural state viewer closed.',
            timestamp: new Date()
          };
        } else {
          fetchCurrentNeuralState();
          return {
            type: 'system',
            content: 'Opening neural state viewer...',
            timestamp: new Date()
          };
        }

      case 'nemas':
        if (nemasLoading) {
          return {
            type: 'system',
            content: 'Loading nemas...',
            timestamp: new Date()
          };
        }

        if (nemasError) {
          return {
            type: 'system',
            content: `Error loading nemas: ${nemasError}`,
            timestamp: new Date()
          };
        }

        if (availableNemas.length === 0) {
          return {
            type: 'system',
            content: 'No nemas found. Visit your profile to create your first nema!',
            timestamp: new Date()
          };
        }

        const nemasList = availableNemas.map(nema =>
          `• ${nema.name}${nema.id === selectedNema?.id ? ' (selected)' : ''} - ${nema.description || 'No description'}`
        ).join('\n');

        return {
          type: 'system',
          content: `Your nemas (${availableNemas.length}):\n${nemasList}`,
          timestamp: new Date()
        };

      default:
        // Check if it's a select command
        if (cmd.startsWith('select ')) {
          const nemaName = command.slice(7).trim(); // Remove "select " prefix

          if (!nemaName) {
            return {
              type: 'system',
              content: 'Usage: select <name>\nExample: select MyFirstNema',
              timestamp: new Date()
            };
          }

          const targetNema = availableNemas.find(nema =>
            nema.name.toLowerCase() === nemaName.toLowerCase()
          );

          if (!targetNema) {
            return {
              type: 'system',
              content: `Nema "${nemaName}" not found. Use "nemas" to list available nemas.`,
              timestamp: new Date()
            };
          }

          selectNema(targetNema);
          return {
            type: 'system',
            content: `Selected nema: ${targetNema.name}${targetNema.description ? ` - ${targetNema.description}` : ''}`,
            timestamp: new Date()
          };
        }

        // Not a recognized command, return null so it gets treated as a chat message
        return null;
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
      // Refocus input after command (only if no other element is focused)
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          inputRef.current?.focus();
        }
      }, 100);
      return;
    }

    // If not a command, check if we have a selected nema for chat
    if (!selectedNema) {
      addMessage({
        type: 'system',
        content: 'No nema selected. Please select a nema first or use terminal commands like "help", "nemas", or "select <name>".',
        timestamp: new Date()
      });
      setInput('');
      return;
    }

    // Clear input immediately for better UX
    setInput('');

    try {
      await sendMessage(trimmedInput);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      // Refocus input after message is sent (success or failure)
      // Only if the document's active element is not something else the user clicked on
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          inputRef.current?.focus();
        }
      }, 100);
    }
  };

  // Clear terminal
  const handleClearTerminal = () => {
    clearConversation();
  };

  // Fetch current neural state (only when no state exists)
  const fetchCurrentNeuralState = async () => {
    if (!selectedNema) {
      addMessage({
        type: 'system',
        content: 'No nema selected. Please select a nema first.',
        timestamp: new Date()
      });
      return;
    }

    if (currentNeuralState) {
      // If we already have state, just show the sidebar
      setShowNeuralState(true);
      return;
    }

    try {
      const neuralState = await nemaService.getNeuralState(selectedNema.id);
      setCurrentNeuralState(neuralState);
      setShowNeuralState(true);
    } catch (error) {
      addMessage({
        type: 'system',
        content: `Error fetching neural state: ${error.message}`,
        timestamp: new Date()
      });
    }
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

  return (
    <div className={`space-y-4 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
      <div className={`flex flex-col lg:flex-row gap-2 ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
        {/* Terminal */}
        <div className={`border border-nema-gray bg-nema-black/30 font-anonymous text-sm flex flex-col transition-all duration-300 ${
          isFullscreen
            ? 'h-full w-full'
            : `min-h-[600px] ${showNeuralState ? 'w-full lg:w-2/3' : 'w-full'}`
        }`}>
          {/* Terminal Header - Nema Selection Interface */}
          <div className="bg-nema-gray p-4 border-b border-nema-gray">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                {nemasLoading ? (
                  <div className="text-nema-black text-sm nema-header-2">Loading your nemas...</div>
                ) : nemasError ? (
                  <div className="text-red-600 text-sm nema-header-2">Error: {nemasError}</div>
                ) : availableNemas.length === 0 ? (
                  <div className="text-nema-black text-sm nema-header-2">
                    No nemas found. Visit your <a href="/profile" className="text-nema-black underline font-bold">profile</a> to create your first nema!
                  </div>
                ) : (
                  <div className="relative">
                    {/* Nema Name with Dropdown Toggle */}
                    <button
                      onClick={() => setShowNemaDropdown(!showNemaDropdown)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <h3 className="nema-display nema-header-2 text-nema-black">
                        NEURAL INTERFACE - {selectedNema?.name.toUpperCase() || 'SELECT NEMA'}
                      </h3>
                      <svg
                        className={`w-4 h-4 text-nema-black transition-transform cursor-pointer ${showNemaDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showNemaDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-nema-black border border-nema-gray rounded-lg shadow-lg z-50 min-w-64">
                        {availableNemas.map(nema => (
                          <button
                            key={nema.id}
                            onClick={() => {
                              selectNema(nema);
                              setShowNemaDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-nema-gray/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              selectedNema?.id === nema.id ? 'bg-nema-gray/10' : ''
                            }`}
                          >
                            {nema.avatar_encoded && (
                              <img
                                src={nema.avatar_encoded}
                                alt={`${nema.name} Avatar`}
                                className="w-8 h-8 rounded-full border-2 border-nema-cyan"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-nema-white font-bold text-sm">{nema.name}</div>
                              {nema.description && (
                                <div className="text-nema-gray-darker text-xs">{nema.description}</div>
                              )}
                            </div>
                            {selectedNema?.id === nema.id && (
                              <svg className="w-5 h-5 text-nema-cyan" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Ready status on the right */}
              <div className="flex items-center gap-4">
                {!selectedNema && availableNemas.length > 0 && (
                  <div className="text-xs text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
                    ⚠️ Select a nema to start chatting
                  </div>
                )}
                <div className="text-nema-black font-anonymous nema-caption-2">
                  <span className="text-nema-black/70">Ready</span> {formatTimestamp(currentTime)}
                </div>
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

            {/* No Nema Selected Message */}
            {!selectedNema && availableNemas.length > 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-cyan-400 text-lg mb-4">⚠️ No Nema Selected</div>
                <div className="text-gray-300 mb-6 max-w-md">
                  Please select a nema from the dropdown above to start chatting.
                  You can also use terminal commands to manage your nemas.
                </div>
                <div className="text-sm text-gray-400 space-y-2">
                  <div><code className="text-cyan-300">nemas</code> - List all your nemas</div>
                  <div><code className="text-cyan-300">select &lt;name&gt;</code> - Select a nema by name</div>
                  <div><code className="text-cyan-300">help</code> - Show all available commands</div>
                </div>
              </div>
            )}

            {!selectedNema && availableNemas.length === 0 && !nemasLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-yellow-400 text-lg mb-4">🪱 Welcome to NEMA</div>
                <div className="text-gray-300 mb-6 max-w-md">
                  You don't have any nemas yet! Create your first AI companion to start chatting.
                </div>
                <div className="text-sm text-gray-400">
                  Visit your <a href="/profile" className="text-cyan-400 underline hover:text-cyan-300">profile page</a> to create your first nema.
                </div>
              </div>
            )}

            {/* Loading History Indicator */}
            {isLoadingHistory && (
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-2">
                <span className="text-yellow-400 text-xs min-w-fit">
                  [{formatTimestamp(new Date())}] system@worminal:~#
                </span>
                <div className="text-yellow-400 flex items-center space-x-1">
                  <span>Loading message history</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages - Only show when nema is selected */}
            {selectedNema && (
              <>
                <div className="space-y-4">
                  {allMessages.map((message, index) => (
                    <div key={message.id || index} className="flex flex-col">
                      {/* User or System messages - align left */}
                      {(message.type === 'user' || message.type === 'system') && (
                        <div className="max-w-[80%]">
                          <div className="nema-card p-4 bg-nema-black/50">
                            <div className="text-nema-white whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                          </div>
                          <div className="text-nema-white-caption nema-caption-2 mt-2 text-left">
                            [{formatTimestamp(message.timestamp)}] {message.type === 'user' ? (profile?.username || 'user') : 'system'}@worminal
                          </div>
                        </div>
                      )}

                      {/* Assistant/Nema messages - align right */}
                      {(message.type === 'assistant' || message.type === 'nema') && (
                        <div className="max-w-[80%] ml-auto flex items-center gap-3">
                          <div className="flex-1">
                            <div className="nema-card p-4 bg-nema-black/50">
                              <div className="text-nema-cyan whitespace-pre-wrap break-words">
                                {message.content}
                              </div>

                              {/* Show neural changes for the most recent assistant message */}
                              {index === allMessages.length - 1 &&
                                recentNeuralChanges.length > 0 && (
                                  <div className="mt-2 text-xs">
                                    <span className="text-nema-gray-darker">Neural changes:</span>{' '}
                                    <span className="text-nema-cyan">
                                      {formatNeuralChanges(recentNeuralChanges)}
                                      {recentNeuralChanges.length > 5 && (
                                        <span className="text-nema-gray-darker"> (+{recentNeuralChanges.length - 5} more)</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="text-nema-white-caption nema-caption-2 mt-2 text-right">
                              [{formatTimestamp(message.timestamp)}] {selectedNema?.name || 'nema'}@neural
                            </div>
                          </div>

                          {/* Nema Avatar - always show if available */}
                          {profile.avatar_base64 && (
                            <img
                              src={profile.avatar_base64}
                              alt={`${profile.username} Avatar`}
                              className="w-12 h-12 rounded-full border-2 border-nema-white flex-shrink-0"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="max-w-[80%] ml-auto flex items-center gap-3">
                      <div className="flex-1">
                        <div className="nema-card p-4 bg-nema-black/50">
                          <div className="text-nema-cyan flex items-center space-x-2">
                            <span>thinking</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-nema-cyan rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-nema-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1 h-1 bg-nema-cyan rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-nema-white-caption nema-caption-2 mt-2 text-right">
                          [{formatTimestamp(new Date())}] {selectedNema?.name || 'nema'}@neural
                        </div>
                      </div>
                      {/* Nema Avatar */}
                      {profile.avatar_base64 && (
                        <img
                          src={profile.avatar_base64}
                          alt={`${profile.username} Avatar`}
                          className="w-12 h-12 rounded-full border-2 border-nema-white flex-shrink-0"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
              </>
            )}  {/* End selectedNema condition for messages */}
          </div>

          {/* Terminal Input - Always available for commands */}
          <div className="p-4 border-t border-nema-gray">
            <div className="flex items-center space-x-2">
              <span className="text-nema-gray-darker text-xs">
                [{formatTimestamp(new Date())}] {profile?.username || 'user'}@worminal:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-nema-white outline-none caret-nema-cyan placeholder-nema-gray-darker font-anonymous"
                placeholder={selectedNema ? "Type a message or command..." : "Type a command (help, nemas, select)..."}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2 border-t border-nema-gray text-xs text-nema-gray-darker">
            <div className="flex items-center justify-between">
              <div>
                Press [up] or [down] for command history
              </div>
              {selectedNema && (
                <div>
                  Messages: {allMessages.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Neural State Sidebar */}
        {showNeuralState && (
          <div className={`border border-nema-gray bg-nema-black/30 font-anonymous text-sm flex flex-col ${
            isFullscreen
              ? 'w-full lg:w-1/3 h-full'
              : 'w-full lg:w-1/3 min-h-[600px]'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-nema-gray">
              <div className="nema-display nema-header-2 text-nema-cyan">NEURAL STATE</div>
              <button
                onClick={() => setShowNeuralState(false)}
                className="text-nema-white hover:text-nema-cyan transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Neural State Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {currentNeuralState ? (
                <div className="space-y-4">
                  <div className="text-nema-white text-xs space-y-1">
                    <div><span className="text-nema-gray-darker">State count:</span> {currentNeuralState.stateCount}</div>
                    <div><span className="text-nema-gray-darker">Updated:</span> {new Date(currentNeuralState.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}, {new Date(currentNeuralState.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div><span className="text-nema-gray-darker">Total neurons:</span> 302</div>
                  </div>

                  {/* Recent Neural Changes */}
                  {recentNeuralChanges.length > 0 && (
                    <div className="border-t border-nema-gray pt-4">
                      <div className="text-nema-cyan text-xs mb-2">Recent Changes ({recentNeuralChanges.length}):</div>
                      <div className="space-y-1 text-xs">
                        {recentNeuralChanges.slice(0, 10).map((change, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-nema-white">
                              {change.neuron}
                            </span>
                            <span className="text-nema-gray-darker text-xs">
                              {change.oldValue} → {change.newValue}
                            </span>
                            <span className={`font-mono ${change.delta > 0 ? 'text-nema-cyan' : 'text-red-400'}`}>
                              {change.delta > 0 ? '+' : ''}{change.delta}
                            </span>
                          </div>
                        ))}
                        {recentNeuralChanges.length > 10 && (
                          <div className="text-nema-gray-darker text-center pt-2">
                            +{recentNeuralChanges.length - 10} more changes
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Search and Filter Controls */}
                  <div className="border-t border-nema-gray pt-4">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search neurons..."
                        value={neuralSearchTerm}
                        onChange={(e) => setNeuralSearchTerm(e.target.value)}
                        className="w-full bg-textbox-background text-nema-white text-xs px-3 py-2 rounded-lg border border-textbox-border focus:border-nema-cyan outline-none placeholder-nema-gray-darker"
                      />
                      <label className="flex items-center text-xs text-nema-white">
                        <input
                          type="checkbox"
                          checked={showActiveOnly}
                          onChange={(e) => setShowActiveOnly(e.target.checked)}
                          className="mr-2 accent-nema-cyan"
                        />
                        Show active only (non-zero)
                      </label>
                    </div>
                  </div>

                  {/* Neurons */}
                  <div className="border-t border-nema-gray pt-4">
                    <button
                      onClick={() => setMotorExpanded(!motorExpanded)}
                      className="flex items-center justify-between w-full text-nema-white mb-2 hover:text-nema-cyan transition-colors"
                    >
                      <span className="text-xs">Neurons (302/302)</span>
                      <span className="transform transition-transform duration-200" style={{ transform: motorExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </button>
                    {motorExpanded && (
                      <div className="text-xs text-nema-white bg-nema-black/50 p-3 rounded max-h-40 overflow-y-auto space-y-1">
                        {Object.entries(filterNeurons(currentNeuralState.motorNeurons)).map(([neuron, value]) => (
                          <div key={neuron} className="flex justify-between">
                            <span className="text-nema-gray-darker">{neuron}</span>
                            <span className="text-nema-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Muscle Cells */}
                  <div className="border-t border-nema-gray pt-4">
                    <button
                      onClick={() => setSensoryExpanded(!sensoryExpanded)}
                      className="flex items-center justify-between w-full text-nema-white mb-2 hover:text-nema-cyan transition-colors"
                    >
                      <span className="text-xs">Muscle Cells (90/90)</span>
                      <span className="transform transition-transform duration-200" style={{ transform: sensoryExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </button>
                    {sensoryExpanded && (
                      <div className="text-xs text-nema-white bg-nema-black/50 p-3 rounded max-h-40 overflow-y-auto space-y-1">
                        {Object.entries(filterNeurons(currentNeuralState.sensoryNeurons)).slice(0, 90).map(([neuron, value]) => (
                          <div key={neuron} className="flex justify-between">
                            <span className="text-nema-gray-darker">{neuron}</span>
                            <span className="text-nema-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-nema-gray-darker text-center mt-8 text-xs">
                  Loading neural state...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTerminal;
