import { Destination } from '../types';
import { getDestinationAirportCode, getAirportsByCity, searchAirports } from '../data/airportCodes';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface FlightResult {
  id: string;
  airline: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  bookingUrl: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
}

export interface HotelResult {
  id: string;
  name: string;
  rating: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  bookingUrl: string;
}

export interface BookingProvider {
  name: string;
  logo: string;
  type: 'flights' | 'hotels' | 'packages' | 'activities';
  baseUrl: string;
}

export class BookingService {
  private static instance: BookingService;
  
  private providers: BookingProvider[] = [
    {
      name: 'Booking.com',
      logo: '🏨',
      type: 'hotels',
      baseUrl: 'https://www.booking.com'
    },
    {
      name: 'Airbnb',
      logo: '🏠',
      type: 'hotels',
      baseUrl: 'https://www.airbnb.com'
    },
    {
      name: 'Kayak',
      logo: '🛶',
      type: 'flights',
      baseUrl: 'https://www.kayak.com'
    },
    {
      name: 'Hotels.com',
      logo: '🏩',
      type: 'hotels',
      baseUrl: 'https://www.hotels.com'
    }
  ];
  
  private constructor() {}
  
  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  // Generate booking URLs for different providers
  generateFlightSearchUrl(destination: Destination, params: Partial<FlightSearchParams> = {}): Record<string, string> {
    const defaultParams = {
      origin: 'New York (JFK)', // Default with proper formatting
      destination: this.getAirportCode(destination),
      departureDate: this.getDefaultDepartureDate(),
      returnDate: this.getDefaultReturnDate(),
      adults: 1,
      cabinClass: 'economy'
    } as FlightSearchParams;

    const searchParams = { ...defaultParams, ...params };
    
    return {
      kayak: this.enhanceBookingUrl(this.buildKayakUrl(searchParams), 'kayak', 'flights'),
      google: this.enhanceBookingUrl(this.buildGoogleFlightsUrl(searchParams), 'google', 'flights'),
      skyscanner: this.enhanceBookingUrl(this.buildSkyscannerUrl(searchParams), 'skyscanner', 'flights'),
      expedia: this.enhanceBookingUrl(this.buildExpediaFlightsUrl(searchParams), 'expedia', 'flights')
    };
  }

  private buildKayakHotelsUrl(params: HotelSearchParams): string {
    const { destination, checkIn, checkOut, adults, rooms } = params;
    
    // Format dates for Kayak (YYYY-MM-DD)
    const formatDateForKayak = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const checkinDate = formatDateForKayak(checkIn);
    const checkoutDate = formatDateForKayak(checkOut);
    
    // Build Kayak hotels URL
    const searchParams = new URLSearchParams({
      checkin: checkinDate,
      checkout: checkoutDate,
      guests: adults.toString(),
      rooms: (rooms || 1).toString(),
      sort: 'rank_a' // Sort by Kayak's ranking algorithm
    });
    
    return `https://www.kayak.com/hotels/${encodeURIComponent(destination)}?${searchParams.toString()}`;
  }

  generateHotelSearchUrl(destination: Destination, params: Partial<HotelSearchParams> = {}): Record<string, string> {
    const defaultParams = {
      destination: `${destination.name}, ${destination.country}`,
      checkIn: this.getDefaultCheckIn(),
      checkOut: this.getDefaultCheckOut(),
      adults: 1,
      rooms: 1
    };

    const searchParams = { ...defaultParams, ...params };
    
    return {
      kayak: this.enhanceBookingUrl(this.buildKayakHotelsUrl(searchParams), 'kayak', 'hotels'),
      booking: this.enhanceBookingUrl(this.buildBookingComUrl(searchParams), 'booking', 'hotels'),
      hotels: this.enhanceBookingUrl(this.buildHotelsComUrl(searchParams), 'hotels', 'hotels'),
      airbnb: this.enhanceBookingUrl(this.buildAirbnbUrl(searchParams), 'airbnb', 'hotels'),
      expedia: this.enhanceBookingUrl(this.buildExpediaHotelsUrl(searchParams), 'expedia', 'hotels')
    };
  }

