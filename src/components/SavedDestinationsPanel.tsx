import React, { useState } from 'react';
import { Heart, X, MapPin, DollarSign, Trash2, Share2, Plane } from 'lucide-react';
import { Destination } from '../types';
import { DestinationService } from '../services/destinationService';
import { SocialShareModal } from './SocialShareModal';
import { BookingPanel } from './BookingPanel';

interface SavedDestinationsPanelProps {
  savedDestinationIds: string[];
  onRemoveDestination: (destinationId: string) => void;
  onShareDestination: (destination: Destination) => void;
  onViewDestination: (destination: Destination) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SavedDestinationsPanel: React.FC<SavedDestinationsPanelProps> = ({
  savedDestinationIds,
  onRemoveDestination,
  onShareDestination,
  onViewDestination,
  isOpen,
  onToggle
}) => {
  const destinationService = DestinationService.getInstance();
  const [sortBy, setSortBy] = useState<'name' | 'country' | 'budget' | 'safety'>('name');
  const [shareDestination, setShareDestination] = useState<Destination | null>(null);
  const [bookingDestination, setBookingDestination] = useState<Destination | null>(null);
  
  const savedDestinations = savedDestinationIds
    .map(id => destinationService.getDestinationById(id))
    .filter((dest): dest is Destination => dest !== undefined);

  const sortedDestinations = [...savedDestinations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'country':
        return a.country.localeCompare(b.country);
      case 'budget':
        return a.dailyBudget.min - b.dailyBudget.min;
      case 'safety':
        return b.safetyRating - a.safetyRating;
      default:
        return 0;
    }
  });

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

  const clearAllSaved = () => {
    if (window.confirm(`Are you sure you want to remove all ${savedDestinations.length} saved destinations?`)) {
      savedDestinationIds.forEach(id => onRemoveDestination(id));
    }
  };

  const exportSavedList = () => {
    const exportData = savedDestinations.map(dest => ({
      name: dest.name,
      country: dest.country,
      continent: dest.continent,
      budget: `$${dest.dailyBudget.min}-${dest.dailyBudget.max}`,
      safety: `${dest.safetyRating}/10`,
      climate: dest.climate,
      highlights: dest.highlights.join(', ')
    }));

    const csvContent = [
      'Name,Country,Continent,Daily Budget,Safety Rating,Climate,Highlights',
      ...exportData.map(dest => 
        `"${dest.name}","${dest.country}","${dest.continent}","${dest.budget}","${dest.safety}","${dest.climate}","${dest.highlights}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wanderlist-saved-destinations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={onToggle}
        />
      )}

      {/* Panel */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-2xl bg-white shadow-2xl z-40 transform transition-transform duration-300 hero-container container ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="hero-text p-6 border-b bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Heart className="w-7 h-7 mr-3 fill-current" />
                  My Wanderlist
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  {savedDestinations.length} destinations in your wishlist
                </p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center relative z-[60]"
                title="Close saved destinations"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {savedDestinations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={exportSavedList}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm text-white transition-all duration-200 hover:scale-105 flex items-center"
                >
                  📄 Export List
                </button>
                <button
                  onClick={clearAllSaved}
                  className="px-4 py-2 bg-white/20 hover:bg-red-600 rounded-full text-sm text-white transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="hero-text flex-1 overflow-hidden flex flex-col">
            {savedDestinations.length === 0 ? (
              <div className="hero-text flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved destinations yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Start exploring and click the ❤️ heart icon on destinations you'd like to visit!
                  </p>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 How to save destinations:</h4>
                    <ol className="text-sm text-blue-700 text-left space-y-1">
                      <li>1. Click "Surprise Me!" to discover destinations</li>
                      <li>2. Click the ❤️ heart icon on destinations you love</li>
                      <li>3. Return here to view your wishlist anytime</li>
                    </ol>
                  </div>
                  <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-green-600 text-2xl mb-2">🌍</div>
                      <p className="font-medium text-green-800">500+ Destinations</p>
                      <p className="text-green-600">Across 6 continents</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-purple-600 text-2xl mb-2">✈️</div>
                      <p className="font-medium text-purple-800">Smart Booking</p>
                      <p className="text-purple-600">Compare prices instantly</p>
                    </div>
                  </div>
                  <button
                    onClick={onToggle}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Start Exploring
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Sort Controls */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Sort by:</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="country">Country</option>
                      <option value="budget">Budget (Low to High)</option>
                      <option value="safety">Safety Rating (High to Low)</option>
                    </select>
                  </div>
                  <button
                    onClick={onToggle}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <span>🌍</span>
                    <span>Explore More</span>
                  </button>
                </div>

                {/* Destinations List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {sortedDestinations.map((destination) => (
                    <div
                      key={destination.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden"
                    >
                      <div className="flex">
                        {/* Image */}
                        <div className="w-32 h-24 flex-shrink-0">
                          <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-lg">{destination.name}</h4>
                              <div className="flex items-center text-gray-600 text-sm mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{destination.country}, {destination.continent}</span>
                              </div>
                              
                              {/* Stats */}
                              <div className="flex items-center space-x-4 mt-3">
                                <div className="flex items-center text-sm">
                                  <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                                  <span className="font-medium">${destination.dailyBudget.min}-${destination.dailyBudget.max}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-lg mr-1">{getClimateIcon(destination.climate)}</span>
                                  <span className="capitalize">{destination.climate}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-600 font-medium">🛡️ {destination.safetyRating}/10</span>
                                </div>
                              </div>

                              {/* Cost Level Badge */}
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCostLevelColor(destination.costLevel)}`}>
                                  {destination.costLevel}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => onViewDestination(destination)}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={onToggle}
                                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                title="Back to exploring"
                              >
                                Explore
                              </button>
                              <button
                                onClick={() => setBookingDestination(destination)}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center space-x-1"
                                title="Book this trip"
                              >
                                <Plane className="w-3 h-3" />
                                <span>Book</span>
                              </button>
                              <button
                                onClick={() => setShareDestination(destination)}
                                className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                title="Share destination"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRemoveDestination(destination.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove from saved"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Highlights Preview */}
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {destination.highlights.slice(0, 3).map((highlight, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                >
                                  {highlight}
                                </span>
                              ))}
                              {destination.highlights.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{destination.highlights.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Footer */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Total Budget Range:</p>
                      <p className="font-semibold text-gray-800">
                        ${Math.min(...savedDestinations.map(d => d.dailyBudget.min))} - 
                        ${Math.max(...savedDestinations.map(d => d.dailyBudget.max))} per day
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Countries:</p>
                      <p className="font-semibold text-gray-800">
                        {new Set(savedDestinations.map(d => d.country)).size} countries
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={onToggle}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                    >
                      <span>✨</span>
                      <span>Discover More Destinations</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      {shareDestination && (
        <SocialShareModal
          destination={shareDestination}
          isOpen={!!shareDestination}
          onClose={() => setShareDestination(null)}
        />
      )}
      {/* Booking Panel */}
      {bookingDestination && (
        <BookingPanel
          destination={bookingDestination}
          isOpen={!!bookingDestination}
          onClose={() => setBookingDestination(null)}
        />
      )}
    </>
  );
};