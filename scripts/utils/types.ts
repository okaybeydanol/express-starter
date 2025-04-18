/**
 * Creates a deeply readonly version of a type, ensuring that all nested properties
 * and sub-objects become readonly as well. Useful for enforcing immutability
 * at the type level throughout an object graph.
 *
 * This provides O(1) compile-time type safety and helps prevent mutations
 * in functional pipelines.
 *
 * @example
 * type User = {
 *   id: string;
 *   profile: {
 *     name: string;
 *     settings: {
 *       theme: string;
 *     }
 *   }
 * };
 *
 * All properties at all levels become readonly
 * type ReadonlyUser = ReadonlyDeep<User>;
 */
export type ReadonlyDeep<T> = T extends object
  ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
  : T;

/**
 * Makes all properties in T optional and readonly.
 * Useful for creating partial immutable objects.
 */
export type PartialReadonly<T> = {
  readonly [P in keyof T]?: T[P];
};

/**
 * Creates a read-only record type with keys of type K and values of type V.
 * Ensures all values are also deeply readonly.
 */
export type ReadonlyRecord<K extends number | string | symbol, V> = {
  readonly [P in K]: ReadonlyDeep<V>;
};

/**
 * Represents a parsed import statement with its metadata
 */
export interface ParseImports {
  readonly statement: string;
  readonly path: string;
  readonly type: string;
  readonly sortValue: string;
}

/**
 * Defines an import group configuration with key, title and pattern for matching imports
 */
export interface ImportGroup {
  readonly key: string;
  readonly title: string;
  readonly pattern: RegExp;
}

/**
 * Contains statistics about the import sorting operation
 */
export interface Stats {
  readonly processedFiles: number;
  readonly skippedFiles: number;
  readonly modifiedFiles: number;
  readonly errors: number;
  readonly startTime: Date | null;
  readonly endTime: Date | null;
}
