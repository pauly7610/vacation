import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Filters } from '../types';
import { DestinationService } from '../services/destinationService';

interface FilterPanelProps {
  filters: Partial<Filters>;
  onFiltersChange: (filters: Partial<Filters>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const destinationService = DestinationService.getInstance();
  const [activeTab, setActiveTab] = useState<'location' | 'budget' | 'preferences' | 'practical'>('location');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showAllCountries, setShowAllCountries] = useState(false);
  
  // Get counts for each filter option
  const filterCounts = destinationService.getFilterOptionCounts(filters);

  const continents = destinationService.getContinents();
  const countries = destinationService.getCountries();
  const activities = destinationService.getActivities();
  
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const getContinentEmoji = (continent: string) => {
    switch (continent) {
      case 'Europe': return '🏰';
      case 'Asia': return '🏯';
      case 'North America': return '🗽';
      case 'South America': return '🌎';
      case 'Africa': return '🦁';
      case 'Oceania': return '🏄';
      default: return '🌍';
    }
  };

  const getContinentStyle = (continent: string) => {
    const styles = {
      'Europe': {
        default: 'hover:bg-blue-50 border-blue-200',
        selected: 'bg-blue-100 border-blue-400',
        icon: 'bg-blue-100'
      },
      'Asia': {
        default: 'hover:bg-red-50 border-red-200',
        selected: 'bg-red-100 border-red-400',
        icon: 'bg-red-100'
      },
      'North America': {
        default: 'hover:bg-green-50 border-green-200',
        selected: 'bg-green-100 border-green-400',
        icon: 'bg-green-100'
      },
      'South America': {
        default: 'hover:bg-yellow-50 border-yellow-200',
        selected: 'bg-yellow-100 border-yellow-400',
        icon: 'bg-yellow-100'
      },
      'Africa': {
        default: 'hover:bg-orange-50 border-orange-200',
        selected: 'bg-orange-100 border-orange-400',
        icon: 'bg-orange-100'
      },
      'Oceania': {
        default: 'hover:bg-teal-50 border-teal-200',
        selected: 'bg-teal-100 border-teal-400',
        icon: 'bg-teal-100'
      }
    };
    return styles[continent as keyof typeof styles] || styles['Europe'];
  };

  const getContinentCount = (continent: string) => {
    return destinationService.getAllDestinations().filter(d => d.continent === continent).length;
  };

  const handleContinentChange = (continent: string) => {
    const currentContinents = filters.continents || [];
    const newContinents = currentContinents.includes(continent)
      ? currentContinents.filter(c => c !== continent)
      : [...currentContinents, continent];
    
    onFiltersChange({ ...filters, continents: newContinents });
  };

  const handleExcludedCountryChange = (country: string) => {
    const currentCountries = filters.excludedCountries || [];
    const newCountries = currentCountries.includes(country)
      ? currentCountries.filter(c => c !== country)
      : [...currentCountries, country];
    
    onFiltersChange({ ...filters, excludedCountries: newCountries });
  };

  const handleActivityChange = (activity: string) => {
    const currentActivities = filters.activities || [];
    const newActivities = currentActivities.includes(activity)
      ? currentActivities.filter(a => a !== activity)
      : [...currentActivities, activity];
    
    onFiltersChange({ ...filters, activities: newActivities });
  };

