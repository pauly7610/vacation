import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plane, Hotel, Package, MapPin, Calendar, Users, X, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { Destination } from '../types';
import { BookingService, FlightSearchParams, HotelSearchParams } from '../services/bookingService';
import { BookingSearchResults } from './BookingSearchResults';
import { BookingConfirmation } from './BookingConfirmation';
import { AirportSelector } from './AirportSelector';
import { getDestinationAirportCode } from '../data/airportCodes';

interface BookingPanelProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingPanel: React.FC<BookingPanelProps> = ({
  destination,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'packages' | 'activities'>('flights');
  const [flightParams, setFlightParams] = useState<Partial<FlightSearchParams>>({
    origin: 'New York (JFK)',
    adults: 1,
    cabinClass: 'economy'
  });
  const [hotelParams, setHotelParams] = useState<Partial<HotelSearchParams>>({
    adults: 1,
    rooms: 1
  });
  const [showResults, setShowResults] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [dynamicUrls, setDynamicUrls] = useState<Record<string, string>>({});

  const bookingService = BookingService.getInstance();

  // Update URLs dynamically when form data changes
  useEffect(() => {
    updateDynamicUrls();
  }, [flightParams, hotelParams, destination]);

  const updateDynamicUrls = () => {
    const formData = activeTab === 'flights' ? {
      origin: flightParams.origin,
      departureDate: flightParams.departureDate,
      returnDate: flightParams.returnDate,
      adults: flightParams.adults,
      children: flightParams.children,
      cabinClass: flightParams.cabinClass
    } : {
      checkIn: hotelParams.checkIn,
      checkOut: hotelParams.checkOut,
      adults: hotelParams.adults,
      rooms: hotelParams.rooms
    };

    const newUrls: Record<string, string> = {};
    
    if (activeTab === 'flights') {
      newUrls['kayak'] = bookingService.buildDynamicBookingURL('kayak-flights', destination, formData);
      newUrls['google'] = bookingService.buildDynamicBookingURL('google-flights', destination, formData);
      newUrls['expedia'] = bookingService.buildDynamicBookingURL('expedia-flights', destination, formData);
      newUrls['skyscanner'] = bookingService.buildDynamicBookingURL('skyscanner-flights', destination, formData);
    } else if (activeTab === 'hotels') {
      newUrls['kayak'] = bookingService.buildDynamicBookingURL('kayak-hotels', destination, formData);
      newUrls['booking'] = bookingService.buildDynamicBookingURL('booking-hotels', destination, formData);
      newUrls['expedia'] = bookingService.buildDynamicBookingURL('expedia-hotels', destination, formData);
      newUrls['airbnb'] = bookingService.buildDynamicBookingURL('airbnb-hotels', destination, formData);
    }
    
    setDynamicUrls(newUrls);
  };
  if (!isOpen) return null;

  const handleFlightSearch = (provider: string) => {
    // Track booking click for analytics
    console.log(`Flight search: ${provider} for ${destination.name}`);
    setSearchAttempted(true);
    
    // Use dynamic URL instead of static one
    const url = dynamicUrls[provider];
    
    if (provider === 'amadeus') {
      // Ensure we have default dates before searching
      const searchParams = {
        ...flightParams,
        origin: flightParams.origin || 'New York (JFK)',
        departureDate: flightParams.departureDate || defaultDates.departure,
        returnDate: flightParams.returnDate || defaultDates.return,
        adults: flightParams.adults || 1
      };
      setFlightParams(searchParams);
      setShowResults(true);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleHotelSearch = (provider: string) => {
    console.log(`Hotel search: ${provider} for ${destination.name}`);
    setSearchAttempted(true);
    
    // Use dynamic URL instead of static one
    const url = dynamicUrls[provider];
    
    if (provider === 'amadeus') {
      // Ensure we have default dates before searching
      const searchParams = {
        ...hotelParams,
        checkIn: hotelParams.checkIn || defaultDates.checkIn,
        checkOut: hotelParams.checkOut || defaultDates.checkOut,
        adults: hotelParams.adults || 1,
        rooms: hotelParams.rooms || 1
      };
      setHotelParams(searchParams);
      setShowResults(true);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking);
    setShowConfirmation(true);
  };

  const handleBookingConfirm = (bookingData: any) => {
    console.log('Booking confirmed:', bookingData);
    setShowConfirmation(false);
    setSelectedBooking(null);
    setShowResults(false);
    onClose();
  };

  const packageUrls = bookingService.generatePackageSearchUrl(destination);
  const activityUrls = bookingService.generateActivitySearchUrl(destination);

  const getDefaultDates = () => {
    const departure = new Date();
    departure.setDate(departure.getDate() + 30);
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 37);
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 30);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 33);

    return {
      departure: departure.toISOString().split('T')[0],
      return: returnDate.toISOString().split('T')[0],
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();
  
  // Get destination airport info for display
  const destinationAirportCode = getDestinationAirportCode(destination.name, destination.country);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center hero-container container">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="hero-text p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Plane className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Book Your Trip</h2>
                  <p className="text-blue-100 text-sm">{destination.name}, {destination.country}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {[
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'hotels', label: 'Hotels', icon: Hotel },
              { id: 'packages', label: 'Packages', icon: Package },
              { id: 'activities', label: 'Activities', icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 px-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-3 border-blue-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="hero-text p-6">
            {showResults ? (
              <BookingSearchResults
                destination={destination}
                searchType={activeTab}
                searchParams={activeTab === 'flights' ? {
                  ...flightParams,
                  origin: flightParams.origin || 'NYC',
                  departureDate: flightParams.departureDate || defaultDates.departure,
                  returnDate: flightParams.returnDate || defaultDates.return,
                  adults: flightParams.adults || 1
                } : activeTab === 'hotels' ? {
                  ...hotelParams,
                  checkIn: hotelParams.checkIn || defaultDates.checkIn,
                  checkOut: hotelParams.checkOut || defaultDates.checkOut,
                  adults: hotelParams.adults || 1,
                  rooms: hotelParams.rooms || 1
                } : {}}
                onBookingSelect={handleBookingSelect}
              />
            ) : (
              <>
            {activeTab === 'flights' && (
              <div className="space-y-6">
                {/* Flight Search Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Customize Your Flight Search</h3>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-600">✈️</span>
                      <span className="font-medium text-blue-800">Flight Route</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Searching flights: <strong>{flightParams.origin || 'New York (JFK)'}</strong> → <strong>{destination.name} ({destinationAirportCode})</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <AirportSelector
                        label="Departure City"
                        value={flightParams.origin || ''}
                        onChange={(value) => setFlightParams({ ...flightParams, origin: value })}
                        placeholder="Search departure city..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                      <input
                        type="date"
                        value={flightParams.departureDate || defaultDates.departure}
                        onChange={(e) => setFlightParams({ ...flightParams, departureDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Return (optional)</label>
                      <input
                        type="date"
                        value={flightParams.returnDate || defaultDates.return}
                        onChange={(e) => setFlightParams({ ...flightParams, returnDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Destination Info */}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">🎯</span>
                      <span className="font-medium text-green-800">Destination: {destination.name} ({destinationAirportCode})</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {destination.country} • {destination.continent}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                      <select
                        value={flightParams.adults || 1}
                        onChange={(e) => setFlightParams({ ...flightParams, adults: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                      <select
                        value={flightParams.cabinClass || 'economy'}
                        onChange={(e) => setFlightParams({ ...flightParams, cabinClass: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Flight Booking Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['kayak', 'google', 'expedia', 'skyscanner'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleFlightSearch(provider)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 capitalize">{provider}</h4>
                            <p className="text-sm text-gray-600">
                              {provider === 'kayak' ? 'Compare flight prices' :
                               provider === 'google' ? 'Google Travel search' :
                               provider === 'expedia' ? 'Book flights & packages' :
                               'Compare airline prices'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          <span className="text-xs text-green-600 mt-1">Live URL</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="space-y-6">
                {/* Hotel Search Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Customize Your Hotel Search</h3>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      💡 <strong>Quick Start:</strong> Leave dates empty to search for next month (30 days from now)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                      <input
                        type="date"
                        placeholder={defaultDates.checkIn}
                        value={hotelParams.checkIn || defaultDates.checkIn}
                        onChange={(e) => setHotelParams({ ...hotelParams, checkIn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                      <input
                        type="date"
                        placeholder={defaultDates.checkOut}
                        value={hotelParams.checkOut || defaultDates.checkOut}
                        onChange={(e) => setHotelParams({ ...hotelParams, checkOut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                      <select
                        value={hotelParams.adults || 1}
                        onChange={(e) => setHotelParams({ ...hotelParams, adults: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                      <select
                        value={hotelParams.rooms || 1}
                        onChange={(e) => setHotelParams({ ...hotelParams, rooms: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hotel Booking Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['kayak', 'booking', 'expedia', 'airbnb'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleHotelSearch(provider)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Hotel className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 capitalize">{provider}</h4>
                            <p className="text-sm text-gray-600">
                              {provider === 'kayak' ? 'Compare hotel prices' :
                               provider === 'booking' ? 'Book accommodations' :
                               provider === 'airbnb' ? 'Unique stays & experiences' :
                               provider === 'hotels' ? 'Hotel deals & rewards' :
                               provider === 'expedia' ? 'Hotels & vacation rentals' :
                               'Find accommodations'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                          <span className="text-xs text-green-600 mt-1">Live URL</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Package className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">Travel Packages</h3>
                  <p className="text-gray-600">Find complete vacation packages with flights + hotels</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(packageUrls).map(([provider, url]) => (
                    <button
                      key={provider}
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 capitalize">{provider}</h4>
                            <p className="text-sm text-gray-600">
                              {provider === 'expedia' ? 'Flight + Hotel packages' :
                               provider === 'priceline' ? 'Express deals & packages' :
                               provider === 'costco' ? 'Member exclusive packages' :
                               'Complete vacation packages'}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">💡 Package Benefits</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Often cheaper than booking separately</li>
                    <li>• Coordinated travel arrangements</li>
                    <li>• Single point of contact for support</li>
                    <li>• May include extras like transfers or meals</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">Tours & Activities</h3>
                  <p className="text-gray-600">Discover experiences and attractions in {destination.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => window.open(activityUrls.tripadvisor, '_blank', 'noopener,noreferrer')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">TripAdvisor</h4>
                          <p className="text-sm text-gray-600">Find tours and attractions</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </button>
                  {Object.entries(activityUrls).map(([provider, url]) => (
                    <button
                      key={provider}
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 capitalize">{provider}</h4>
                            <p className="text-sm text-gray-600">Tours and experiences</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Activity Suggestions based on destination */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">🎯 Recommended for {destination.name}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {destination.activities.slice(0, 6).map((activity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm capitalize"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-orange-700 mt-3">
                    💡 Click the buttons above to search for these activities on booking platforms
                  </p>
                </div>
              </div>
            )}
              </>
            )}

            {/* Budget Estimate */}
            {!showResults && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Estimated Daily Budget</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Accommodation</p>
                  <p className="text-blue-800 font-bold">${Math.round(destination.dailyBudget.min * 0.6)}-${Math.round(destination.dailyBudget.max * 0.6)}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Food & Drinks</p>
                  <p className="text-blue-800 font-bold">${Math.round(destination.dailyBudget.min * 0.3)}-${Math.round(destination.dailyBudget.max * 0.3)}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Activities</p>
                  <p className="text-blue-800 font-bold">${Math.round(destination.dailyBudget.min * 0.1)}-${Math.round(destination.dailyBudget.max * 0.1)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Total per day:</span>
                  <span className="text-blue-800 font-bold text-lg">${destination.dailyBudget.min}-${destination.dailyBudget.max}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600 italic">
                  💡 All booking links above use your current search criteria and update in real-time
                </p>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedBooking && (
        <BookingConfirmation
          booking={selectedBooking}
          bookingType={activeTab}
          onConfirm={handleBookingConfirm}
          onCancel={() => {
            setShowConfirmation(false);
            setSelectedBooking(null);
          }}
          isOpen={showConfirmation}
        />
      )}
    </>
  );
};