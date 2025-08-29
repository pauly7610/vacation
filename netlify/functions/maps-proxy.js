// Simple in-memory rate limiter for Netlify Functions
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 10 requests per minute by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove expired requests
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    // Check if under limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      this.requests.set(identifier, validRequests);
      return {
        allowed: true,
        remaining: this.maxRequests - validRequests.length,
        resetTime: now + this.windowMs
      };
    }
    
    // Rate limit exceeded
    this.requests.set(identifier, validRequests);
    const oldestRequest = Math.min(...validRequests);
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestRequest + this.windowMs
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Create rate limiters with different limits
const mapRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute for maps
const strictRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute for suspicious IPs

// Helper function to get client identifier
function getClientIdentifier(event) {
  // Try to get real IP from various headers (Netlify, Cloudflare, etc.)
  const forwarded = event.headers['x-forwarded-for'];
  const realIP = event.headers['x-real-ip'];
  const cfConnectingIP = event.headers['cf-connecting-ip'];
  
  let clientIP = event.headers['client-ip'] || 
                 cfConnectingIP || 
                 realIP || 
                 (forwarded && forwarded.split(',')[0].trim()) ||
                 'unknown';

  // Add user agent for additional fingerprinting
  const userAgent = event.headers['user-agent'] || '';
  const fingerprint = `${clientIP}-${userAgent.slice(0, 50)}`;
  
  return {
    ip: clientIP,
    fingerprint: fingerprint
  };
}

// Helper function to detect suspicious patterns
function isSuspiciousRequest(event, clientInfo) {
  const userAgent = event.headers['user-agent'] || '';
  const referer = event.headers['referer'] || '';
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /node/i
  ];
  
  const isBotUA = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Check for missing or suspicious referer
  const hasValidReferer = referer.includes('netlify.app') || 
                         referer.includes('localhost') ||
                         referer.includes('127.0.0.1');
  
  // Check for rapid requests (this would need more sophisticated tracking)
  const noUserAgent = !userAgent || userAgent.length < 10;
  
  return {
    isBot: isBotUA,
    invalidReferer: !hasValidReferer && referer !== '',
    noUserAgent: noUserAgent,
    suspicious: isBotUA || noUserAgent
  };
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get client information
    const clientInfo = getClientIdentifier(event);
    const suspiciousCheck = isSuspiciousRequest(event, clientInfo);
    
    // Choose appropriate rate limiter
    const rateLimiter = suspiciousCheck.suspicious ? strictRateLimiter : mapRateLimiter;
    const rateLimit = rateLimiter.isAllowed(clientInfo.fingerprint);
    
    // Add rate limit headers
    headers['X-RateLimit-Limit'] = rateLimiter.maxRequests.toString();
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString();
    headers['X-RateLimit-Reset'] = Math.ceil(rateLimit.resetTime / 1000).toString();
    
    // Check rate limit
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for ${clientInfo.ip} (${clientInfo.fingerprint})`);
      return {
        statusCode: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
        },
        body: JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        })
      };
    }

    // Log suspicious requests for monitoring
    if (suspiciousCheck.suspicious) {
      console.log(`Suspicious request from ${clientInfo.ip}:`, {
        userAgent: event.headers['user-agent'],
        referer: event.headers['referer'],
        checks: suspiciousCheck
      });
    }

    const { lat, lng, zoom = 12, maptype = 'roadmap' } = event.queryStringParameters || {};
    
    if (!lat || !lng) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Latitude and longitude are required' })
      };
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid coordinates' })
      };
    }

    // Validate zoom level
    const zoomLevel = Math.max(1, Math.min(20, parseInt(zoom) || 12));

    // Validate maptype
    const validMapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const validatedMapType = validMapTypes.includes(maptype) ? maptype : 'roadmap';

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Maps service temporarily unavailable' })
      };
    }

    // Generate the embed URL with the secure API key
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=${validatedMapType}`;
    
    // Generate the direct Google Maps URL (no API key needed)
    const directUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    // Log successful request for monitoring
    console.log(`Map request served for ${clientInfo.ip}: ${latitude},${longitude}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        embedUrl,
        directUrl,
        coordinates: { lat: latitude, lng: longitude },
        mapType: validatedMapType,
        zoom: zoomLevel,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      })
    };

  } catch (error) {
    console.error('Maps proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};