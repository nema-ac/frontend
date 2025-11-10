import { getAvatarUrl } from '../utils/avatarUtils.js';

const GalleryCard = ({ nema }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatInteractionCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="nema-card p-4 hover:border-nema-cyan transition-all duration-300 cursor-pointer group">
      {/* Header with Avatar and Online Status */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-nema-gray transition-colors">
            <img
              src={getAvatarUrl(nema.user_avatar)}
              alt={`${nema.username}'s avatar`}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="nema-display nema-header-2 text-nema-cyan truncate group-hover:text-nema-cyan transition-colors flex-1 min-w-0">
              {nema.nema_name}
            </h3>
            {nema.is_online && (
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30 flex-shrink-0">
                Online
              </span>
            )}
          </div>
          <p className="text-nema-gray-darker text-xs font-anonymous truncate">
            @{nema.username}
          </p>
        </div>
      </div>

      {/* Description */}
      {nema.nema_description && (
        <p className="text-nema-white text-xs font-anonymous mb-3 line-clamp-2 leading-relaxed">
          {nema.nema_description}
        </p>
      )}

      {/* Footer with Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-nema-gray/20">
        <div className="flex items-center gap-2 text-nema-gray-darker text-xs font-anonymous">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{formatInteractionCount(nema.interaction_count)}</span>
        </div>
        <div className="text-nema-gray-darker text-xs font-anonymous">
          {formatDate(nema.nema_created_at)}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;

