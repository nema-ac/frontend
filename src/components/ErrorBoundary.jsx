/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the component tree
 */

import { Component } from 'react';
import { logError, getUserFriendlyErrorMessage } from '../utils/errors.js';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    logError(error, 'ErrorBoundary');
    
    this.setState({
      error,
      errorInfo
    });

    // You could also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="border border-nema-white bg-black/50 rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Neural Network Error
              </h2>
              <p className="text-gray-300 mb-6">
                {getUserFriendlyErrorMessage(this.state.error)}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer"
              >
                Restart Neural Network
              </button>

              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer"
              >
                Try Again
              </button>
            </div>

            {/* Development error details */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-400 text-sm mb-2">
                  Debug Information
                </summary>
                <div className="bg-gray-900 p-4 rounded text-xs font-mono text-gray-300 overflow-auto max-h-48">
                  <div className="mb-2">
                    <strong className="text-red-400">Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong className="text-red-400">Stack:</strong>
                    <pre className="whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-red-400">Component Stack:</strong>
                      <pre className="whitespace-pre-wrap break-all">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithErrorBoundaryComponent;
};

// Functional error display component for specific error states
export const ErrorDisplay = ({ 
  error, 
  onRetry = null, 
  onDismiss = null, 
  showDetails = false,
  className = '' 
}) => {
  if (!error) return null;

  const friendlyMessage = getUserFriendlyErrorMessage(error);

  return (
    <div className={`neon-border border-red-400/50 bg-red-900/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-red-400 text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">Connection Error</h3>
          <p className="text-gray-300 text-sm mb-3">{friendlyMessage}</p>
          
          <div className="flex space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="border border-gray-600 hover:border-gray-500 text-gray-300 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                Dismiss
              </button>
            )}
          </div>

          {/* Development error details */}
          {import.meta.env.DEV && showDetails && error && (
            <details className="mt-3">
              <summary className="cursor-pointer text-gray-400 text-xs mb-1">
                Technical Details
              </summary>
              <div className="bg-gray-900 p-2 rounded text-xs font-mono text-gray-300">
                <div><strong>Type:</strong> {error.constructor?.name || 'Error'}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.status && <div><strong>Status:</strong> {error.status}</div>}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;