import { Destination, Filters } from '../types';
import { destinations } from '../data/destinations';

export class DestinationService {
  private static instance: DestinationService;
  private rejectedDestinations: Set<string> = new Set();
  
  private constructor() {}
  
  static getInstance(): DestinationService {
    if (!DestinationService.instance) {
      DestinationService.instance = new DestinationService();
    }
    return DestinationService.instance;
  }
  
  getAllDestinations(): Destination[] {
    return destinations;
  }
  
  getRandomDestination(filters?: Partial<Filters>, rejectedIds?: string[]): Destination {
    const filteredDestinations = this.filterDestinations(filters, rejectedIds);
    
    if (filteredDestinations.length === 0) {
      // If no destinations match filters, return a random one from all destinations
      const randomIndex = Math.floor(Math.random() * destinations.length);
      return destinations[randomIndex];
    }
    
    const randomIndex = Math.floor(Math.random() * filteredDestinations.length);
    return filteredDestinations[randomIndex];
  }
  
  filterDestinations(filters?: Partial<Filters>, rejectedIds?: string[]): Destination[] {
    let filteredDestinations = destinations;
    
    // Filter out rejected destinations
    if (rejectedIds && rejectedIds.length > 0) {
      filteredDestinations = filteredDestinations.filter(d => !rejectedIds.includes(d.id));
    }
    
    if (!filters) return filteredDestinations;
    
    return filteredDestinations.filter(destination => {
      // Continent filter
      if (filters.continents && filters.continents.length > 0) {
        if (!filters.continents.includes(destination.continent)) return false;
      }
      
      // Excluded countries filter
      if (filters.excludedCountries && filters.excludedCountries.length > 0) {
        if (filters.excludedCountries.includes(destination.country)) return false;
      }
      
      // Budget filter
      if (filters.budgetRange) {
        const [minBudget, maxBudget] = filters.budgetRange;
        // Check if destination budget range overlaps with filter range
        if (minBudget > 0 && destination.dailyBudget.max < minBudget) return false;
        if (maxBudget > 0 && destination.dailyBudget.min > maxBudget) {
          return false;
        }
      }
      
      // Cost level filter
      if (filters.costLevel && filters.costLevel.length > 0) {
        if (!filters.costLevel.includes(destination.costLevel)) return false;
      }
      
      // Climate filter
      if (filters.climate && filters.climate.length > 0) {
        if (!filters.climate.includes(destination.climate)) return false;
      }
      
      // Activities filter
      if (filters.activities && filters.activities.length > 0) {
        const hasMatchingActivity = filters.activities.some(activity => 
          destination.activities.includes(activity)
        );
        if (!hasMatchingActivity) return false;
      }
      
      // Safety rating filter
      if (filters.safetyMin !== undefined) {
        if (destination.safetyRating < filters.safetyMin) return false;
      }
      
      // Visa requirement filter
      if (typeof filters.visaRequired === 'boolean') {
        if (destination.visaRequired !== filters.visaRequired) return false;
      }
      
      // Season preference filter
      if (filters.seasonPreference && filters.seasonPreference.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const hasMatchingSeason = filters.seasonPreference.some(season => {
          if (season === 'current') {
            return destination.bestMonths.includes(currentMonth);
          }
          const seasonMonths = {
            spring: [3, 4, 5],
            summer: [6, 7, 8],
            fall: [9, 10, 11],
            winter: [12, 1, 2]
          };
          const months = seasonMonths[season as keyof typeof seasonMonths] || [];
          return months.some(month => destination.bestMonths.includes(month));
        });
        if (!hasMatchingSeason) return false;
      }
      
      // Travel style filter
      if (filters.travelStyle && filters.travelStyle.length > 0) {
        const hasMatchingStyle = filters.travelStyle.some(style => {
          // Check if destination activities match the travel style
          switch (style) {
            case 'kid-friendly':
              return destination.activities.some(activity => 
                ['beaches', 'theme parks', 'zoos', 'aquariums', 'family attractions', 'museums', 'parks'].includes(activity.toLowerCase())
              ) && destination.safetyRating >= 7;
            
            case 'family-friendly':
              return destination.activities.some(activity => 
                ['beaches', 'sightseeing', 'cultural tours', 'museums', 'parks', 'family attractions', 'theme parks'].includes(activity.toLowerCase())
              ) && destination.safetyRating >= 6 && destination.dailyBudget.max <= 300;
            
            case 'solo-trip':
              return destination.activities.some(activity => 
                ['backpacking', 'hiking', 'cultural tours', 'museums', 'nightlife', 'street food', 'photography', 'adventure sports'].includes(activity.toLowerCase())
              ) && destination.safetyRating >= 6;
            
            case 'couple-trip':
              return destination.activities.some(activity => 
                ['romantic dining', 'beaches', 'spas', 'wine tasting', 'sunset views', 'luxury resorts', 'cultural tours', 'fine dining'].includes(activity.toLowerCase())
              ) || destination.climate === 'tropical' || destination.climate === 'mediterranean';
            
            default:
              return true;
          }
        });
        if (!hasMatchingStyle) return false;
      }
      
      return true;
    });
  }
  
