// Amadeus API service for flight and hotel data
import { getAirportByCode, searchAirports } from '../data/airportCodes';

interface AmadeusConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: FlightPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  fees: Array<{
    amount: string;
    type: string;
  }>;
  grandTotal: string;
}

interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
  }>;
}

interface HotelOffer {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: string;
    name: string;
    rating: number;
    cityCode: string;
    latitude: number;
    longitude: number;
    hotelDistance: {
      distance: number;
      distanceUnit: string;
    };
    address: {
      lines: string[];
      postalCode: string;
      cityName: string;
      countryCode: string;
    };
    contact: {
      phone: string;
      fax: string;
      email: string;
    };
    amenities: string[];
  };
  available: boolean;
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    rateCode: string;
    rateFamilyEstimated: {
      code: string;
      type: string;
    };
    room: {
      type: string;
      typeEstimated: {
        category: string;
        beds: number;
        bedType: string;
      };
      description: {
        text: string;
        lang: string;
      };
    };
    guests: {
      adults: number;
    };
    price: {
      currency: string;
      base: string;
      total: string;
      variations: {
        average: {
          base: string;
        };
        changes: Array<{
          startDate: string;
          endDate: string;
          base: string;
        }>;
      };
    };
    policies: {
      paymentType: string;
      cancellation: {
        description: {
          text: string;
        };
      };
    };
    self: string;
  }>;
  self: string;
}

export class AmadeusService {
  private static instance: AmadeusService;
  private config: AmadeusConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {
    this.config = {
      clientId: process.env.REACT_APP_AMADEUS_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_AMADEUS_CLIENT_SECRET || '',
      baseUrl: 'https://test.api.amadeus.com' // Use production URL in production
    };
  }

  static getInstance(): AmadeusService {
    if (!AmadeusService.instance) {
      AmadeusService.instance = new AmadeusService();
    }
    return AmadeusService.instance;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

      return this.accessToken;
    } catch (error) {
      console.error('Amadeus authentication error:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  async searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    currencyCode?: string;
    max?: number;
  }): Promise<FlightOffer[]> {
    try {
      const token = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        currencyCode: params.currencyCode || 'USD',
        max: (params.max || 10).toString(),
      });

      if (params.returnDate) {
        searchParams.append('returnDate', params.returnDate);
      }
      if (params.children) {
        searchParams.append('children', params.children.toString());
      }
      if (params.infants) {
        searchParams.append('infants', params.infants.toString());
      }
      if (params.travelClass) {
        searchParams.append('travelClass', params.travelClass);
      }

      const response = await fetch(
        `${this.config.baseUrl}/v2/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Flight search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Flight search error:', error);
      throw new Error('Failed to search flights');
    }
  }

  async searchHotels(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
    radius?: number;
    radiusUnit?: string;
    hotelIds?: string[];
    ratings?: number[];
    amenities?: string[];
    currency?: string;
  }): Promise<HotelOffer[]> {
    try {
      const token = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults.toString(),
        roomQuantity: (params.roomQuantity || 1).toString(),
        radius: (params.radius || 5).toString(),
        radiusUnit: params.radiusUnit || 'KM',
        currency: params.currency || 'USD',
      });

      if (params.hotelIds && params.hotelIds.length > 0) {
        params.hotelIds.forEach(id => searchParams.append('hotelIds', id));
      }
      if (params.ratings && params.ratings.length > 0) {
        params.ratings.forEach(rating => searchParams.append('ratings', rating.toString()));
      }
      if (params.amenities && params.amenities.length > 0) {
        params.amenities.forEach(amenity => searchParams.append('amenities', amenity));
      }

      const response = await fetch(
        `${this.config.baseUrl}/v3/shopping/hotel-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hotel search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Hotel search error:', error);
      throw new Error('Failed to search hotels');
    }
  }

  async getAirportCode(cityName: string): Promise<string | null> {
    try {
      // First try our local database
      const localResults = searchAirports(cityName);
      if (localResults.length > 0) {
        return localResults[0].code;
      }
      
      // If not found locally, try Amadeus API
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.config.baseUrl}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(cityName)}&page%5Blimit%5D=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data?.[0]?.iataCode || null;
    } catch (error) {
      console.error('Airport code lookup error:', error);
      // Fallback to local database search
      const localResults = searchAirports(cityName);
      return localResults.length > 0 ? localResults[0].code : null;
      return null;
    }
  }

  async getCityCode(cityName: string): Promise<string | null> {
    try {
      // First try our local database
      const localResults = searchAirports(cityName);
      if (localResults.length > 0) {
        return localResults[0].code;
      }
      
      // If not found locally, try Amadeus API
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.config.baseUrl}/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(cityName)}&page%5Blimit%5D=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data?.[0]?.iataCode || null;
    } catch (error) {
      console.error('City code lookup error:', error);
      // Fallback to local database search
      const localResults = searchAirports(cityName);
      return localResults.length > 0 ? localResults[0].code : null;
      return null;
    }
  }

  // Format flight duration from ISO 8601 to readable format
  formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return isoDuration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // Format price with currency
  formatPrice(price: string, currency: string): string {
    const amount = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}