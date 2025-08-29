// Comprehensive airport codes database
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  continent: string;
}

export const airports: Airport[] = [
  // North America - Major Cities
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', continent: 'North America' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States', continent: 'North America' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'New York', country: 'United States', continent: 'North America' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', continent: 'North America' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'United States', continent: 'North America' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', continent: 'North America' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States', continent: 'North America' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', continent: 'North America' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', continent: 'North America' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', continent: 'North America' },
  { code: 'LAS', name: 'McCarran International', city: 'Las Vegas', country: 'United States', continent: 'North America' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States', continent: 'North America' },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'United States', continent: 'North America' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', continent: 'North America' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'United States', continent: 'North America' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', continent: 'North America' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', continent: 'North America' },
  { code: 'YUL', name: 'Montreal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada', continent: 'North America' },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', continent: 'North America' },

  // Europe - Major Cities
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', continent: 'Europe' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', continent: 'Europe' },
  { code: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom', continent: 'Europe' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', continent: 'Europe' },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France', continent: 'Europe' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', continent: 'Europe' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', continent: 'Europe' },
  { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', continent: 'Europe' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', continent: 'Europe' },
  { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', continent: 'Europe' },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', continent: 'Europe' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', continent: 'Europe' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', continent: 'Europe' },
  { code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy', continent: 'Europe' },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', continent: 'Europe' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', continent: 'Europe' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', continent: 'Europe' },
  { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', continent: 'Europe' },
  { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway', continent: 'Europe' },
  { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland', continent: 'Europe' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', continent: 'Europe' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', continent: 'Europe' },
  { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal', continent: 'Europe' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', continent: 'Europe' },
  { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', continent: 'Europe' },
  { code: 'KEF', name: 'Keflavik International Airport', city: 'Reykjavik', country: 'Iceland', continent: 'Europe' },

  // Asia - Major Cities
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', continent: 'Asia' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', continent: 'Asia' },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', continent: 'Asia' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', continent: 'Asia' },
  { code: 'GMP', name: 'Gimpo Airport', city: 'Seoul', country: 'South Korea', continent: 'Asia' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', continent: 'Asia' },
  { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', country: 'China', continent: 'Asia' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', continent: 'Asia' },
  { code: 'SHA', name: 'Shanghai Hongqiao International Airport', city: 'Shanghai', country: 'China', continent: 'Asia' },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', continent: 'Asia' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', continent: 'Asia' },
  { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', continent: 'Asia' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', continent: 'Asia' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', continent: 'Asia' },
  { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', continent: 'Asia' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia' },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', continent: 'Asia' },
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', continent: 'Asia' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', continent: 'Asia' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', continent: 'Asia' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', continent: 'Asia' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', continent: 'Asia' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', continent: 'Asia' },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', continent: 'Asia' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', continent: 'Asia' },

  // Africa - Major Cities
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', continent: 'Africa' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', continent: 'Africa' },
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', continent: 'Africa' },
  { code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa', continent: 'Africa' },
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', continent: 'Africa' },
  { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria', continent: 'Africa' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', continent: 'Africa' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', continent: 'Africa' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', continent: 'Africa' },
  { code: 'RAK', name: 'Marrakech Menara Airport', city: 'Marrakech', country: 'Morocco', continent: 'Africa' },
  { code: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia', continent: 'Africa' },
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria', continent: 'Africa' },

  // South America - Major Cities
  { code: 'GRU', name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', continent: 'South America' },
  { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', continent: 'South America' },
  { code: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil', continent: 'South America' },
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', continent: 'South America' },
  { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', continent: 'South America' },
  { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago', country: 'Chile', continent: 'South America' },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', continent: 'South America' },
  { code: 'CUZ', name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', country: 'Peru', continent: 'South America' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', continent: 'South America' },
  { code: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador', continent: 'South America' },
  { code: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela', continent: 'South America' },

  // Oceania - Major Cities
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', continent: 'Oceania' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', continent: 'Oceania' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', continent: 'Oceania' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', continent: 'Oceania' },
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide', country: 'Australia', continent: 'Oceania' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', continent: 'Oceania' },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', continent: 'Oceania' },
  { code: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand', continent: 'Oceania' },
  { code: 'NOU', name: 'La Tontouta International Airport', city: 'Noumea', country: 'New Caledonia', continent: 'Oceania' },
  { code: 'PPT', name: 'Faa\'a International Airport', city: 'Tahiti', country: 'French Polynesia', continent: 'Oceania' }
];

// Helper functions for airport lookups
export const getAirportByCode = (code: string): Airport | undefined => {
  return airports.find(airport => airport.code.toLowerCase() === code.toLowerCase());
};

export const getAirportsByCity = (city: string): Airport[] => {
  return airports.filter(airport => 
    airport.city.toLowerCase().includes(city.toLowerCase())
  );
};

export const getAirportsByCountry = (country: string): Airport[] => {
  return airports.filter(airport => 
    airport.country.toLowerCase().includes(country.toLowerCase())
  );
};

export const searchAirports = (query: string): Airport[] => {
  const searchTerm = query.toLowerCase();
  return airports.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results
};

export const getPopularAirports = (): Airport[] => {
  // Return most popular airports for quick selection
  const popularCodes = ['JFK', 'LAX', 'LHR', 'CDG', 'NRT', 'SIN', 'DXB', 'SYD', 'GRU', 'CPT'];
  return popularCodes.map(code => getAirportByCode(code)).filter(Boolean) as Airport[];
};

// Get airport code for a destination (enhanced version)
export const getDestinationAirportCode = (destinationName: string, country?: string): string => {
  // First try exact city match
  const cityMatches = getAirportsByCity(destinationName);
  if (cityMatches.length > 0) {
    // If country is provided, prefer airports in that country
    if (country) {
      const countryMatch = cityMatches.find(airport => 
        airport.country.toLowerCase().includes(country.toLowerCase())
      );
      if (countryMatch) return countryMatch.code;
    }
    return cityMatches[0].code;
  }

  // Try partial matches
  const partialMatches = searchAirports(destinationName);
  if (partialMatches.length > 0) {
    return partialMatches[0].code;
  }

  // Fallback to first 3 letters of destination name
  return destinationName.substring(0, 3).toUpperCase();
};