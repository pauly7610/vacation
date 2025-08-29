import React, { useState, useEffect } from 'react';
import { Plane, Heart, Share2, Filter, RotateCcw, Cloud, Search } from 'lucide-react';
import { DestinationCard } from './components/DestinationCard';
import { FilterPanel } from './components/FilterPanel';
import { RandomizeButton } from './components/RandomizeButton';
import { SavedDestinationsPanel } from './components/SavedDestinationsPanel';
import { SyncPanel } from './components/SyncPanel';
import { HeroSection } from './components/HeroSection';
import { SearchBar } from './components/SearchBar';
import { Breadcrumb, getBreadcrumbItems } from './components/Breadcrumb';
import { LoadingSpinner, FilteringLoader, DestinationLoader } from './components/LoadingSpinner';
import { DestinationService } from './services/destinationService';
import { SyncService } from './services/syncService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Destination, Filters, UserPreferences } from './types';

function App() {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'destination' | 'saved' | 'filters' | 'sync'>('home');
  const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>('vacation-randomizer-preferences', {
    savedDestinations: [],
    rejectedDestinations: [],
    filters: {}
  });

  // Show error screen if there's a critical error
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
                window.location.reload();
              }}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Clear Data & Reload
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            If this persists, please try refreshing your browser or clearing your cache.
          </p>
        </div>
      </div>
    );
  }

  const destinationService = DestinationService.getInstance();
  const syncService = SyncService.getInstance();

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Application error:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setErrorMessage('A network or data error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    // Check for sync code in URL
    const syncCode = syncService.checkForSyncCode();
    if (syncCode) {
      setIsSyncPanelOpen(true);
      setCurrentView('sync');
      syncService.clearSyncFromURL();
    }
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const handleGetStarted = () => {
    setShowHero(false);
    setCurrentView('home');
    handleRandomize();
  };

  const handleRandomize = () => {
    setShowHero(false);
    setCurrentView('home');
    setIsLoading(true);
    
    // Add slight delay for better UX
    setTimeout(() => {
      try {
        const filteredDestinations = destinationService.filterDestinations(
          userPreferences.filters, 
          userPreferences.rejectedDestinations
        );
        
        if (filteredDestinations.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredDestinations.length);
          setCurrentDestination(filteredDestinations[randomIndex]);
        } else {
          // No destinations match filters - get a random one anyway
          const allDestinations = destinationService.getAllDestinations();
          if (allDestinations.length > 0) {
            const randomIndex = Math.floor(Math.random() * allDestinations.length);
            setCurrentDestination(allDestinations[randomIndex]);
          } else {
            setCurrentDestination(null);
          }
        }
      } catch (error) {
        console.error('Error getting random destination:', error);
        setHasError(true);
        setErrorMessage('Failed to load destinations');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleFiltersChange = (filters: Partial<Filters>) => {
    setIsFiltering(true);
    setUserPreferences({
      ...userPreferences,
      filters
    });
    
    // Add slight delay to show filtering state
    setTimeout(() => {
      setIsFiltering(false);
    }, 300);
  };

  const handleSaveDestination = (destinationId: string) => {
    const savedDestinations = userPreferences.savedDestinations.includes(destinationId)
      ? userPreferences.savedDestinations.filter(id => id !== destinationId)
      : [...userPreferences.savedDestinations, destinationId];
    
    setUserPreferences({
      ...userPreferences,
      savedDestinations
    });
  };

  const handleRejectDestination = (destinationId: string) => {
    const rejectedDestinations = [...userPreferences.rejectedDestinations, destinationId];
    
    setUserPreferences({
      ...userPreferences,
      rejectedDestinations
    });
    
    // Automatically get a new destination
    setTimeout(() => {
      handleRandomize();
    }, 500);
  };

  const handleClearRejected = () => {
    setUserPreferences({
      ...userPreferences,
      rejectedDestinations: []
    });
  };

  const handleSyncComplete = (syncedPreferences: UserPreferences) => {
    setUserPreferences(syncedPreferences);
    setIsSyncPanelOpen(false);
    setCurrentView('home');
  };

  const handleViewSavedDestination = (destination: Destination) => {
    setCurrentDestination(destination);
    setCurrentView('destination');
    setIsSavedPanelOpen(false);
  };

  const handleShareDestination = async (destination: Destination) => {
    // This will be handled by the SocialShareModal component
    console.log('Share destination:', destination.name);
  };

  const handleSearchDestinationSelect = (destination: Destination) => {
    setCurrentDestination(destination);
    setCurrentView('destination');
    setShowHero(false);
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setShowHero(false);
  };

  const handleOpenFilters = () => {
    setIsFilterPanelOpen(true);
    setCurrentView('filters');
  };

  const handleOpenSaved = () => {
    setIsSavedPanelOpen(true);
    setCurrentView('saved');
  };

  const hasActiveFilters = Object.values(userPreferences.filters).some(value => 
    Array.isArray(value) ? value.length > 0 : 
    typeof value === 'boolean' ? true :
    value !== undefined && value !== null && value !== ''
  );

  const availableDestinations = destinationService.getFilteredCount(
    userPreferences.filters, 
    userPreferences.rejectedDestinations
  );
  
  const statusMessage = hasActiveFilters 
    ? `🎯 ${availableDestinations} destinations match your filters` 
    : `🌍 Ready for an adventure? Choose from ${destinationService.getAllDestinations().length} destinations worldwide`;

  // Show helpful message when no results
  const noResultsMessage = hasActiveFilters && availableDestinations === 0 
    ? "No destinations match your current filters. Try adjusting your preferences!" 
    : null;

  return (
    <div className="container bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      {showHero && (
        <HeroSection 
          onGetStarted={handleGetStarted}
          totalDestinations={destinationService.getAllDestinations().length}
        />
      )}

      {/* Header */}
      <header className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 transition-all duration-300 ${showHero ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <Breadcrumb
              items={getBreadcrumbItems(
                currentView,
                currentDestination?.name,
                {
                  toHome: handleNavigateHome,
                  toSaved: handleOpenSaved,
                  toFilters: handleOpenFilters
                }
              )}
            />
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <SearchBar
              onDestinationSelect={handleSearchDestinationSelect}
              onFiltersOpen={handleOpenFilters}
              className="max-w-2xl mx-auto"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wanderlist</h1>
                <p className="text-sm text-gray-600">Discover your next adventure</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filter Button */}
              <button
                onClick={handleOpenFilters}
                className={`relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                  hasActiveFilters ? 'animate-glow' : ''
                }`}
                title="Customize your preferences"
                aria-label={`Open filters${hasActiveFilters ? ' (filters active)' : ''}`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-semibold hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <div className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold animate-pulse">
                    {Object.values(userPreferences.filters).filter(v => 
                      Array.isArray(v) ? v.length > 0 : 
                      typeof v === 'boolean' ? true :
                      v !== undefined && v !== null && v !== ''
                    ).length}
                  </div>
                )}
              </button>
              
              {/* Saved Destinations Counter */}
              <button
                onClick={handleOpenSaved}
                className="relative bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                aria-label={`Open saved destinations (${userPreferences.savedDestinations.length} saved)`}
              >
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-semibold">My Wanderlist</span>
                {userPreferences.savedDestinations.length > 0 && (
                  <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {userPreferences.savedDestinations.length}
                  </div>
                )}
              </button>
              
              {/* Sync Button */}
              <button
                onClick={() => {
                  setIsSyncPanelOpen(true);
                  setCurrentView('sync');
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                title="Sync across devices"
                aria-label="Sync preferences across devices"
              >
                <Cloud className="w-5 h-5" />
                <span className="font-semibold">Sync</span>
              </button>
              
              <div className="text-right">
                {userPreferences.rejectedDestinations.length > 0 && (
                  <button
                    onClick={handleClearRejected}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center mt-1"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear {userPreferences.rejectedDestinations.length} rejected
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`hero-container py-12 ${showHero ? 'hidden' : ''}`}>

        {/* Filtering Loading State */}
        {isFiltering && (
          <div className="hero-text text-center mb-8">
            <FilteringLoader />
          </div>
        )}

        {/* Randomize Button */}
        <div className={`hero-text text-center mb-12 ${isFiltering ? 'opacity-50' : ''}`}>
          {availableDestinations > 0 ? (
            <RandomizeButton 
              onRandomize={handleRandomize}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No destinations found</h3>
              <p className="text-gray-600 mb-4">Your filters are too restrictive. Try adjusting them to discover amazing places!</p>
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adjust Filters
              </button>
            </div>
          )}
          
          {/* Status and Quick Actions */}
          <div className="hero-text mt-6 space-y-4">
            <p className="text-gray-600 text-lg">
              {statusMessage}
            </p>
            {noResultsMessage && (
              <p className="text-orange-600 font-medium">
                {noResultsMessage}
              </p>
            )}
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {!hasActiveFilters && (
                <button
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Customize Your Adventure</span>
                </button>
              )}
              
              {hasActiveFilters && (
                <button
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Adjust Filters</span>
                </button>
              )}
              
              {userPreferences.savedDestinations.length > 0 && (
                <button
                  onClick={() => setIsSavedPanelOpen(true)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>View Saved ({userPreferences.savedDestinations.length})</span>
                </button>
              )}
              
              {userPreferences.rejectedDestinations.length > 0 && (
                <button
                  onClick={handleClearRejected}
                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Rejected ({userPreferences.rejectedDestinations.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="hero-text mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Active Filters
                </h3>
                <button
                  onClick={() => handleFiltersChange({})}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-full transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {userPreferences.filters.continents?.map(continent => (
                  <span key={continent} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    🌍 {continent}
                    <button
                      onClick={() => {
                        const newContinents = userPreferences.filters.continents?.filter(c => c !== continent) || [];
                        handleFiltersChange({ ...userPreferences.filters, continents: newContinents });
                      }}
                      className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {userPreferences.filters.climate?.map(climate => (
                  <span key={climate} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full capitalize">
                    🌡️ {climate}
                    <button
                      onClick={() => {
                        const newClimates = userPreferences.filters.climate?.filter(c => c !== climate) || [];
                        handleFiltersChange({ ...userPreferences.filters, climate: newClimates });
                      }}
                      className="ml-2 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {userPreferences.filters.budgetRange && (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    💰 ${userPreferences.filters.budgetRange[0]}-${userPreferences.filters.budgetRange[1]}/day
                    <button
                      onClick={() => handleFiltersChange({ ...userPreferences.filters, budgetRange: undefined })}
                      className="ml-2 hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {userPreferences.filters.travelStyle?.map(style => (
                  <span key={style} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {style === 'kid-friendly' ? '👶' : style === 'family-friendly' ? '👨‍👩‍👧‍👦' : style === 'solo-trip' ? '🎒' : '💕'} {style.replace('-', ' ')}
                    <button
                      onClick={() => {
                        const newStyles = userPreferences.filters.travelStyle?.filter(s => s !== style) || [];
                        handleFiltersChange({ ...userPreferences.filters, travelStyle: newStyles });
                      }}
                      className="ml-2 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {userPreferences.filters.safetyMin && (
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    🛡️ Safety {userPreferences.filters.safetyMin}+
                    <button
                      onClick={() => handleFiltersChange({ ...userPreferences.filters, safetyMin: undefined })}
                      className="ml-2 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {availableDestinations} destinations match your filters
                </p>
                <button
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Modify Filters</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Hero Button */}
        {!showHero && (
          <div className="hero-text text-center mb-8">
            <button
              onClick={() => setShowHero(true)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center space-x-2 mx-auto hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-200"
            >
              <span>← Back to Home</span>
            </button>
          </div>
        )}
        
        {/* Destination Card */}
        {currentDestination && !showHero && (
          <div className={`mb-12 animate-fade-in ${isFiltering ? 'opacity-50' : ''}`}>
            <DestinationCard
              destination={currentDestination}
              onSave={handleSaveDestination}
              onShare={handleShareDestination}
              onReject={handleRejectDestination}
              isSaved={userPreferences.savedDestinations.includes(currentDestination.id)}
            />
          </div>
        )}
        
        {/* Continue Exploring */}
        {currentDestination && !showHero && (
          <div className={`hero-text text-center mb-12 ${isFiltering ? 'opacity-50' : ''}`}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Ready for another adventure?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <RandomizeButton 
                  onRandomize={handleRandomize}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        {!showHero && (
          <div className={`hero-text text-center text-gray-500 text-sm ${isFiltering ? 'opacity-50' : ''}`}>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                🗺️ Discover from <span className="font-bold text-blue-600">{destinationService.getAllDestinations().length}</span> curated destinations across <span className="font-bold text-purple-600">6 continents</span>
              </p>
              {userPreferences.rejectedDestinations.length > 0 && (
                <p className="text-sm text-orange-600">
                  🚫 {userPreferences.rejectedDestinations.length} destinations hidden based on your preferences
                </p>
              )}
              {userPreferences.savedDestinations.length > 0 && (
                <p className="text-sm text-green-600">
                  ❤️ {userPreferences.savedDestinations.length} destinations saved to your wishlist
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Filter Panel */}
      <FilterPanel
        filters={userPreferences.filters}
        onFiltersChange={handleFiltersChange}
        isOpen={isFilterPanelOpen}
        onToggle={() => {
          setIsFilterPanelOpen(!isFilterPanelOpen);
          setCurrentView(isFilterPanelOpen ? 'home' : 'filters');
        }}
      />

      {/* Saved Destinations Panel */}
      <SavedDestinationsPanel
        savedDestinationIds={userPreferences.savedDestinations}
        onRemoveDestination={handleSaveDestination}
        onShareDestination={handleShareDestination}
        onViewDestination={handleViewSavedDestination}
        isOpen={isSavedPanelOpen}
        onToggle={() => {
          setIsSavedPanelOpen(!isSavedPanelOpen);
          setCurrentView(isSavedPanelOpen ? 'home' : 'saved');
        }}
      />

      {/* Sync Panel */}
      <SyncPanel
        userPreferences={userPreferences}
        onSyncComplete={handleSyncComplete}
        isOpen={isSyncPanelOpen}
        onClose={() => {
          setIsSyncPanelOpen(false);
          setCurrentView('home');
        }}
      />
    </div>
  );
}

export default App;