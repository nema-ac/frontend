import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const GlobalNotificationModal = () => {
  const { notification, hideNotification } = useNotification();

  // Auto-hide after 10 seconds for errors, 5 seconds for success/info
  useEffect(() => {
    if (notification) {
      const timeout = notification.type === 'error' ? 10000 : 5000;
      const timer = setTimeout(() => {
        hideNotification();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'error':
        return 'border-red-500/30';
      case 'success':
        return 'border-green-500/30';
      case 'info':
        return 'border-blue-500/30';
      default:
        return 'border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={hideNotification}>
      <div
        className={`bg-zinc-900 border ${getBorderColor()} rounded-lg shadow-2xl max-w-md w-full p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={hideNotification}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1 pt-1">
            <h3 className={`text-lg font-semibold mb-2 ${notification.type === 'error' ? 'text-red-400' :
                notification.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
              }`}>
              {notification.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">
              {notification.message}
            </p>

            {/* Action button */}
            <button
              onClick={hideNotification}
              className={`w-full px-4 py-2 rounded-md transition-colors text-sm font-medium ${notification.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  notification.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalNotificationModal;

