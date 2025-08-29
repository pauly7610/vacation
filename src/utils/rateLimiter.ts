// Client-side rate limiter for additional protection
interface ClientRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  storageKey: string;
}

interface RateLimitEntry {
  requests: number[];
  windowStart: number;
}

export class ClientRateLimiter {
  private config: ClientRateLimitConfig;

  constructor(config: ClientRateLimitConfig) {
    this.config = config;
  }

  isAllowed(): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const stored = this.getStoredData();
    
    // Clean expired requests
    const validRequests = stored.requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    // Check if under limit
    if (validRequests.length < this.config.maxRequests) {
      validRequests.push(now);
      this.setStoredData({
        requests: validRequests,
        windowStart: validRequests[0] || now
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - validRequests.length,
        resetTime: (validRequests[0] || now) + this.config.windowMs
      };
    }

    // Rate limit exceeded
    const oldestRequest = Math.min(...validRequests);
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestRequest + this.config.windowMs
    };
  }

  private getStoredData(): RateLimitEntry {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          requests: parsed.requests || [],
          windowStart: parsed.windowStart || Date.now()
        };
      }
    } catch (error) {
      console.warn('Error reading rate limit data:', error);
    }
    
    return { requests: [], windowStart: Date.now() };
  }

  private setStoredData(data: RateLimitEntry): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error storing rate limit data:', error);
    }
  }

  getRemainingTime(): number {
    const stored = this.getStoredData();
    if (stored.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...stored.requests);
    const resetTime = oldestRequest + this.config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

// Pre-configured rate limiters for different use cases
export const mapRequestLimiter = new ClientRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  storageKey: 'wanderlist-map-requests'
});

export const destinationRequestLimiter = new ClientRateLimiter({
  maxRequests: 30,
  windowMs: 60000, // 1 minute  
  storageKey: 'wanderlist-destination-requests'
});