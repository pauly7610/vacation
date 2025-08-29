import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Globe, Camera } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  totalDestinations: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, totalDestinations }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<Array<{
    url: string;
    location: string;
    description: string;
  }>>([]);
  
  const allHeroImages = [
    {
      url: 'https://images.pexels.com/photos/161815/santorini-oia-greece-water-161815.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Santorini, Greece',
      description: 'Iconic blue domes overlooking the Aegean Sea'
    },
    {
      url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Bali, Indonesia',
      description: 'Tropical paradise with ancient temples'
    },
    {
      url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Machu Picchu, Peru',
      description: 'Ancient Incan ruins high in the Andes mountains'
    },
    {
      url: 'https://images.pexels.com/photos/624015/pexels-photo-624015.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Northern Lights, Iceland',
      description: 'Aurora borealis dancing across the sky'
    },
    {
      url: 'https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Maldives',
      description: 'Crystal clear waters and overwater bungalows'
    },
    {
      url: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Tokyo, Japan',
      description: 'Neon lights and ancient traditions collide'
    },
    {
      url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Swiss Alps',
      description: 'Majestic peaks and pristine mountain lakes'
    },
    {
      url: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Sahara Desert, Morocco',
      description: 'Golden dunes stretching to the horizon'
    },
    {
      url: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'New York City, USA',
      description: 'The city that never sleeps'
    },
    {
      url: 'https://images.pexels.com/photos/64219/dolphin-marine-mammals-water-sea-64219.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      location: 'Great Barrier Reef, Australia',
      description: 'Underwater paradise teeming with life'
    }
  ];

  // Randomize and select 4 images on component mount
  useEffect(() => {
    const shuffled = [...allHeroImages].sort(() => Math.random() - 0.5);
    setHeroImages(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  // Don't render until we have randomized images
  if (heroImages.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-light">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.location}
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center hero-container">
        <div className="text-center max-w-full mx-auto hero-text">
          {/* Main Heading */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Wanderlist
              </span>
            </h1>
            <p className="text-sm sm:text-lg md:text-2xl text-white/90 font-light mb-1 sm:mb-2 drop-shadow-lg">
              Where will your next adventure take you?
            </p>
            <p className="text-xs sm:text-sm md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Discover amazing destinations from our curated collection of{' '}
              <span className="font-semibold text-blue-300">{totalDestinations}</span> global locations.
              Let serendipity guide your journey.
            </p>
          </div>

          {/* Current Location Badge */}
          <div className="mb-2 sm:mb-3 animate-slide-up">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20 max-w-full">
              <Camera className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-xs sm:text-sm truncate max-w-xs">{heroImages[currentImageIndex].location}</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <p className="text-white/70 text-xs mt-1 italic">
              {heroImages[currentImageIndex].description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-bounce-in">
            <button
              onClick={onGetStarted}
              className="group relative px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110 border-2 border-white/20 hover:border-white/40"
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span className="whitespace-nowrap">Start My Adventure</span>
                <Sparkles className="w-4 h-4 group-hover:scale-125 group-hover:text-yellow-300 transition-all duration-300" />
              </div>
              
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300 -z-10" />
            </button>
            
            {/* Social Proof */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">Join thousands of travelers discovering their next adventure</p>
              <div className="flex justify-center items-center space-x-4 sm:space-x-6 text-white/70 text-xs">
                <span className="flex items-center space-x-1">
                  <span>📱</span>
                  <span>Share on TikTok</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📸</span>
                  <span>Instagram Ready</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🌟</span>
                  <span>Viral Discoveries</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 animate-fade-in">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{totalDestinations}</div>
              <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">6</div>
              <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide">Continents</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">∞</div>
              <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide">Adventures</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};