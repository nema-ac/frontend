import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showError = useCallback((message, title = 'Error') => {
    setNotification({
      type: 'error',
      title,
      message,
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    setNotification({
      type: 'success',
      title,
      message,
    });
  }, []);

  const showInfo = useCallback((message, title = 'Info') => {
    setNotification({
      type: 'info',
      title,
      message,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showError,
        showSuccess,
        showInfo,
        hideNotification,
        notification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

