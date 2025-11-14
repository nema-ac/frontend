/**
 * MessageBubble component for rendering individual chat messages
 * Supports both user and nema messages with optional neural changes display
 */

import { formatNeuralChanges } from '../utils/neuralStateUtils.js';
import { getAvatarUrl } from '../utils/avatarUtils.js';

const MessageBubble = ({
  type,
  content,
  timestamp,
  sender,
  neuralChanges = [],
  avatarUrl = null,
  alignRight = false,
  alignCenter = false
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
  const isSystemMessage = type === 'system';
  const isUserMessage = type === 'user';

  // Determine message styling
  const messageClass = isNemaMessage ? 'text-nema-cyan' : isSystemMessage ? 'text-nema-gray-darker' : 'text-nema-white';

  // Determine container alignment
  let containerClass = '';
  if (alignCenter) {
    containerClass = 'mx-auto';
  } else if (alignRight) {
    containerClass = 'ml-auto';
  }

  // Determine flex direction for avatar positioning
  const flexDirection = alignRight ? 'flex-row-reverse' : '';

  // Determine card background opacity for system messages
  const cardBgClass = isSystemMessage ? 'bg-nema-black/30' : 'bg-nema-black/50';

  // Get avatar URL with default fallback for both Nema and user messages
  const displayAvatarUrl = (isNemaMessage || isUserMessage) ? getAvatarUrl(avatarUrl) : null;
  const avatarBorderClass = isNemaMessage ? 'border-nema-cyan' : 'border-nema-white';

  return (
    <div className={`max-w-[80%] ${containerClass} flex items-center gap-3`}>
      {/* Nema avatar on left side */}
      {isNemaMessage && (
        <img
          src={displayAvatarUrl}
          alt={`${sender} Avatar`}
          className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${avatarBorderClass}`}
          style={{ imageRendering: 'pixelated' }}
        />
      )}

      <div className="flex-1">
        <div className={`nema-card p-3 ${cardBgClass}`}>
          <div className={`${messageClass} whitespace-pre-wrap break-words text-xs`}>
            {content}
          </div>

          {/* Show neural changes if available */}
          {neuralChanges.length > 0 && (
            <div className="mt-1.5 text-[10px]">
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

        <div className={`text-nema-white-caption nema-caption-2 mt-1.5 text-[10px] ${alignCenter ? 'text-center' : alignRight ? 'text-right' : 'text-left'}`}>
          [{formatTimestamp(timestamp)}] {sender}@{isNemaMessage ? 'neural' : 'worminal'}
        </div>
      </div>

      {/* User avatar on right side */}
      {isUserMessage && (
        <img
          src={displayAvatarUrl}
          alt={`${sender} Avatar`}
          className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${avatarBorderClass}`}
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
};

export default MessageBubble;
