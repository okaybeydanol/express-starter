// Type Imports
import type { Request } from 'express';

/**
 * Creates consistent request objects with V8 optimized shapes
 * Maintains hidden class stability for JIT optimization
 *
 * @param headers - Optional headers to include in the request
 * @returns Type-safe Express Request object with consistent hidden class
 */
export const createMockReq = (headers: Record<string, string> = {}) => {
  // Create request with consistent shape for V8 monomorphic optimization
  const requestObj = {
    headers: { 'x-request-id': 'test-id', ...headers },
    cookies: {},
    signedCookies: {},
    get: (name: string) => headers[name.toLowerCase()] || null,
    header: (name: string) => headers[name.toLowerCase()] || null,
    params: {},
    query: {},
    body: {},
    path: '',
    method: 'GET',
    originalUrl: '',
    baseUrl: '',
  } as unknown as Request;

  return requestObj;
};

// Alias for backward compatibility - but encourage using createMockReq directly
export const createRequest = createMockReq;
