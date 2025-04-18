/**
 * Safely accesses an element in an array at the specified index.
 * If the index is out of bounds, a default value is returned.
 *
 * @template T - The type of elements in the array.
 * @param array - The array to access.
 * @param index - The index of the element to retrieve.
 * @param defaultValue - The value to return if the index is out of bounds.
 * @returns The element at the specified index, or the default value if the index is invalid.
 */
export const safeArrayAccess = <T>(array: readonly T[], index: number, defaultValue: T): T => {
  if (index >= 0 && index < array.length) {
    return array[index as number] as T;
  }
  return defaultValue;
};