  const handleClimateChange = (climate: string) => {
    const currentClimates = filters.climate || [];
    const newClimates = currentClimates.includes(climate)
      ? currentClimates.filter(c => c !== climate)
      : [...currentClimates, climate];
    
    onFiltersChange({ ...filters, climate: newClimates });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  return (
    <>
      {/* Toggle Button */}
      <div className={`fixed top-6 right-6 z-50 ${isOpen ? 'hidden' : ''}`}>
        <button
          onClick={onToggle}
          className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg rounded-full p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 text-white"
        >
          <SlidersHorizontal className="w-6 h-6" />
          {hasActiveFilters && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">{Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== undefined).length}</span>
            </div>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-40 transform transition-transform duration-300 hero-container container ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="hero-text p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Filters</h2>
                <p className="text-blue-100 text-sm mt-1">Customize your perfect adventure</p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm text-white transition-all duration-200 hover:scale-105"
              >
                Clear all filters ({Object.values(filters).filter(v => 
                  Array.isArray(v) ? v.length > 0 : 
                  typeof v === 'boolean' ? true :
                  v !== undefined && v !== null && v !== ''
                ).length})
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {[
              { id: 'location', label: 'Location' },
              { id: 'budget', label: 'Budget' },
              { id: 'preferences', label: 'Preferences' },
              { id: 'practical', label: 'Practical' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 px-4 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-3 border-blue-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="hero-text flex-1 overflow-y-auto p-6 bg-gray-50">
            {/* Filter Categories Overview */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ['location'].includes(activeTab) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`} onClick={() => setActiveTab('location')}>
                <div className="text-center">
                  <span className="text-2xl mb-1 block">🌍</span>
                  <p className="font-medium text-gray-800 text-sm">Location</p>
                  <p className="text-xs text-gray-600">Where to go</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ['budget'].includes(activeTab) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`} onClick={() => setActiveTab('budget')}>
                <div className="text-center">
                  <span className="text-2xl mb-1 block">💰</span>
                  <p className="font-medium text-gray-800 text-sm">Budget</p>
                  <p className="text-xs text-gray-600">How much to spend</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ['preferences'].includes(activeTab) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`} onClick={() => setActiveTab('preferences')}>
                <div className="text-center">
                  <span className="text-2xl mb-1 block">🎯</span>
                  <p className="font-medium text-gray-800 text-sm">Preferences</p>
                  <p className="text-xs text-gray-600">What you like</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ['practical'].includes(activeTab) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`} onClick={() => setActiveTab('practical')}>
                <div className="text-center">
                  <span className="text-2xl mb-1 block">🛡️</span>
                  <p className="font-medium text-gray-800 text-sm">Practical</p>
                  <p className="text-xs text-gray-600">Safety & logistics</p>
                </div>
              </div>
            </div>

            {activeTab === 'location' && (
              <div className="space-y-6">
                {/* Continents */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Continents</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {continents.map((continent) => (
                      <label key={continent} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border-2 ${
                        filters.continents?.includes(continent) 
                          ? getContinentStyle(continent).selected
                          : getContinentStyle(continent).default
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getContinentStyle(continent).icon}`}>
                          {getContinentEmoji(continent)}
                        </div>
                        <input
                          type="checkbox"
                          checked={filters.continents?.includes(continent) || false}
                          onChange={() => handleContinentChange(continent)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 sr-only"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">{continent}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            {filterCounts.continents[continent] || 0} destinations
                            {filterCounts.continents[continent] === 0 && (
                              <span className="text-orange-500 ml-1">(none available with current filters)</span>
                            )}
                          </p>
                        </div>
                        {filters.continents?.includes(continent) && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Excluded Countries */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Exclude Countries</h3>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search countries to exclude..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {filteredCountries.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No countries found</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-1">
                          {filteredCountries.slice(0, showAllCountries ? filteredCountries.length : 15).map((country) => (
                            <label key={country} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-white transition-colors touch-manipulation">
                             <>
                              <input
                                type="checkbox"
                                checked={filters.excludedCountries?.includes(country) || false}
                                onChange={() => handleExcludedCountryChange(country)}
                                className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-gray-700 text-sm flex-1 min-w-0 truncate">{country}</span>
                             </>
                            </label>
                          ))}
                        </div>
                        {!showAllCountries && filteredCountries.length > 15 && (
                          <button
                            onClick={() => setShowAllCountries(true)}
                            className="w-full text-center py-3 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Show {filteredCountries.length - 15} more countries...
                          </button>
                        )}
                        {showAllCountries && filteredCountries.length > 15 && (
                          <button
                            onClick={() => setShowAllCountries(false)}
                            className="w-full text-center py-3 text-gray-600 hover:text-gray-700 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {filters.excludedCountries && filters.excludedCountries.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700 font-medium">
                          {filters.excludedCountries.length} countries excluded
                        </p>
                        <button
                          onClick={() => onFiltersChange({ ...filters, excludedCountries: [] })}
                          className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-100 rounded transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {filters.excludedCountries.slice(0, 5).map((country) => (
                          <span key={country} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            {country}
                            <button
                              onClick={() => handleExcludedCountryChange(country)}
                              className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {filters.excludedCountries.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{filters.excludedCountries.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-6">
                {/* Budget Range */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Daily Budget Range</h3>
                  <div className="space-y-4">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-700 font-medium">
                        Current range: ${filters.budgetRange?.[0] || 0} - ${filters.budgetRange?.[1] || 500} per day
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Minimum ($)</label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={filters.budgetRange?.[0] ?? ''}
                          onChange={(e) => {
                            const min = parseInt(e.target.value) || 0;
                            const max = filters.budgetRange?.[1] || 500;
                            onFiltersChange({ ...filters, budgetRange: [min, max] });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Maximum ($)</label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={filters.budgetRange?.[1] ?? ''}
                          onChange={(e) => {
                            const max = parseInt(e.target.value) || 500;
                            const min = filters.budgetRange?.[0] || 0;
                            onFiltersChange({ ...filters, budgetRange: [min, max] });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          placeholder="500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Quick Budget Ranges</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Budget', range: [0, 50], color: 'bg-green-100 hover:bg-green-200 text-green-700' },
                          { label: 'Mid-range', range: [50, 150], color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
                          { label: 'Luxury', range: [150, 300], color: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
                          { label: 'Ultra-luxury', range: [300, 500], color: 'bg-pink-100 hover:bg-pink-200 text-pink-700' }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => onFiltersChange({ ...filters, budgetRange: preset.range as [number, number] })}
                            className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 font-medium hover:scale-105 ${preset.color}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Level Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Cost Level</h3>
                  <div className="space-y-2">
                    {['budget', 'mid-range', 'luxury'].map((level) => (
                      <label key={level} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.costLevel?.includes(level) || false}
                          onChange={() => {
                            const currentLevels = filters.costLevel || [];
                            const newLevels = currentLevels.includes(level)
                              ? currentLevels.filter(l => l !== level)
                              : [...currentLevels, level];
                            onFiltersChange({ ...filters, costLevel: newLevels });
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-gray-700 capitalize font-medium">{level}</span>
                          <span className="text-xs text-gray-500">
                            ({filterCounts.costLevels[level] || 0})
                            {filterCounts.costLevels[level] === 0 && (
                              <span className="text-orange-500 ml-1">unavailable</span>
                            )}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Climate */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Climate</h3>
                  <div className="space-y-2">
                    {['tropical', 'temperate', 'cold', 'desert', 'mediterranean'].map((climate) => (
                      <label key={climate} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.climate?.includes(climate) || false}
                          onChange={() => handleClimateChange(climate)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-gray-700 capitalize font-medium">{climate}</span>
                          <span className="text-xs text-gray-500">
                            ({filterCounts.climates[climate] || 0})
                            {filterCounts.climates[climate] === 0 && (
                              <span className="text-orange-500 ml-1">unavailable</span>
                            )}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Activities</h3>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <label key={activity} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.activities?.includes(activity) || false}
                          onChange={() => handleActivityChange(activity)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 capitalize font-medium">{activity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'practical' && (
              <div className="space-y-6">
                {/* Safety Rating */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Minimum Safety Rating</h3>
                  <div className="space-y-3">
                    <select
                      value={filters.safetyMin ?? ''}
                      onChange={(e) => onFiltersChange({ 
                        ...filters, 
                        safetyMin: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="">Any rating</option>
                      <option value="5">5+ (Fair)</option>
                      <option value="6">6+ (Good)</option>
                      <option value="7">7+ (Very Good)</option>
                      <option value="8">8+ (Excellent)</option>
                      <option value="9">9+ (Outstanding)</option>
                      <option value="10">10 (Perfect)</option>
                    </select>
                    <div className="text-xs text-gray-500">
                      <p className="italic">Safety ratings based on crime rates, political stability, and travel advisories</p>
                    </div>
                  </div>
                </div>

                {/* Visa Requirements */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Visa Requirements</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="visa"
                        checked={filters.visaRequired === false}
                        onChange={() => onFiltersChange({ ...filters, visaRequired: false })}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium">No visa required</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="visa"
                        checked={filters.visaRequired === true}
                        onChange={() => onFiltersChange({ ...filters, visaRequired: true })}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium">Visa required (I don't mind)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="visa"
                        checked={filters.visaRequired === undefined}
                        onChange={() => onFiltersChange({ ...filters, visaRequired: undefined })}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium">Any (show all destinations)</span>
                    </label>
                  </div>
                </div>

                {/* Season Preferences */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Travel Season</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'current', label: 'Good to visit now', months: [new Date().getMonth() + 1] },
                      { id: 'spring', label: 'Spring (Mar-May)', months: [3, 4, 5] },
                      { id: 'summer', label: 'Summer (Jun-Aug)', months: [6, 7, 8] },
                      { id: 'fall', label: 'Fall (Sep-Nov)', months: [9, 10, 11] },
                      { id: 'winter', label: 'Winter (Dec-Feb)', months: [12, 1, 2] }
                    ].map((season) => (
                      <label key={season.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.seasonPreference?.includes(season.id) || false}
                          onChange={() => {
                            const currentSeasons = filters.seasonPreference || [];
                            const newSeasons = currentSeasons.includes(season.id)
                              ? currentSeasons.filter(s => s !== season.id)
                              : [...currentSeasons, season.id];
                            onFiltersChange({ ...filters, seasonPreference: newSeasons });
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">{season.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Travel Style */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Travel Style</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'kid-friendly', label: 'Kid-Friendly', icon: '👶', description: 'Safe and fun for children' },
                      { id: 'family-friendly', label: 'Family-Friendly', icon: '👨‍👩‍👧‍👦', description: 'Perfect for families with kids' },
                      { id: 'solo-trip', label: 'Solo Travel', icon: '🎒', description: 'Great for solo adventurers' },
                      { id: 'couple-trip', label: 'Romantic Getaway', icon: '💕', description: 'Perfect for couples' }
                    ].map((style) => (
                      <label key={style.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="text-2xl">{style.icon}</div>
                        <input
                          type="checkbox"
                          checked={filters.travelStyle?.includes(style.id) || false}
                          onChange={() => {
                            const currentStyles = filters.travelStyle || [];
                            const newStyles = currentStyles.includes(style.id)
                              ? currentStyles.filter(s => s !== style.id)
                              : [...currentStyles, style.id];
                            onFiltersChange({ ...filters, travelStyle: newStyles });
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium">{style.label}</span>
                          <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                        </div>
                        {filters.travelStyle?.includes(style.id) && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Smart Filtering:</strong> If your filters are too restrictive, we'll automatically expand them to ensure you always get great recommendations!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};