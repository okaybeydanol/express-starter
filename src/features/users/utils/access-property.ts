/**
 * Safely accesses a property from an object with type safety and V8 optimization.
 * Avoids prototype pollution by using Object.hasOwnProperty.call before access.
 *
 * @param obj - The source object
 * @param key - The property key to access
 * @returns The property value or undefined if not found or not an own property
 *
 * O(1) property access with V8 inline caching optimization
 */
export const getTypedProperty = <T, K extends keyof T>(obj: T, key: K): unknown =>
  // O(1) security check - only access own properties, not from prototype chain
  Object.prototype.hasOwnProperty.call(obj, key as string) ? obj[key as keyof T] : undefined;
