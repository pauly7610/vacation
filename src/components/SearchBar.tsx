import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Filter } from 'lucide-react';
import { DestinationService } from '../services/destinationService';
import { Destination } from '../types';

interface SearchBarProps {
  onDestinationSelect: (destination: Destination) => void;
  onFiltersOpen: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onDestinationSelect,
  onFiltersOpen,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Destination[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const destinationService = DestinationService.getInstance();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const allDestinations = destinationService.getAllDestinations();
        const filtered = allDestinations.filter(destination =>
          destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          destination.continent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          destination.activities.some(activity => 
            activity.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ).slice(0, 8);
        
        setResults(filtered);
        setIsLoading(false);
        setSelectedIndex(-1);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSearchTerm('');
    setIsOpen(false);
    onDestinationSelect(destination);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleDestinationSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
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
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onBlur={(e) => {
              setTimeout(() => {
                if (!dropdownRef.current?.contains(document.activeElement)) {
                  setIsOpen(false);
                }
              }, 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search destinations, countries, or activities..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            aria-label="Search destinations"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            aria-autocomplete="list"
            aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
          />
          
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <button
          onClick={onFiltersOpen}
          className="px-4 py-3 bg-blue-500 text-white rounded-r-xl hover:bg-blue-600 transition-colors border border-blue-500 flex items-center space-x-2 shadow-sm"
          aria-label="Open filters"
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Filters</span>
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.length >= 2 || isLoading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Searching destinations...</p>
            </div>
          ) : results.length === 0 && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No destinations found</p>
              <p className="text-xs mt-1">Try searching for a city, country, or activity</p>
            </div>
          ) : (
            results.map((destination, index) => (
              <button
                key={destination.id}
                id={`search-result-${index}`}
                onClick={() => handleDestinationSelect(destination)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={destination.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{destination.name}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{destination.country}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {getClimateIcon(destination.climate)}
                          <span className="ml-1 capitalize">{destination.climate}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      ${destination.dailyBudget.min}-${destination.dailyBudget.max}
                    </p>
                    <p className="text-xs text-gray-500">per day</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};