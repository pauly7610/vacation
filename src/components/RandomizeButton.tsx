import React, { useState } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import { destinationRequestLimiter } from '../utils/rateLimiter';

interface RandomizeButtonProps {
  onRandomize: () => void;
  isLoading?: boolean;
}

export const RandomizeButton: React.FC<RandomizeButtonProps> = ({ 
  onRandomize, 
  isLoading = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const handleClick = () => {
    if (!isLoading) {
      setIsAnimating(true);
      // Check client-side rate limit
      const rateLimit = destinationRequestLimiter.isAllowed();
      if (!rateLimit.allowed) {
        const remainingTime = Math.ceil(destinationRequestLimiter.getRemainingTime() / 1000);
        setRateLimitMessage(`Please wait ${remainingTime} seconds before getting another destination`);
        setTimeout(() => setRateLimitMessage(null), 3000);
        return;
      }
      setClickCount(prev => prev + 1);
      onRandomize();
      setRateLimitMessage(null);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Finding...';
    if (clickCount === 0) return 'Surprise Me!';
    if (clickCount < 3) return 'Another Adventure!';
    if (clickCount < 5) return 'Keep Exploring!';
    if (clickCount < 8) return 'More Magic!';
    return 'I\'m Addicted!';
  };

  const getButtonGradient = () => {
    if (clickCount === 0) return 'from-blue-500 to-purple-600';
    if (clickCount < 3) return 'from-purple-500 to-pink-600';
    if (clickCount < 5) return 'from-pink-500 to-red-600';
    if (clickCount < 8) return 'from-red-500 to-orange-600';
    return 'from-orange-500 to-yellow-600';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          relative px-10 py-5 bg-gradient-to-r ${getButtonGradient()}
          text-white font-bold text-xl rounded-2xl shadow-xl
          hover:shadow-2xl transform transition-all duration-300 hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isAnimating ? 'animate-bounce' : ''}
          border-2 border-white/20
        `}
      >
        <div className="flex items-center space-x-3">
          <Shuffle className={`w-7 h-7 transition-transform duration-500 ${
            isAnimating ? 'rotate-180 scale-125' : ''
          }`} />
          <span>
            {getButtonText()}
          </span>
          <Sparkles className={`w-6 h-6 transition-all duration-300 ${
            isAnimating ? 'scale-150 text-yellow-300 animate-spin' : ''
          }`} />
        </div>
        
        {/* Animated background particles */}
        {isAnimating && (
          <>
            <div className={`absolute inset-0 bg-gradient-to-r ${getButtonGradient()} rounded-2xl animate-ping opacity-30`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${getButtonGradient()} rounded-2xl animate-pulse opacity-40`} />
          </>
        )}
      </button>
      
      {/* Rate Limit Message */}
      {rateLimitMessage && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg text-sm animate-fade-in">
          🚦 {rateLimitMessage}
        </div>
      )}
      
      {/* Rate Limit Message */}
      {rateLimitMessage && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg text-sm animate-fade-in">
          🚦 {rateLimitMessage}
        </div>
      )}
      {clickCount > 0 && (
        <div className="text-center animate-fade-in">
          <p className="text-lg font-semibold text-gray-700">Destination #{clickCount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {clickCount < 5 ? 'Keep exploring the world!' : 
             clickCount < 10 ? 'You\'re on a roll! 🌍' : 
             'World explorer extraordinaire! 🏆'}
          </p>
        </div>
      )}
    </div>
  );
};