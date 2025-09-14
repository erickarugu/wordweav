import { NextRequest } from "next/server";

const CSRF_SECRET =
  process.env.CSRF_SECRET || "your-csrf-secret-key-change-in-production";
const CSRF_TOKEN_LENGTH = 32;

// Generate random bytes using Web Crypto API (Edge Runtime compatible)
function generateRandomBytes(length: number): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API for Edge Runtime
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback using Math.random (less secure but edge-compatible)
    return Array.from({length: length * 2}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// Create HMAC using Web Crypto API (Edge Runtime compatible)
async function createHMAC(key: string, message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use Web Crypto API for Edge Runtime
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Simple fallback hash for environments without crypto.subtle (less secure)
    const combined = `${key}:${message}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(8).substring(0, 64);
  }
}

// Generate a CSRF token (async version)
export async function generateCSRFToken(sessionId?: string): Promise<string> {
  const timestamp = Date.now();
  const randomToken = generateRandomBytes(CSRF_TOKEN_LENGTH);
  const payload = `${randomToken}:${timestamp}:${sessionId || ""}`;

  // Create HMAC signature
  const signature = await createHMAC(CSRF_SECRET, payload);
  
  // For edge runtime compatibility, use base64 encoding without Buffer
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(`${payload}:${signature}`).toString("base64");
  } else {
    // Edge runtime compatible base64 encoding
    const fullToken = `${payload}:${signature}`;
    return btoa(fullToken);
  }
}

// Verify a CSRF token (async version)
export async function verifyCSRFToken(
  token: string,
  sessionId?: string,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<boolean> {
  if (!token) return false;

  try {
    // Decode the token
    let decoded: string;
    if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(token, "base64").toString("utf8");
    } else {
      // Edge runtime compatible base64 decoding
      decoded = atob(token);
    }

    const parts = decoded.split(":");
    if (parts.length !== 4) return false;

    const [randomToken, timestampStr, originalSessionId, receivedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check timestamp validity
    if (isNaN(timestamp) || Date.now() - timestamp > maxAge) {
      return false;
    }

    // Check session match if provided
    if (sessionId && originalSessionId !== sessionId) {
      return false;
    }

    // Verify signature
    const payload = `${randomToken}:${timestampStr}:${originalSessionId}`;
    const expectedSignature = await createHMAC(CSRF_SECRET, payload);
    
    return expectedSignature === receivedSignature;
  } catch (error) {
    console.error("CSRF token verification error:", error);
    return false;
  }
}

// Simplified synchronous token generation for immediate use (less secure but edge-compatible)
export function generateSimpleCSRFToken(): string {
  const timestamp = Date.now();
  const randomToken = generateRandomBytes(16); // Shorter for synchronous use
  return `${randomToken}:${timestamp}`;
}

// Simplified synchronous token verification
export function verifySimpleCSRFToken(
  token: string,
  maxAge: number = 24 * 60 * 60 * 1000
): boolean {
  if (!token) return false;

  try {
    const parts = token.split(":");
    if (parts.length !== 2) return false;

    const [, timestampStr] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp <= maxAge;
  } catch {
    return false;
  }
}

// Validate CSRF token from request (simplified for middleware use)
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get("x-csrf-token") || 
               request.headers.get("csrf-token") ||
               request.cookies.get("csrf-token")?.value;

  if (!token) return false;

  // Use simple token validation for synchronous middleware
  return verifySimpleCSRFToken(token);
}

// Double submit cookie pattern implementation
export async function generateDoubleSubmitToken(): Promise<string> {
  const token = generateRandomBytes(32);
  const timestamp = Date.now().toString();
  
  // Create cookie value with HMAC
  const cookieValue = await createHMAC(CSRF_SECRET, `${token}:${timestamp}`);
  
  return `${token}:${timestamp}:${cookieValue}`;
}

// Verify double submit token
export async function verifyDoubleSubmitToken(
  headerToken: string,
  cookieToken: string,
  maxAge: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return false;
  }

  try {
    const parts = cookieToken.split(":");
    if (parts.length !== 3) return false;

    const [token, timestampStr, receivedValue] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp) || Date.now() - timestamp > maxAge) {
      return false;
    }

    const expectedCookieValue = await createHMAC(CSRF_SECRET, `${token}:${timestampStr}`);
    return expectedCookieValue === receivedValue;
  } catch {
    return false;
  }
}

// CSRF protection middleware factory
export function withCSRFProtection(options: {
  skipForMethods?: string[];
  maxAge?: number;
  cookieName?: string;
} = {}) {
  const {
    skipForMethods = ["GET", "HEAD", "OPTIONS"],
    maxAge = 24 * 60 * 60 * 1000,
    cookieName = "csrf-token"
  } = options;

  return async function csrfMiddleware(request: NextRequest) {
    // Skip CSRF for safe methods
    if (skipForMethods.includes(request.method)) {
      return null;
    }

    // Check for CSRF token in header
    const headerToken = request.headers.get("x-csrf-token") || 
                       request.headers.get("csrf-token");
    
    // Check for CSRF token in cookie
    const cookieToken = request.cookies.get(cookieName)?.value;

    // For double submit pattern
    if (headerToken && cookieToken) {
      const isValid = await verifyDoubleSubmitToken(headerToken, cookieToken, maxAge);
      if (!isValid) {
        return new Response("CSRF token invalid", { status: 403 });
      }
    } else {
      return new Response("CSRF token missing", { status: 403 });
    }

    return null; // Allow request to continue
  };
}

// Utility to add CSRF token to response headers/cookies
export async function addCSRFTokenToResponse(
  response: Response,
  cookieName = "csrf-token"
): Promise<Response> {
  const token = await generateDoubleSubmitToken();
  
  // Add token to response header for client-side access
  response.headers.set("x-csrf-token", token);
  
  // Set secure cookie
  const cookieValue = `${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`;
  response.headers.set("Set-Cookie", cookieValue);
  
  return response;
}
