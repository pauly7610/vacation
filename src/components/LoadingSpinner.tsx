import React from 'react';
import { Loader2, Plane, Globe } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'plane' | 'globe' | 'dots';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  className = ""
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'plane':
        return (
          <div className="relative">
            <Plane className={`${sizeClasses[size]} text-blue-500 animate-bounce`} />
            <div className="absolute inset-0 animate-ping">
              <Plane className={`${sizeClasses[size]} text-blue-300 opacity-75`} />
            </div>
          </div>
        );
      
      case 'globe':
        return (
          <Globe className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
      {renderSpinner()}
      {message && (
        <p className="mt-2 text-sm text-gray-600 text-center" aria-label={message}>
          {message}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Predefined loading states for common scenarios
export const FilteringLoader: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSpinner
    variant="dots"
    message="Applying filters..."
    className={className}
  />
);

export const DestinationLoader: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSpinner
    variant="plane"
    size="lg"
    message="Finding your perfect destination..."
    className={className}
  />
);

export const SyncLoader: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSpinner
    variant="globe"
    message="Syncing your preferences..."
    className={className}
  />
);