export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  highlights: string[];
  imageUrl: string;
  climate: 'tropical' | 'temperate' | 'cold' | 'desert' | 'mediterranean';
  costLevel: 'budget' | 'mid-range' | 'luxury';
  dailyBudget: {
    min: number;
    max: number;
  };
  activities: string[];
  bestMonths: number[];
  safetyRating: number;
  visaRequired: boolean;
}

export interface Filters {
  continents: string[];
  excludedCountries: string[];
  budgetRange: [number, number];
  costLevel: string[];
  climate: string[];
  activities: string[];
  safetyMin: number;
  visaRequired: boolean;
  seasonPreference: string[];
  travelStyle: string[];
}

export interface UserPreferences {
  savedDestinations: string[];
  rejectedDestinations: string[];
  filters: Partial<Filters>;
}

export interface BookingProvider {
  name: string;
  logo: string;
  type: 'flights' | 'hotels' | 'packages' | 'activities';
  baseUrl: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
}

export interface BookingResult {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  provider: string;
  rating?: number;
  duration?: string;
  images?: string[];
  bookingUrl?: string;
  cancellationPolicy?: string;
  instantConfirmation?: boolean;
}

export interface BookingConfirmationData {
  booking: BookingResult;
  passengers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    passportNumber?: string;
  }>;
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  confirmationNumber: string;
  bookingDate: string;
  totalAmount: number;
}