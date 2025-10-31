/**
 * MessageBubble component for rendering individual chat messages
 * Supports both user and nema messages with optional neural changes display
 */

import { formatNeuralChanges } from '../utils/neuralStateUtils.js';

const MessageBubble = ({
  type,
  content,
  timestamp,
  sender,
  neuralChanges = [],
  avatarUrl = null,
  alignRight = false
}) => {
  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isNemaMessage = type === 'nema' || type === 'assistant';
  const messageClass = isNemaMessage ? 'text-nema-cyan' : 'text-nema-white';
  const containerClass = alignRight ? 'ml-auto' : '';

  return (
    <div className={`max-w-[80%] ${containerClass} flex items-center gap-3 ${alignRight ? 'flex-row-reverse' : ''}`}>
      <div className="flex-1">
        <div className="nema-card p-4 bg-nema-black/50">
          <div className={`${messageClass} whitespace-pre-wrap break-words`}>
            {content}
          </div>

          {/* Show neural changes if available */}
          {neuralChanges.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-nema-gray-darker">Neural changes:</span>{' '}
              <span className="text-nema-cyan">
                {formatNeuralChanges(neuralChanges)}
                {neuralChanges.length > 5 && (
                  <span className="text-nema-gray-darker"> (+{neuralChanges.length - 5} more)</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className={`text-nema-white-caption nema-caption-2 mt-2 ${alignRight ? 'text-right' : 'text-left'}`}>
          [{formatTimestamp(timestamp)}] {sender}@{isNemaMessage ? 'neural' : 'worminal'}
        </div>
      </div>

      {/* Avatar */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={`${sender} Avatar`}
          className={`w-12 h-12 rounded-full border-2 flex-shrink-0 ${
            isNemaMessage ? 'border-nema-cyan' : 'border-nema-white'
          }`}
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
};

export default MessageBubble;
