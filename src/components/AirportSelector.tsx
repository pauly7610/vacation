import React, { useState, useEffect, useRef } from 'react';
import { Plane, MapPin, Search, X } from 'lucide-react';
import { airports, searchAirports, getPopularAirports, Airport } from '../data/airportCodes';

interface AirportSelectorProps {
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const AirportSelector: React.FC<AirportSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search city or airport...",
  label = "Airport",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredAirports(getPopularAirports());
    } else if (searchTerm.length >= 2) {
      const results = searchAirports(searchTerm);
      setFilteredAirports(results);
    } else {
      setFilteredAirports([]);
    }
    setSelectedIndex(-1);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleAirportSelect = (airport: Airport) => {
    const displayValue = `${airport.city} (${airport.code})`;
    setSearchTerm(displayValue);
    onChange(displayValue, airport);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredAirports[selectedIndex]) {
          handleAirportSelect(filteredAirports[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (searchTerm.length === 0) {
      setFilteredAirports(getPopularAirports());
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  const clearInput = () => {
    setSearchTerm('');
    onChange('');
    inputRef.current?.focus();
  };

  const getAirportFlag = (country: string): string => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Singapore': '🇸🇬',
      'Thailand': '🇹🇭',
      'Australia': '🇦🇺',
      'New Zealand': '🇳🇿',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'South Africa': '🇿🇦',
      'Egypt': '🇪🇬',
      'United Arab Emirates': '🇦🇪',
      'India': '🇮🇳',
      'Mexico': '🇲🇽',
      'Turkey': '🇹🇷',
      'Greece': '🇬🇷',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Norway': '🇳🇴',
      'Sweden': '🇸🇪',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Iceland': '🇮🇸',
      'Portugal': '🇵🇹',
      'Ireland': '🇮🇪'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        
        {searchTerm && (
          <button
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredAirports.length === 0 && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Plane className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No airports found</p>
              <p className="text-xs">Try searching for a city name</p>
            </div>
          ) : (
            <>
              {searchTerm.length === 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Popular Airports
                  </p>
                </div>
              )}
              
              {filteredAirports.map((airport, index) => (
                <button
                  key={airport.code}
                  onClick={() => handleAirportSelect(airport)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">
                          {airport.code}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {airport.city}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {airport.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getAirportFlag(airport.country)}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {airport.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};