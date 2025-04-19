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
