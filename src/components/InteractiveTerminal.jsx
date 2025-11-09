/**
 * Interactive Terminal component for Worminal
 * Classic terminal interface with Nema chat functionality
 */

import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useConversation } from '../hooks/useNema.js';
import { useNema } from '../contexts/NemaContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { ErrorDisplay } from './ErrorBoundary.jsx';
import nemaService from '../services/nema.js';
import CompactEmotionRadar from './CompactEmotionRadar.jsx';
import { useWorminalAccess } from '../hooks/useWorminalAccess.js';
import MessageBubble from './MessageBubble.jsx';
import NeuralStatePanel from './NeuralStatePanel.jsx';
import ViewSelector from './ViewSelector.jsx';
import { calculateNeuralChanges, getMessageNeuralChanges } from '../utils/neuralStateUtils.js';
import { getAvatarUrl, getProfileAvatarUrl, getDefaultAvatarUrl } from '../utils/avatarUtils.js';

const InteractiveTerminal = ({ isFullscreen = false, onToggleFullscreen }) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showNeuralState, setShowNeuralState] = useState(true);
  const [currentNeuralState, setCurrentNeuralState] = useState(null);
  const [, setPreviousNeuralState] = useState(null);
  const [recentNeuralChanges, setRecentNeuralChanges] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNemaDropdown, setShowNemaDropdown] = useState(false);
  const [selectedViewNemaId, setSelectedViewNemaId] = useState(null); // null = public view, nemaId = that nema's personal view

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
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

  // Worminal access control
  const {
    currentSession,
    timeRemaining,
    canClaim,
    hasAccess,
    needsToClaim,
    claiming,
    claimSession,
    error: accessError,
    publicWorminalData,
    publicTimeRemaining,
    loadingPublicData,
    shouldShowPublicView
  } = useWorminalAccess();

  // Store neural states for active session (from publicWorminalData when user has access)
  const [activeSessionStates, setActiveSessionStates] = useState(null);

  // Update activeSessionStates when publicWorminalData changes
  useEffect(() => {
    // Use publicWorminalData regardless of hasAccess if it contains our data
    if (publicWorminalData?.nema?.states) {
      setActiveSessionStates(publicWorminalData.nema.states);
    }
  }, [hasAccess, publicWorminalData]);

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

      // Update states - preserve emotional state if new state doesn't have it
      const updatedState = {
        ...neuralState,
        // Preserve emotional state from current state if new state doesn't include it
        emotionalState: neuralState.emotionalState || neuralState.emotional_state || currentNeuralState?.emotionalState || currentNeuralState?.emotional_state || null,
        emotional_state: neuralState.emotional_state || neuralState.emotionalState || currentNeuralState?.emotional_state || currentNeuralState?.emotionalState || null,
      };

      setPreviousNeuralState(currentNeuralState);
      setCurrentNeuralState(updatedState);
    }
  });

  // Auto-switch to personal view when user has active session
  useEffect(() => {
    if (hasAccess && selectedNema && selectedViewNemaId === null) {
      // User has claimed session, automatically switch to their personal view
      setSelectedViewNemaId(selectedNema.id);
    }
  }, [hasAccess, selectedNema, selectedViewNemaId]);

  // Auto-switch back to public view when session ends
  useEffect(() => {
    if (!hasAccess && selectedViewNemaId !== null && !profile) {
      // Session ended and user is not logged in, switch back to public
      setSelectedViewNemaId(null);
    }
  }, [hasAccess, selectedViewNemaId, profile]);

  // Determine which view to show
  // If selectedViewNemaId is null = public view
  // If selectedViewNemaId has a value = that nema's personal view
  const effectivePublicView = selectedViewNemaId === null;

  // Get the nema for the selected view (for showing name in UI)
  const selectedViewNema = selectedViewNemaId
    ? availableNemas.find(n => n.id === selectedViewNemaId)
    : null;

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
      setRecentNeuralChanges([]);
      fetchCurrentNeuralState();
    } else {
      // Clear neural state when no nema selected
      setCurrentNeuralState(null);
      setRecentNeuralChanges([]);
    }
  }, [selectedNema]);

  // Clear neural state when switching to public view without an active session
  useEffect(() => {
    if (effectivePublicView && !publicWorminalData?.user?.username) {
      // Public view with no active session - clear personal neural state
      setCurrentNeuralState(null);
      setRecentNeuralChanges([]);
    }
  }, [effectivePublicView, publicWorminalData?.user?.username]);

  // Ensure neural state is loaded when switching to personal view
  useEffect(() => {
    if (!effectivePublicView && selectedViewNema && !currentNeuralState) {
      fetchCurrentNeuralState();
    }
  }, [effectivePublicView, selectedViewNema, currentNeuralState]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use conversation directly from the hook
  const allMessages = conversation;

  // Helper function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    // Try the ref first (most reliable)
    let container = scrollContainerRef.current;

    // Fallback: try to find via messagesEndRef
    if (!container) {
      container = messagesEndRef.current?.parentElement;
    }

    // Fallback: find by class
    if (!container) {
      container = messagesEndRef.current?.closest('.overflow-y-auto');
    }

    // Last resort: query selector
    if (!container) {
      container = document.querySelector('.flex-1.p-4.overflow-y-auto.min-h-0');
    }

    if (container) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, []);

  // Auto-scroll to bottom when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping, scrollToBottom]);

  // Scroll to bottom when history finishes loading
  useEffect(() => {
    if (!isLoadingHistory && historyLoaded) {
      // Wait a bit for DOM to update after history loads
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isLoadingHistory, historyLoaded, scrollToBottom]);

  // Scroll to bottom on initial mount and when switching views
  useEffect(() => {
    // Delay to ensure DOM is ready
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 300);

    return () => clearTimeout(timer);
  }, [effectivePublicView, selectedNema, selectedViewNemaId, scrollToBottom]);

  // Also scroll when public messages change
  useEffect(() => {
    if (effectivePublicView && publicWorminalData?.nema?.messages) {
      scrollToBottom();
    }
  }, [effectivePublicView, publicWorminalData?.nema?.messages, scrollToBottom]);

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

    // Check if user has access before allowing message sending
    if (!hasAccess && currentSession) {
      addMessage({
        type: 'system',
        content: needsToClaim
          ? '⚠️ Please claim your session before sending messages.'
          : '⚠️ You do not have access to send messages at this time.',
        timestamp: new Date()
      });
      setInput('');
      return;
    }

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


  // Fetch current neural state
  const fetchCurrentNeuralState = async () => {
    if (!selectedNema) {
      addMessage({
        type: 'system',
        content: 'No nema selected. Please select a nema first.',
        timestamp: new Date()
      });
      return;
    }

    try {
      const neuralState = await nemaService.getNeuralState(selectedNema.id);
      setCurrentNeuralState(neuralState);
      setShowNeuralState(true);
    } catch (error) {
      console.error('Error fetching neural state:', error);
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
    <div className={`${isFullscreen ? 'h-full flex flex-col' : 'flex-1 flex flex-col min-h-0'}`}>
      <div className={`flex flex-col lg:flex-row gap-2 ${isFullscreen ? 'flex-1 min-h-0' : 'lg:flex-1 lg:min-h-0'}`}>
        {/* Terminal */}
        <div className={`border border-nema-gray bg-nema-black/30 font-anonymous text-xs flex flex-col transition-all duration-300 ${isFullscreen
          ? 'h-full w-full'
          : `min-h-0 ${showNeuralState ? 'w-full lg:w-2/3 lg:flex-[2] max-lg:min-h-[calc(100vh-12rem)] lg:min-h-0' : 'w-full flex-1'}`
          }`}>
          {/* Terminal Header - Dynamic based on session state */}
          <div className="bg-nema-gray p-2 border-b border-nema-gray flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              {/* View Selector - Show when user can toggle between views */}
              {profile && availableNemas.length > 0 && (
                <ViewSelector
                  selectedNemaId={selectedViewNemaId}
                  nemas={availableNemas}
                  showPublicOption={!hasAccess}
                  onViewChange={(nemaId) => {
                    setSelectedViewNemaId(nemaId);
                    // If switching to a personal view, ensure that nema is selected
                    if (nemaId) {
                      const nema = availableNemas.find(n => n.id === nemaId);
                      if (nema && nema.id !== selectedNema?.id) {
                        selectNema(nema);
                      }
                    }
                  }}
                  className="order-first sm:order-none"
                />
              )}

              <div className="flex-1">
                {/* Show public session info if spectating */}
                {effectivePublicView && publicWorminalData && publicWorminalData.user?.username ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(publicWorminalData.user.profile_pic)}
                      alt={`${publicWorminalData.user.username}'s avatar`}
                      className="w-10 h-10 rounded-full border-2 border-nema-black"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div>
                      <h3 className="nema-display nema-header-2 text-nema-black">
                        {publicWorminalData.user.username.toUpperCase()}'S SESSION
                      </h3>
                      {publicWorminalData.nema?.name && (
                        <div className="text-nema-black/70 text-xs pt-1">
                          Chatting with {publicWorminalData.nema.name}
                        </div>
                      )}
                    </div>
                  </div>
                ) : !currentSession || !currentSession.username ? (
                  /* No active session - show waiting message (only in public view) */
                  effectivePublicView ? (
                    <div className="text-nema-black text-sm nema-header-2">
                      WORMINAL AVAILABLE - Waiting for next session...
                    </div>
                  ) : null
                ) : hasAccess || (!effectivePublicView && profile) ? (
                  /* User has access OR viewing personal history - show nema selection */
                  nemasLoading ? (
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
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-nema-gray/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedNema?.id === nema.id ? 'bg-nema-gray/10' : ''
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
                  )
                ) : (
                  /* User doesn't have access but session exists - show session holder info */
                  <div className="text-nema-black text-sm nema-header-2">
                    WORMINAL IN USE - {currentSession.username.toUpperCase()}
                  </div>
                )}
              </div>
              {/* Ready status and session info on the right */}
              <div className="flex items-center gap-4">
                {(hasAccess || (!effectivePublicView && profile)) && !selectedNema && availableNemas.length > 0 && (
                  <div className="text-xs text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
                    ⚠️ Select a nema to start chatting
                  </div>
                )}
                {/* Show session info when spectating */}
                {effectivePublicView && publicWorminalData && (
                  <div className="text-xs text-nema-black/70 font-anonymous">
                    Time Remaining: {Math.floor(publicTimeRemaining / 1000)}s •
                    Prompts: {currentSession.prompts_used || 0}/{currentSession.prompts_limit || 10}
                  </div>
                )}
                {/* Show time remaining when user has active access */}
                {hasAccess && currentSession && currentSession.username && (
                  <>
                    <div className="text-xs text-nema-black/70 font-anonymous">
                      Session: {Math.floor(timeRemaining / 1000)}s •
                      Prompts: {currentSession.prompts_used || 0}/{currentSession.prompts_limit || 10}
                    </div>
                    <div className="text-nema-black font-anonymous nema-caption-2">
                      <span className="text-nema-black/70">
                        {effectivePublicView || (!currentSession || !currentSession.username) ? 'Spectating' : 'Ready'}
                      </span> {formatTimestamp(currentTime)}
                    </div>
                  </>
                )}
                {/* Show ready status when viewing personal history */}
                {!effectivePublicView && profile && !hasAccess && selectedViewNema && (
                  <div className="text-nema-black font-anonymous nema-caption-2">
                    <span className="text-nema-black/70">{selectedViewNema.name} View</span> {formatTimestamp(currentTime)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Content */}
          <div ref={scrollContainerRef} className="flex-1 p-3 overflow-y-auto min-h-0">
            {/* Claim Button - Only show when user needs to claim */}
            {needsToClaim && canClaim && (
              <div className="mb-4 p-4 border-2 border-nema-cyan bg-nema-cyan/10 rounded">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-nema-cyan font-bold mb-1 nema-header-3">
                      Your Session is Ready!
                    </div>
                    <div className="text-nema-white text-xs">
                      Claim you Worminal session and starting chatting with you Nema before time expires.
                    </div>
                    <div className="text-nema-gray-darker text-[10px] mt-1">
                      Time remaining to claim: {Math.floor(timeRemaining / 1000)}s
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const result = await claimSession();
                      if (result.success) {
                        addMessage({
                          type: 'system',
                          content: '✅ Session claimed successfully! You now have full access to the Worminal.',
                          timestamp: new Date()
                        });
                      }
                    }}
                    disabled={claiming}
                    className="px-6 py-3 bg-nema-cyan text-nema-black font-bold rounded hover:bg-nema-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {claiming ? 'Claiming...' : 'Claim Access'}
                  </button>
                </div>
              </div>
            )}

            {/* Access Error Display */}
            {accessError && (
              <div className="mb-4 p-3 border border-red-500 bg-red-500/10 rounded text-red-400 text-xs">
                Access Error: {accessError}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <ErrorDisplay
                error={error}
                className="mb-4"
                onRetry={() => window.location.reload()}
              />
            )}

            {/* No Active Session - Show waiting message (only in public view) */}
            {effectivePublicView && !hasAccess && !needsToClaim && (!currentSession || !currentSession.username || currentSession.username.trim() === '') && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-nema-cyan text-lg mb-4">Worminal Standby</div>
                <div className="text-gray-300 mb-6 max-w-md">
                  The Worminal is currently available. Waiting for the next user to claim access...
                </div>
                <div className="text-xs text-gray-400">
                  Check back soon to see live interactions!
                </div>
              </div>
            )}

            {/* No Nema Selected Message - Show if user has access or is viewing personal history */}
            {!effectivePublicView && (hasAccess || profile) && !selectedNema && availableNemas.length > 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-cyan-400 text-lg mb-4">⚠️ No Nema Selected</div>
                <div className="text-gray-300 mb-6 max-w-md">
                  Please select a nema from the dropdown above to start chatting.
                  You can also use terminal commands to manage your nemas.
                </div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div><code className="text-cyan-300">nemas</code> - List all your nemas</div>
                  <div><code className="text-cyan-300">select &lt;name&gt;</code> - Select a nema by name</div>
                  <div><code className="text-cyan-300">help</code> - Show all available commands</div>
                </div>
              </div>
            )}

            {!effectivePublicView && (hasAccess || profile) && !selectedNema && availableNemas.length === 0 && !nemasLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-yellow-400 text-lg mb-4">🪱 Welcome to NEMA</div>
                <div className="text-gray-300 mb-6 max-w-md">
                  You don't have any nemas yet! Create your first AI companion to start chatting.
                </div>
                <div className="text-xs text-gray-400">
                  Visit your <a href="/profile" className="text-cyan-400 underline hover:text-cyan-300">profile page</a> to create your first nema.
                </div>
              </div>
            )}

            {/* Public View - Show when user is spectating */}
            {effectivePublicView && publicWorminalData && publicWorminalData.status !== 'none' && publicWorminalData.user?.username && (
              <div className="space-y-4">
                {/* Public Messages */}
                {publicWorminalData.nema?.messages && publicWorminalData.nema.messages.length > 0 && (
                  <div className="space-y-4">
                    {publicWorminalData.nema.messages
                      .sort((a, b) => a.sequence_order - b.sequence_order)
                      .map((message) => {
                        const sortedMessages = publicWorminalData.nema.messages.sort((a, b) => a.sequence_order - b.sequence_order);
                        const neuralChanges = getMessageNeuralChanges(
                          message,
                          sortedMessages,
                          publicWorminalData.nema?.states || []
                        );

                        const isUserMessage = message.kind === 'user';
                        // Nema messages use API avatar, user messages always use default profile pic
                        const avatarUrl = message.kind === 'nema'
                          ? getProfileAvatarUrl(publicWorminalData.user ? { profile_pic: publicWorminalData.user.profile_pic, avatar_base64: publicWorminalData.user.profile_pic } : null)
                          : (isUserMessage ? getDefaultAvatarUrl() : null);

                        return (
                          <MessageBubble
                            key={message.id}
                            type={message.kind}
                            content={message.content}
                            timestamp={message.created_at}
                            sender={isUserMessage ? publicWorminalData.user?.username : publicWorminalData.nema?.name}
                            neuralChanges={neuralChanges}
                            avatarUrl={avatarUrl}
                            alignRight={isUserMessage}
                          />
                        );
                      })}
                  </div>
                )}

                {loadingPublicData && (
                  <div className="text-nema-gray-darker text-center py-4 text-xs">
                    Loading public session data...
                  </div>
                )}
              </div>
            )}

            {/* Loading History Indicator - Only show if user has access */}
            {hasAccess && isLoadingHistory && (
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

            {/* Messages - Show when user has worminal access OR when viewing personal history */}
            {!effectivePublicView && (hasAccess || profile) && selectedNema && (
              <>
                <div className="space-y-4">
                  {allMessages.map((message, index) => {
                    const isUserOrSystem = message.type === 'user' || message.type === 'system';
                    const isNemaMessage = message.type === 'assistant' || message.type === 'nema';

                    if (isUserOrSystem) {
                      return (
                        <MessageBubble
                          key={message.id || index}
                          type={message.type}
                          content={message.content}
                          timestamp={message.timestamp}
                          sender={message.type === 'user' ? (profile?.username || 'user') : 'system'}
                          neuralChanges={[]}
                          avatarUrl={message.type === 'user' ? getDefaultAvatarUrl() : null}
                          alignRight={message.type === 'user'}
                          alignCenter={message.type === 'system'}
                        />
                      );
                    }

                    if (isNemaMessage) {
                      // Calculate neural changes with fallback to recentNeuralChanges for the most recent message
                      let neuralChanges = getMessageNeuralChanges(message, allMessages, activeSessionStates || []);

                      if (neuralChanges.length === 0 && index === allMessages.length - 1 && recentNeuralChanges.length > 0) {
                        neuralChanges = recentNeuralChanges;
                      }

                      return (
                        <MessageBubble
                          key={message.id || index}
                          type="nema"
                          content={message.content}
                          timestamp={message.timestamp}
                          sender={selectedNema?.name || 'nema'}
                          neuralChanges={neuralChanges}
                          avatarUrl={getProfileAvatarUrl(profile)}
                          alignRight={false}
                        />
                      );
                    }

                    return null;
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="max-w-[80%] flex items-center gap-3">
                      {/* Nema Avatar */}
                      <img
                        src={getProfileAvatarUrl(profile)}
                        alt={`${selectedNema?.name || 'nema'} Avatar`}
                        className="w-12 h-12 rounded-full border-2 border-nema-cyan flex-shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                      />
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
                        <div className="text-nema-white-caption nema-caption-2 mt-2 text-left">
                          [{formatTimestamp(new Date())}] {selectedNema?.name || 'nema'}@neural
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
              </>
            )}  {/* End selectedNema condition for messages */}
          </div>

          {/* Terminal Input - Conditionally available based on access */}
          <div className="p-4 border-t border-nema-gray flex-shrink-0">
            {!hasAccess && currentSession ? (
              <div className="flex items-center space-x-2 opacity-50">
                <span className="text-nema-gray-darker text-xs">
                  [{formatTimestamp(new Date())}] {profile?.username || 'user'}@worminal:~$
                </span>
                <div className="flex-1 text-nema-gray-darker text-xs italic">
                  {needsToClaim ? 'Claim your session to start chatting...' : 'Waiting for access...'}
                </div>
              </div>
            ) : (
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
                  disabled={loading || !hasAccess}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2 border-t border-nema-gray text-xs text-nema-gray-darker flex-shrink-0">
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
          <div className={`border border-nema-gray bg-nema-black/30 font-anonymous text-xs flex flex-col ${isFullscreen
            ? 'w-full lg:w-1/3 h-full'
            : 'w-full lg:w-1/3 lg:flex-[1] lg:min-h-0'
            }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-2 border-b border-nema-gray flex-shrink-0">
              <div className="nema-display nema-header-2 text-nema-cyan">NEURAL STATE</div>
              <button
                onClick={() => setShowNeuralState(false)}
                className="text-nema-white hover:text-nema-cyan transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Neural State Content */}
            <div className="flex-1 p-3 overflow-y-auto min-h-0">
              <NeuralStatePanel
                neuralState={effectivePublicView && publicWorminalData?.nema?.states?.[0]
                  ? publicWorminalData.nema.states[0]
                  : currentNeuralState}
                recentChanges={recentNeuralChanges}
                isPublicView={effectivePublicView}
                nemaName={effectivePublicView ? publicWorminalData?.nema?.name : selectedNema?.name}
                states={effectivePublicView
                  ? (publicWorminalData?.nema?.states || [])
                  : (activeSessionStates || [])
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTerminal;
