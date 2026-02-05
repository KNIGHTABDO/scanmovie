/**
 * Input Validation & Sanitization Utilities
 * ==========================================
 * Provides functions to validate and sanitize user inputs
 * to prevent XSS attacks and ensure data integrity
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * and HTML tags
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * Sanitize search query input
 * Allows basic characters needed for movie searches
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  // Allow alphanumeric, spaces, common punctuation for movie titles
  // Remove anything that could be used for injection
  const sanitized = query
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,!?'":()&]/gi, '') // Allow common movie title characters
    .trim();
  
  // Limit length to prevent abuse
  return sanitized.slice(0, 200);
}

/**
 * Sanitize AI prompt input
 * More restrictive to prevent prompt injection
 */
export function sanitizeAIPrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  
  // Remove HTML and script tags
  let sanitized = prompt.replace(/<[^>]*>/g, '');
  
  // Remove potential prompt injection patterns
  sanitized = sanitized
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/ignore previous/gi, '')
    .replace(/disregard all/gi, '')
    .replace(/forget everything/gi, '');
  
  // Limit length
  return sanitized.trim().slice(0, 500);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = parseFloat(input);
  
  if (isNaN(num)) return null;
  
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

/**
 * Validate rating value
 */
export function validateRating(rating: any): number | null {
  const sanitized = sanitizeNumber(rating, 0, 10);
  if (sanitized === null) return null;
  
  // Round to 1 decimal place
  return Math.round(sanitized * 10) / 10;
}

/**
 * Rate limiter for API calls
 * Returns true if the action should be allowed, false if rate limited
 */
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  
  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  
  // Check if limit exceeded
  if (validTimestamps.length >= maxRequests) {
    return false;
  }
  
  // Add current timestamp
  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);
  
  return true;
}

/**
 * Debounce function to limit how often a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), waitMs);
  };
}

/**
 * Throttle function to ensure a function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number = 1000
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastRun >= limitMs) {
      func.apply(this, args);
      lastRun = now;
    }
  };
}

/**
 * Validate environment variable is set
 */
export function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Check all required environment variables on startup
 */
export function validateEnvironment(isBrowser: boolean = false): void {
  // Only validate in browser context
  if (!isBrowser) return;
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.error('Please check your .env file and ensure all required variables are set.');
    
    // In development, throw error. In production, just log
    if (import.meta.env.DEV) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env file.'
      );
    }
  }
}
