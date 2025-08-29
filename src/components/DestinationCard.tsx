import React, { useState } from 'react';
import { Heart, Share2, MapPin, DollarSign, Thermometer, Shield, X, ThumbsDown, Plane } from 'lucide-react';
import { Destination } from '../types';
import { GoogleMap } from './GoogleMap';
import { SocialShareModal } from './SocialShareModal';
import { BookingPanel } from './BookingPanel';

interface DestinationCardProps {
  destination: Destination;
  onSave: (destinationId: string) => void;
  onShare: (destination: Destination) => void;
  onReject: (destinationId: string) => void;
  isSaved: boolean;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSave,
  onShare,
  onReject,
  isSaved
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const getCostLevelColor = (level: string) => {
    switch (level) {
      case 'budget': return 'text-green-600 bg-green-100';
      case 'mid-range': return 'text-yellow-600 bg-yellow-100';
      case 'luxury': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getClimateIcon = (climate: string) => {
    switch (climate) {
      case 'tropical': return '🌴';
      case 'temperate': return '🌸';
      case 'cold': return '❄️';
      case 'desert': return '🏜️';
      case 'mediterranean': return '☀️';
      default: return '🌍';
    }
  };

  return (
    <div className="hero-container bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
      {/* Image Section */}
      <div className="relative h-80 overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
              <p className="text-gray-400 font-medium">Loading destination...</p>
            </div>
          </div>
        )}
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className={`w-full h-full object-cover transition-all duration-1000 hover:scale-105 ${
            imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            // Fallback to a default image if the original fails to load
            const img = document.querySelector(`img[alt="${destination.name}"]`) as HTMLImageElement;
            if (img) {
              img.src = `https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;
            }
            setImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Location Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">{destination.country}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => onReject(destination.id)}
            className="p-3 rounded-full bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600 hover:scale-110 transition-all duration-300"
            title="Not interested"
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => onSave(destination.id)}
            className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="p-3 rounded-full bg-blue-500/90 backdrop-blur-sm text-white hover:bg-blue-600 hover:scale-110 transition-all duration-300"
            title="Show on map"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSocialShare(true)}
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 backdrop-blur-sm text-white hover:from-pink-600 hover:to-purple-700 hover:scale-110 transition-all duration-300"
            title="Share on social media"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowBooking(true)}
            className="p-3 rounded-full bg-green-500/90 backdrop-blur-sm text-white hover:bg-green-600 hover:scale-110 transition-all duration-300"
            title="Book this trip"
          >
            <Plane className="w-5 h-5" />
          </button>
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-6 left-6">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{destination.name}</h1>
          <p className="text-white/90 text-xl font-medium drop-shadow-md">{destination.region}</p>
        </div>
      </div>

      {/* Interactive Map */}
      {showMap && (
        <GoogleMap 
          destination={destination} 
          onClose={() => setShowMap(false)} 
        />
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        destination={destination}
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
      />

      {/* Booking Panel */}
      <BookingPanel
        destination={destination}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />

      {/* Content Section */}
      <div className="hero-text p-8">
        {/* Description */}
        <p className="text-gray-700 text-lg leading-relaxed mb-8 font-light">
          {destination.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Budget</p>
              <p className="font-bold text-gray-800">${destination.dailyBudget.min}-${destination.dailyBudget.max}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Thermometer className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Climate</p>
              <p className="font-bold text-gray-800 capitalize">{destination.climate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Safety</p>
              <p className="font-bold text-gray-800">{destination.safetyRating}/10</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">{getClimateIcon(destination.climate)}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost Level</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCostLevelColor(destination.costLevel)}`}>
                {destination.costLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Best Time to Visit */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Best Time to Visit</h3>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const isBestMonth = destination.bestMonths.includes(month);
              return (
                <span
                  key={month}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isBestMonth 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {monthNames[month - 1]}
                </span>
              );
            })}
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Highlights</h3>
          <div className="flex flex-wrap gap-2">
            {destination.highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 hover:shadow-md transition-shadow"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Perfect for</h3>
          <div className="flex flex-wrap gap-2">
            {destination.activities.map((activity, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm capitalize font-medium hover:bg-gray-200 transition-colors"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>

        {/* Social Sharing Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Take Action</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBooking(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <Plane className="w-4 h-4" />
                <span>Book Trip</span>
              </button>
              <button
                onClick={() => setShowSocialShare(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: `Check out ${destination.name}!`,
                      text: `I just discovered ${destination.name} on Wanderlist! ${destination.description.substring(0, 100)}...`,
                      url: window.location.href
                    });
                  } catch (error) {
                    // Fallback to copying URL
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <span>📱</span>
                <span>Quick Share</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Ready to make it happen? Book your trip or share it with friends to inspire their wanderlust! 🌍✨
          </p>
        </div>
      </div>
    </div>
  );
};