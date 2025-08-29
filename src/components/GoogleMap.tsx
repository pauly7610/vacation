import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Maximize2, AlertCircle } from 'lucide-react';
import { Destination } from '../types';

interface GoogleMapProps {
  destination: Destination;
  onClose: () => void;
}

interface MapData {
  embedUrl: string;
  directUrl: string;
  coordinates: { lat: number; lng: number };
  mapType: string;
  zoom: number;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ destination, onClose }) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{remaining: number, resetTime: number} | null>(null);

  useEffect(() => {
    fetchMapData();
  }, [destination, mapType]);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if Google Maps API is available
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // In development, show a placeholder map
        setMapData({
          embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${destination.longitude-0.01},${destination.latitude-0.01},${destination.longitude+0.01},${destination.latitude+0.01}&layer=mapnik&marker=${destination.latitude},${destination.longitude}`,
          directUrl: `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`,
          coordinates: { lat: destination.latitude, lng: destination.longitude },
          mapType: mapType,
          zoom: 12
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/.netlify/functions/maps-proxy?lat=${destination.latitude}&lng=${destination.longitude}&maptype=${mapType}&zoom=12`
      );

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const errorData = await response.json();
        throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update rate limit info
      if (data.rateLimit) {
        setRateLimitInfo(data.rateLimit);
      }
      setMapData(data);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`relative bg-gray-100 border-t ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-64'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
            {rateLimitInfo && (
              <p className="text-xs text-gray-500 mt-2">
                {rateLimitInfo.remaining} requests remaining
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className={`relative bg-gray-100 border-t ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-64'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-2">Map temporarily unavailable</p>
            <p className="text-sm text-gray-500">{error || 'Please try again later'}</p>
            {error?.includes('Rate limit') && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  🚦 Too many map requests. Please wait a moment before trying again.
                </p>
              </div>
            )}
            <button
              onClick={fetchMapData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`hero-container container relative bg-gray-100 border-t ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-64'}`}>
      {/* Map Controls */}
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {(['roadmap', 'satellite'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                mapType === type 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Info about additional map types */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
          <p className="text-xs text-gray-600">
            💡 Enable more map types in Google Cloud Console
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <a
          href={mapData.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-600 transition-all"
          title="Open in Google Maps"
        >
          <Navigation className="w-4 h-4" />
        </a>
        <button
          onClick={onClose}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Map Iframe */}
      {mapData.embedUrl.includes('openstreetmap') ? (
        <div className="relative w-full h-full">
          <iframe
            src={mapData.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            title={`Map of ${destination.name}`}
            className="w-full h-full"
          />
          <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            📍 OpenStreetMap Preview
          </div>
        </div>
      ) : (
        <iframe
          src={mapData.embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${destination.name}`}
          className="w-full h-full"
        />
      )}

      {/* Location Info Overlay */}
      <div className="hero-text absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center space-x-2 mb-1">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-gray-800">{destination.name}</h4>
        </div>
        <p className="text-sm text-gray-600">{destination.country}</p>
        <p className="text-xs text-gray-500 mt-1">
          {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
        </p>
        {rateLimitInfo && (
          <p className="text-xs text-blue-600 mt-1">
            {rateLimitInfo.remaining} map requests remaining
          </p>
        )}
      </div>
    </div>
  );
};