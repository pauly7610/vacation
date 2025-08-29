import React, { useState, useEffect } from 'react';
import { Plane, Hotel, MapPin, Clock, Users, Star, Shield, CreditCard, ExternalLink, Filter, ArrowUpDown } from 'lucide-react';
import { AmadeusService } from '../services/amadeusService';
import { Destination } from '../types';
import { getAirportByCode, searchAirports } from '../data/airportCodes';

interface BookingSearchResultsProps {
  destination: Destination;
  searchType: 'flights' | 'hotels' | 'activities';
  searchParams: any;
  onBookingSelect: (booking: any) => void;
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  cabin: string;
  baggage: string;
  bookingUrl?: string;
}

interface HotelResult {
  id: string;
  name: string;
  rating: number;
  address: string;
  distance: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
    perNight: boolean;
  };
  amenities: string[];
  images: string[];
  cancellation: string;
  breakfast: boolean;
  bookingUrl?: string;
}

interface ActivityResult {
  id: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  images: string[];
  category: string;
  inclusions: string[];
  cancellation: string;
  instantConfirmation: boolean;
  bookingUrl?: string;
}

export const BookingSearchResults: React.FC<BookingSearchResultsProps> = ({
  destination,
  searchType,
  searchParams,
  onBookingSelect
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'duration' | 'popularity'>('price');
  const [filterBy, setFilterBy] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const amadeusService = AmadeusService.getInstance();

  useEffect(() => {
    searchBookings();
  }, [searchType, searchParams, destination]);

  const searchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      let searchResults: any[] = [];

      switch (searchType) {
        case 'flights':
          searchResults = await searchFlights();
          break;
        case 'hotels':
          searchResults = await searchHotels();
          break;
        case 'activities':
          searchResults = await searchActivities();
          break;
      }

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Booking search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchFlights = async (): Promise<FlightResult[]> => {
    try {
      // Validate required parameters
      const origin = searchParams.origin || 'New York (JFK)';
      const departureDate = searchParams.departureDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Extract airport codes from formatted strings like "New York (JFK)" or search for codes
      let originCode: string | null = null;
      const originMatch = origin.match(/\(([A-Z]{3})\)/);
      if (originMatch) {
        originCode = originMatch[1];
      } else {
        originCode = await amadeusService.getAirportCode(origin);
      }
      
      const destCode = await amadeusService.getAirportCode(destination.name);

      if (!originCode || !destCode) {
        // Fallback to sample data if airport codes not found
        console.warn('Airport codes not found, using sample data');
        return getSampleFlightResults();
      }

      const flightOffers = await amadeusService.searchFlights({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate: departureDate,
        returnDate: searchParams.returnDate,
        adults: searchParams.adults || 1,
        children: searchParams.children,
        travelClass: searchParams.cabinClass,
        max: 20
      });

      if (flightOffers.length === 0) {
        // Return sample data if no results
        return getSampleFlightResults();
      }

      return flightOffers.map((offer, index) => {
        const outbound = offer.itineraries[0];
        const firstSegment = outbound.segments[0];
        const lastSegment = outbound.segments[outbound.segments.length - 1];

        return {
          id: offer.id || index.toString(),
          airline: firstSegment.carrierCode,
          flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
          departure: {
            airport: firstSegment.departure.iataCode,
            time: new Date(firstSegment.departure.at).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            date: new Date(firstSegment.departure.at).toLocaleDateString()
          },
          arrival: {
            airport: lastSegment.arrival.iataCode,
            time: new Date(lastSegment.arrival.at).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            date: new Date(lastSegment.arrival.at).toLocaleDateString()
          },
          duration: amadeusService.formatDuration(outbound.duration),
          stops: outbound.segments.length - 1,
          price: {
            amount: parseFloat(offer.price.grandTotal),
            currency: offer.price.currency,
            formatted: amadeusService.formatPrice(offer.price.grandTotal, offer.price.currency)
          },
          cabin: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'Economy',
          baggage: `${offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity || 0} checked bags`
        };
      });
    } catch (error) {
      console.error('Flight search error:', error);
      // Return sample data on error
      return getSampleFlightResults();
    }
  };

  const getSampleFlightResults = (): FlightResult[] => {
    const origin = searchParams.origin || 'New York (JFK)';
    const departureDate = searchParams.departureDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    // Extract airport code from origin
    const originMatch = origin.match(/\(([A-Z]{3})\)/);
    const originCode = originMatch ? originMatch[1] : 'JFK';
    
    return [
      {
        id: 'sample-1',
        airline: 'AA',
        flightNumber: 'AA 1234',
        departure: {
          airport: originCode,
          time: '8:00 AM',
          date: departureDate
        },
        arrival: {
          airport: destination.name.substring(0, 3).toUpperCase(),
          time: '2:30 PM',
          date: departureDate
        },
        duration: '6h 30m',
        stops: 0,
        price: {
          amount: Math.floor(Math.random() * 800) + 300,
          currency: 'USD',
          formatted: `$${Math.floor(Math.random() * 800) + 300}`
        },
        cabin: 'Economy',
        baggage: '1 checked bag included'
      },
      {
        id: 'sample-2',
        airline: 'DL',
        flightNumber: 'DL 5678',
        departure: {
          airport: originCode === 'JFK' ? 'LGA' : originCode,
          time: '11:15 AM',
          date: departureDate
        },
        arrival: {
          airport: destination.name.substring(0, 3).toUpperCase(),
          time: '6:45 PM',
          date: departureDate
        },
        duration: '7h 30m',
        stops: 1,
        price: {
          amount: Math.floor(Math.random() * 600) + 250,
          currency: 'USD',
          formatted: `$${Math.floor(Math.random() * 600) + 250}`
        },
        cabin: 'Economy',
        baggage: 'Carry-on only'
      }
    ];
  };

  const searchHotels = async (): Promise<HotelResult[]> => {
    try {
      const checkIn = searchParams.checkIn || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const checkOut = searchParams.checkOut || new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const cityCode = await amadeusService.getCityCode(destination.name);
      
      if (!cityCode) {
        console.warn('City code not found, using sample data');
        return getSampleHotelResults();
      }

      const hotelOffers = await amadeusService.searchHotels({
        cityCode: cityCode,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: searchParams.adults || 1,
        roomQuantity: searchParams.rooms || 1
      });

      if (hotelOffers.length === 0) {
        return getSampleHotelResults();
      }

      return hotelOffers.map((offer, index) => {
        const hotel = offer.hotel;
        const bestOffer = offer.offers[0];

        return {
          id: hotel.hotelId || index.toString(),
          name: hotel.name,
          rating: hotel.rating || 0,
          address: hotel.address.lines.join(', '),
          distance: hotel.hotelDistance ? `${hotel.hotelDistance.distance} ${hotel.hotelDistance.distanceUnit}` : '',
          price: {
            amount: parseFloat(bestOffer.price.total),
            currency: bestOffer.price.currency,
            formatted: amadeusService.formatPrice(bestOffer.price.total, bestOffer.price.currency),
            perNight: true
          },
          amenities: hotel.amenities || [],
          images: [], // Amadeus doesn't provide images in basic search
          cancellation: bestOffer.policies?.cancellation?.description?.text || 'Check cancellation policy',
          breakfast: hotel.amenities?.includes('BREAKFAST') || false
        };
      });
    } catch (error) {
      console.error('Hotel search error:', error);
      return getSampleHotelResults();
    }
  };

  const getSampleHotelResults = (): HotelResult[] => {
    return [
      {
        id: 'sample-hotel-1',
        name: `${destination.name} Grand Hotel`,
        rating: 4,
        address: `Downtown ${destination.name}, ${destination.country}`,
        distance: '0.5 km from city center',
        price: {
          amount: Math.floor(Math.random() * 200) + 80,
          currency: 'USD',
          formatted: `$${Math.floor(Math.random() * 200) + 80}`,
          perNight: true
        },
        amenities: ['Free WiFi', 'Pool', 'Gym', 'Restaurant'],
        images: [destination.imageUrl],
        cancellation: 'Free cancellation until 24 hours before check-in',
        breakfast: true
      },
      {
        id: 'sample-hotel-2',
        name: `${destination.name} Boutique Inn`,
        rating: 5,
        address: `Historic District, ${destination.name}`,
        distance: '0.8 km from city center',
        price: {
          amount: Math.floor(Math.random() * 300) + 150,
          currency: 'USD',
          formatted: `$${Math.floor(Math.random() * 300) + 150}`,
          perNight: true
        },
        amenities: ['Free WiFi', 'Spa', 'Concierge', 'Room Service'],
        images: [destination.imageUrl],
        cancellation: 'Free cancellation until 48 hours before check-in',
        breakfast: false
      }
    ];
  };

  const searchActivities = async (): Promise<ActivityResult[]> => {
    try {
      // Return sample activities with destination-specific content
      return [
        {
          id: 'sample-1',
          title: `${destination.name} City Tour`,
          description: `Explore the highlights of ${destination.name} with a professional guide`,
          duration: '4 hours',
          rating: 4.5,
          reviewCount: 128,
          price: {
            amount: Math.floor(Math.random() * 100) + 50,
            currency: 'USD',
            formatted: `$${Math.floor(Math.random() * 100) + 50}.00`
          },
          images: [destination.imageUrl],
          category: 'Sightseeing',
          inclusions: ['Professional guide', 'Transportation', 'Entry fees'],
          cancellation: 'Free cancellation up to 24 hours',
          instantConfirmation: true
        },
        {
          id: 'sample-2',
          title: `${destination.name} Food Tour`,
          description: `Taste the local cuisine and discover hidden culinary gems`,
          duration: '3 hours',
          rating: 4.8,
          reviewCount: 89,
          price: {
            amount: Math.floor(Math.random() * 120) + 70,
            currency: 'USD',
            formatted: `$${Math.floor(Math.random() * 120) + 70}.00`
          },
          images: [destination.imageUrl],
          category: 'Food & Drink',
          inclusions: ['Food tastings', 'Local guide', 'Restaurant visits'],
          cancellation: 'Free cancellation up to 24 hours',
          instantConfirmation: true
        },
        {
          id: 'sample-3',
          title: `${destination.name} Adventure Tour`,
          description: `Experience the best outdoor activities ${destination.name} has to offer`,
          duration: '6 hours',
          rating: 4.6,
          reviewCount: 156,
          price: {
            amount: Math.floor(Math.random() * 150) + 100,
            currency: 'USD',
            formatted: `$${Math.floor(Math.random() * 150) + 100}.00`
          },
          images: [destination.imageUrl],
          category: 'Adventure',
          inclusions: ['Equipment', 'Professional guide', 'Safety briefing', 'Refreshments'],
          cancellation: 'Free cancellation up to 24 hours',
          instantConfirmation: true
        }
      ];
    } catch (error) {
      console.error('Activity search error:', error);
      return [];
    }
  };

  const sortResults = (results: any[]) => {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.amount - b.price.amount;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'duration':
          if (searchType === 'flights') {
            return a.stops - b.stops;
          }
          return 0;
        case 'popularity':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedResults = sortResults(results);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Finding the best {searchType} for you...</p>
        <p className="text-sm text-gray-500 mt-2">
          {searchType === 'flights' && `Searching flights to ${destination.name}`}
          {searchType === 'hotels' && `Finding hotels in ${destination.name}`}
          {searchType === 'activities' && `Discovering activities in ${destination.name}`}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={searchBookings}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-4">
          We couldn't find any {searchType} for your search criteria. Try adjusting your dates or preferences.
        </p>
        <button
          onClick={searchBookings}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {results.length} {searchType} found
          </h3>
          <p className="text-sm text-gray-600">
            {searchType === 'flights' && `${searchParams.origin} → ${destination.name}`}
            {searchType === 'hotels' && `${destination.name} • ${searchParams.checkIn} - ${searchParams.checkOut}`}
            {searchType === 'activities' && `${destination.name} activities and tours`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
            {searchType === 'flights' && <option value="duration">Stops (Fewest First)</option>}
            {(searchType === 'hotels' || searchType === 'activities') && (
              <option value="popularity">Popularity</option>
            )}
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredAndSortedResults.map((result, index) => (
          <div key={result.id || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {searchType === 'flights' && (
              <FlightResultCard flight={result} onSelect={() => onBookingSelect(result)} />
            )}
            {searchType === 'hotels' && (
              <HotelResultCard hotel={result} onSelect={() => onBookingSelect(result)} />
            )}
            {searchType === 'activities' && (
              <ActivityResultCard activity={result} onSelect={() => onBookingSelect(result)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FlightResultCard: React.FC<{ flight: FlightResult; onSelect: () => void }> = ({ flight, onSelect }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <div className="flex items-center space-x-4 mb-2">
        <div className="flex items-center space-x-2">
          <Plane className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">{flight.airline} {flight.flightNumber}</span>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
          {flight.cabin}
        </span>
        {flight.stops === 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
            Direct
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <div>
          <p className="font-medium">{flight.departure.time}</p>
          <p>{flight.departure.airport}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-medium">{flight.duration}</p>
          <p>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</p>
        </div>
        <div>
          <p className="font-medium">{flight.arrival.time}</p>
          <p>{flight.arrival.airport}</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">{flight.baggage}</p>
    </div>
    
    <div className="text-right ml-6">
      <p className="text-2xl font-bold text-gray-800">{flight.price.formatted}</p>
      <p className="text-sm text-gray-600">per person</p>
      <button
        onClick={onSelect}
        className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        Select Flight
      </button>
    </div>
  </div>
);

const HotelResultCard: React.FC<{ hotel: HotelResult; onSelect: () => void }> = ({ hotel, onSelect }) => (
  <div className="flex items-start space-x-4">
    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
      <Hotel className="w-8 h-8 text-gray-400" />
    </div>
    
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">{hotel.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            {hotel.rating > 0 && (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < hotel.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            )}
            <span className="text-sm text-gray-600">{hotel.distance}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{hotel.address}</p>
          
          {hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hotel.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <p className="text-xs text-green-600 mt-2">{hotel.cancellation}</p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{hotel.price.formatted}</p>
          <p className="text-sm text-gray-600">per night</p>
          <button
            onClick={onSelect}
            className="mt-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Select Hotel
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ActivityResultCard: React.FC<{ activity: ActivityResult; onSelect: () => void }> = ({ activity, onSelect }) => (
  <div className="flex items-start space-x-4">
    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
      {activity.images.length > 0 ? (
        <img
          src={activity.images[0]}
          alt={activity.title}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <MapPin className="w-8 h-8 text-gray-400" />
      )}
    </div>
    
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">{activity.title}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {activity.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{activity.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-600">({activity.reviewCount} reviews)</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{activity.duration}</span>
            </div>
            {activity.instantConfirmation && (
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Instant confirmation</span>
              </div>
            )}
          </div>
          
          <p className="text-xs text-green-600 mt-1">{activity.cancellation}</p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{activity.price.formatted}</p>
          <p className="text-sm text-gray-600">per person</p>
          <button
            onClick={onSelect}
            className="mt-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Book Activity
          </button>
        </div>
      </div>
    </div>
  </div>
);