  generatePackageSearchUrl(destination: Destination): Record<string, string> {
    const destinationQuery = encodeURIComponent(`${destination.name}, ${destination.country}`);
    const checkinDate = this.getDefaultCheckIn();
    const checkoutDate = this.getDefaultCheckOut();
    
    const baseUrls = {
      kayak: `https://www.kayak.com/packages?destination=${destinationQuery}&checkin=${checkinDate}&checkout=${checkoutDate}&guests=1`,
      priceline: `https://www.priceline.com/packages?destination=${destinationQuery}`,
      expedia: `https://www.expedia.com/Vacation-Packages?destination=${destinationQuery}&startDate=${this.getDefaultCheckIn()}&endDate=${this.getDefaultCheckOut()}&adults=1`,
      costco: `https://www.costcotravel.com/Vacation-Packages?destination=${destinationQuery}`,
      travelocity: `https://www.travelocity.com/Packages?destination=${destinationQuery}`
    };
    
    return {
      kayak: this.enhanceBookingUrl(baseUrls.kayak, 'kayak', 'packages'),
      priceline: this.enhanceBookingUrl(baseUrls.priceline, 'priceline', 'packages'),
      expedia: this.enhanceBookingUrl(baseUrls.expedia, 'expedia', 'packages'),
      costco: this.enhanceBookingUrl(baseUrls.costco, 'costco', 'packages'),
      travelocity: this.enhanceBookingUrl(baseUrls.travelocity, 'travelocity', 'packages')
    };
  }

  generateActivitySearchUrl(destination: Destination): Record<string, string> {
    const destinationQuery = encodeURIComponent(`${destination.name}, ${destination.country}`);
    
    return {
      tripadvisor: `https://www.tripadvisor.com/Attractions?geo=${destinationQuery}`,
      viator: `https://www.viator.com/searchResults/all?text=${destinationQuery}`
    };
  }

  // Helper methods for building URLs
  private buildKayakUrl(params: FlightSearchParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;
    const originCode = this.extractAirportCode(origin);
    const destCode = this.extractAirportCode(destination);
    
    // Format dates for Kayak (YYYY-MM-DD)
    const formatDateForKayak = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const depDate = formatDateForKayak(departureDate);
    const retDate = returnDate ? formatDateForKayak(returnDate) : '';
    
    // Build Kayak URL with proper parameters
    let kayakUrl = `https://www.kayak.com/flights/${originCode}-${destCode}/${depDate}`;
    
    if (returnDate) {
      kayakUrl += `/${retDate}`;
    }
    
    // Add search parameters
    const searchParams = new URLSearchParams({
      sort: 'bestflight_a',
      passengers: adults.toString(),
      cabin: params.cabinClass === 'business' ? 'b' : 
             params.cabinClass === 'first' ? 'f' : 
             params.cabinClass === 'premium_economy' ? 'p' : 'e'
    });
    
    return `${kayakUrl}?${searchParams.toString()}`;
  }


  private buildGoogleFlightsUrl(params: FlightSearchParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;
    return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${departureDate}${returnDate ? `%20return%20${returnDate}` : ''}%20for%20${adults}%20adult`;
  }

  private buildSkyscannerUrl(params: FlightSearchParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;
    const originCode = this.extractAirportCode(origin);
    const destCode = this.extractAirportCode(destination);
    
    // Format dates for Skyscanner (YYMMDD)
    const formatDateForSkyscanner = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}${month}${day}`;
    };
    
    const depDate = formatDateForSkyscanner(departureDate);
    const retDate = returnDate ? formatDateForSkyscanner(returnDate) : '';
    