  getContinents(): string[] {
    return [...new Set(destinations.map(d => d.continent))];
  }
  
  getCountries(): string[] {
    return [...new Set(destinations.map(d => d.country))];
  }
  
  getActivities(): string[] {
    const allActivities = destinations.flatMap(d => d.activities);
    return [...new Set(allActivities)];
  }
  
  getDestinationById(id: string): Destination | undefined {
    return destinations.find(d => d.id === id);
  }
  
  getFilteredCount(filters?: Partial<Filters>, rejectedIds?: string[]): number {
    return this.filterDestinations(filters, rejectedIds).length;
  }

  // Get smart filtered destinations with fallback logic
  getSmartFilteredDestinations(filters?: Partial<Filters>, rejectedIds?: string[]): Destination[] {
    // Always use exact filtering - no smart expansion that confuses users
    return this.filterDestinations(filters, rejectedIds);
  }

  // Get count for each filter option to show availability
  getFilterOptionCounts(currentFilters?: Partial<Filters>, rejectedIds?: string[]): {
    continents: Record<string, number>;
    climates: Record<string, number>;
    costLevels: Record<string, number>;
    activities: Record<string, number>;
    travelStyles: Record<string, number>;
  } {
    const baseDestinations = this.filterDestinations(
      { ...currentFilters, continents: undefined, climate: undefined, costLevel: undefined, activities: undefined, travelStyle: undefined },
      rejectedIds
    );

    return {
      continents: this.getContinents().reduce((acc, continent) => {
        acc[continent] = baseDestinations.filter(d => d.continent === continent).length;
        return acc;
      }, {} as Record<string, number>),
      
      climates: ['tropical', 'temperate', 'cold', 'desert', 'mediterranean'].reduce((acc, climate) => {
        acc[climate] = baseDestinations.filter(d => d.climate === climate).length;
        return acc;
      }, {} as Record<string, number>),
      
      costLevels: ['budget', 'mid-range', 'luxury'].reduce((acc, level) => {
        acc[level] = baseDestinations.filter(d => d.costLevel === level).length;
        return acc;
      }, {} as Record<string, number>),
      
      activities: this.getActivities().reduce((acc, activity) => {
        acc[activity] = baseDestinations.filter(d => d.activities.includes(activity)).length;
        return acc;
      }, {} as Record<string, number>),
      
      travelStyles: {
        'kid-friendly': baseDestinations.filter(d => 
          d.activities.some(activity => 
            ['beaches', 'theme parks', 'zoos', 'aquariums', 'family attractions', 'museums', 'parks'].includes(activity.toLowerCase())
          ) && d.safetyRating >= 7
        ).length,
        'family-friendly': baseDestinations.filter(d => 
          d.activities.some(activity => 
            ['beaches', 'sightseeing', 'cultural tours', 'museums', 'parks', 'family attractions', 'theme parks'].includes(activity.toLowerCase())
          ) && d.safetyRating >= 6 && d.dailyBudget.max <= 300
        ).length,
        'solo-trip': baseDestinations.filter(d => 
          d.activities.some(activity => 
            ['backpacking', 'hiking', 'cultural tours', 'museums', 'nightlife', 'street food', 'photography', 'adventure sports'].includes(activity.toLowerCase())
          ) && d.safetyRating >= 6
        ).length,
        'couple-trip': baseDestinations.filter(d => 
          d.activities.some(activity => 
            ['romantic dining', 'beaches', 'spas', 'wine tasting', 'sunset views', 'luxury resorts', 'cultural tours', 'fine dining'].includes(activity.toLowerCase())
          ) || d.climate === 'tropical' || d.climate === 'mediterranean'
        ).length
      }
    };
  }
}