    return `https://www.skyscanner.com/transport/flights/${originCode}/${destCode}/${depDate}${retDate ? `/${retDate}` : ''}/?adults=${adults}&children=0&adultsv2=${adults}&childrenv2=&infants=0&cabinclass=economy&rtn=${returnDate ? '1' : '0'}`;
  }

  private buildExpediaFlightsUrl(params: FlightSearchParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;
    const originCode = this.extractAirportCode(origin);
    const destCode = this.extractAirportCode(destination);
    
    // Format dates for Expedia (MM/DD/YYYY)
    const formatDateForExpedia = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    const depDate = encodeURIComponent(formatDateForExpedia(departureDate));
    const retDate = returnDate ? encodeURIComponent(formatDateForExpedia(returnDate)) : '';
    
    if (returnDate) {
      return `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from%3A${originCode}%2Cto%3A${destCode}%2Cdeparture%3A${depDate}&leg2=from%3A${destCode}%2Cto%3A${originCode}%2Cdeparture%3A${retDate}&passengers=adults%3A${adults}%2Cchildren%3A0%2Cseniors%3A0%2Cinfantinlap%3AY&options=cabinclass%3Aeconomy&mode=search`;
    } else {
      return `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from%3A${originCode}%2Cto%3A${destCode}%2Cdeparture%3A${depDate}&passengers=adults%3A${adults}%2Cchildren%3A0%2Cseniors%3A0%2Cinfantinlap%3AY&options=cabinclass%3Aeconomy&mode=search`;
    }
  }

  private buildExpediaHotelsUrl(params: HotelSearchParams): string {
    const { destination, checkIn, checkOut, adults, rooms } = params;
    
    // Format dates for Expedia (MM/DD/YYYY)
    const formatDateForExpedia = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    const checkinDate = encodeURIComponent(formatDateForExpedia(checkIn));
    const checkoutDate = encodeURIComponent(formatDateForExpedia(checkOut));
    
    return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${checkinDate}&endDate=${checkoutDate}&rooms=${rooms}&adults=${adults}&sort=recommended&theme=&userIntent=&semdtl=&semcid=`;
  }

  // Dynamic URL construction based on real-time form data
  buildDynamicBookingURL(
    platform: string, 
    destination: Destination, 
    formData: {
      origin?: string;
      departureDate?: string;
      returnDate?: string;
      adults?: number;
      children?: number;
      cabinClass?: string;
      checkIn?: string;
      checkOut?: string;
      rooms?: number;
    }
  ): string {
    const destinationCode = this.getAirportCode(destination);
    const originCode = formData.origin ? this.extractAirportCode(formData.origin) : 'NYC';
    
    switch (platform) {
      case 'kayak-flights':
        return this.buildDynamicKayakFlights(originCode, destinationCode, formData);
      case 'google-flights':
        return this.buildDynamicGoogleFlights(originCode, destination, formData);
      case 'expedia-flights':
        return this.buildDynamicExpediaFlights(originCode, destinationCode, formData);
      case 'skyscanner-flights':
        return this.buildDynamicSkyscannerFlights(originCode, destinationCode, formData);
      case 'kayak-hotels':
        return this.buildDynamicKayakHotels(destination, formData);
      case 'booking-hotels':
        return this.buildDynamicBookingHotels(destination, formData);
      case 'expedia-hotels':
        return this.buildDynamicExpediaHotels(destination, formData);
      case 'airbnb-hotels':
        return this.buildDynamicAirbnbHotels(destination, formData);
      default:
        return '#';
    }
  }

  private buildDynamicKayakFlights(origin: string, destination: string, formData: any): string {
    const depDate = this.formatDateForKayak(formData.departureDate || this.getDefaultDepartureDate());
    const retDate = formData.returnDate ? this.formatDateForKayak(formData.returnDate) : '';
    
    let url = `https://www.kayak.com/flights/${origin}-${destination}/${depDate}`;
    if (retDate) url += `/${retDate}`;
    
    const params = new URLSearchParams({
      sort: 'bestflight_a',
      passengers: (formData.adults || 1).toString(),
      cabin: this.getCabinCodeForKayak(formData.cabinClass || 'economy')
    });
    
    return this.addTrackingParams(`${url}?${params}`, 'kayak', 'flights');
  }

  private buildDynamicGoogleFlights(origin: string, destination: Destination, formData: any): string {
    const originName = formData.origin || 'New York';
    const depDate = formData.departureDate || this.getDefaultDepartureDate();
    const adults = formData.adults || 1;
    const returnPart = formData.returnDate ? `%20return%20${formData.returnDate}` : '';
    
    const url = `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(originName)}%20to%20${encodeURIComponent(destination.name)}%20on%20${depDate}${returnPart}%20for%20${adults}%20adult${adults > 1 ? 's' : ''}`;
    return this.addTrackingParams(url, 'google', 'flights');
  }

  private buildDynamicExpediaFlights(origin: string, destination: string, formData: any): string {
    const depDate = encodeURIComponent(this.formatDateForExpedia(formData.departureDate || this.getDefaultDepartureDate()));
    const adults = formData.adults || 1;
    const children = formData.children || 0;
    const cabinClass = formData.cabinClass || 'economy';
    
    if (formData.returnDate) {
      const retDate = encodeURIComponent(this.formatDateForExpedia(formData.returnDate));
      const url = `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from%3A${origin}%2Cto%3A${destination}%2Cdeparture%3A${depDate}&leg2=from%3A${destination}%2Cto%3A${origin}%2Cdeparture%3A${retDate}&passengers=adults%3A${adults}%2Cchildren%3A${children}%2Cseniors%3A0%2Cinfantinlap%3AY&options=cabinclass%3A${cabinClass}&mode=search`;
      return this.addTrackingParams(url, 'expedia', 'flights');
    } else {
      const url = `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from%3A${origin}%2Cto%3A${destination}%2Cdeparture%3A${depDate}&passengers=adults%3A${adults}%2Cchildren%3A${children}%2Cseniors%3A0%2Cinfantinlap%3AY&options=cabinclass%3A${cabinClass}&mode=search`;
      return this.addTrackingParams(url, 'expedia', 'flights');
    }
  }

  private buildDynamicSkyscannerFlights(origin: string, destination: string, formData: any): string {
    const depDate = this.formatDateForSkyscanner(formData.departureDate || this.getDefaultDepartureDate());
    const retDate = formData.returnDate ? this.formatDateForSkyscanner(formData.returnDate) : '';
    const adults = formData.adults || 1;
    
    const url = `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${depDate}${retDate ? `/${retDate}` : ''}/?adults=${adults}&children=0&adultsv2=${adults}&childrenv2=&infants=0&cabinclass=${formData.cabinClass || 'economy'}&rtn=${formData.returnDate ? '1' : '0'}`;
    return this.addTrackingParams(url, 'skyscanner', 'flights');
  }

  private buildDynamicKayakHotels(destination: Destination, formData: any): string {
    const checkIn = this.formatDateForKayak(formData.checkIn || this.getDefaultCheckIn());
    const checkOut = this.formatDateForKayak(formData.checkOut || this.getDefaultCheckOut());
    const adults = formData.adults || 1;
    const rooms = formData.rooms || 1;
    
    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      guests: adults.toString(),
      rooms: rooms.toString(),
      sort: 'rank_a'
    });
    
    const url = `https://www.kayak.com/hotels/${encodeURIComponent(`${destination.name}, ${destination.country}`)}?${params}`;
    return this.addTrackingParams(url, 'kayak', 'hotels');
  }

  private buildDynamicBookingHotels(destination: Destination, formData: any): string {
    const checkIn = formData.checkIn || this.getDefaultCheckIn();
    const checkOut = formData.checkOut || this.getDefaultCheckOut();
    const adults = formData.adults || 1;
    const rooms = formData.rooms || 1;
    
    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${destination.name}, ${destination.country}`)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=${rooms}&selected_currency=USD`;
    return this.addTrackingParams(url, 'booking', 'hotels');
  }

  private buildDynamicExpediaHotels(destination: Destination, formData: any): string {
    const checkIn = encodeURIComponent(this.formatDateForExpedia(formData.checkIn || this.getDefaultCheckIn()));
    const checkOut = encodeURIComponent(this.formatDateForExpedia(formData.checkOut || this.getDefaultCheckOut()));
    const adults = formData.adults || 1;
    const rooms = formData.rooms || 1;
    
    const url = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(`${destination.name}, ${destination.country}`)}&startDate=${checkIn}&endDate=${checkOut}&rooms=${rooms}&adults=${adults}&sort=recommended&theme=&userIntent=&semdtl=&semcid=`;
    return this.addTrackingParams(url, 'expedia', 'hotels');
  }

  private buildDynamicAirbnbHotels(destination: Destination, formData: any): string {
    const checkIn = formData.checkIn || this.getDefaultCheckIn();
    const checkOut = formData.checkOut || this.getDefaultCheckOut();
    const adults = formData.adults || 1;
    
    const url = `https://www.airbnb.com/s/${encodeURIComponent(`${destination.name}, ${destination.country}`)}/homes?checkin=${checkIn}&checkout=${checkOut}&adults=${adults}&source=structured_search_input_header&search_type=autocomplete_click`;
    return this.addTrackingParams(url, 'airbnb', 'hotels');
  }

  // Helper methods for date formatting
  private formatDateForKayak(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForExpedia(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private formatDateForSkyscanner(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private getCabinCodeForKayak(cabinClass: string): string {
    switch (cabinClass) {
      case 'business': return 'b';
      case 'first': return 'f';
      case 'premium_economy': return 'p';
      default: return 'e';
    }
  }

  // Helper method to extract airport code from formatted string
  private extractAirportCode(airportString: string): string {
    const match = airportString.match(/\(([A-Z]{3})\)/);
    if (match) {
      return match[1];
    }
    // If no code in parentheses, try to find it in our database
    const airports = searchAirports(airportString);
    return airports.length > 0 ? airports[0].code : airportString.substring(0, 3).toUpperCase();
  }

  // Enhanced URL validation and tracking
  private addTrackingParams(url: string, provider: string, type: 'flights' | 'hotels' | 'packages'): string {
    const trackingParams = new URLSearchParams();
    
    // Add UTM parameters for analytics
    trackingParams.set('utm_source', 'wanderlist');
    trackingParams.set('utm_medium', 'referral');
    trackingParams.set('utm_campaign', `${type}_booking`);
    trackingParams.set('utm_content', provider);
    trackingParams.set('utm_term', 'dynamic_search');
    
    // Add timestamp for tracking
    trackingParams.set('ref_time', Date.now().toString());
    
    // Add session identifier for conversion tracking
    trackingParams.set('session_id', this.generateSessionId());
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${trackingParams.toString()}`;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Validate and enhance booking URLs
  private enhanceBookingUrl(url: string, provider: string, type: 'flights' | 'hotels' | 'packages'): string {
    try {
      // Validate URL format
      new URL(url);
      
      // Add tracking parameters
      return this.addTrackingParams(url, provider, type);
    } catch (error) {
      console.error(`Invalid URL for ${provider}:`, url);
      return url; // Return original URL if validation fails
    }
  }
  private buildBookingComUrl(params: HotelSearchParams): string {
    const { destination, checkIn, checkOut, adults, rooms } = params;
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=${rooms}`;
  }


  private buildHotelsComUrl(params: HotelSearchParams): string {
    const { destination, checkIn, checkOut, adults, rooms } = params;
    return `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(destination)}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=${rooms}&q-room-0-adults=${adults}`;
  }

  private buildAirbnbUrl(params: HotelSearchParams): string {
    const { destination, checkIn, checkOut, adults } = params;
    return `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes?checkin=${checkIn}&checkout=${checkOut}&adults=${adults}`;
  }

  // Utility methods
  private getAirportCode(destination: Destination): string {
    return getDestinationAirportCode(destination.name, destination.country);
  }

  private getDefaultDepartureDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split('T')[0];
  }

  private getDefaultReturnDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 37); // 7 days after departure
    return date.toISOString().split('T')[0];
  }

  private getDefaultCheckIn(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  private getDefaultCheckOut(): string {
    const date = new Date();
    date.setDate(date.getDate() + 33); // 3 nights
    return date.toISOString().split('T')[0];
  }

  getProviders(): BookingProvider[] {
    return this.providers;
  }

  getProvidersByType(type: BookingProvider['type']): BookingProvider[] {
    return this.providers.filter(provider => provider.type === type);
  }
}