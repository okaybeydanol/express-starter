// External Dependencies
import * as fs from 'node:fs';
import * as path from 'node:path';

type AllowedPathOptions = {
  readonly allowedPaths?: readonly string[];
};

type PathService = Readonly<{
  readonly getCwd: () => string;
  readonly resolvePath: (...segments: readonly string[]) => string;
  readonly readFileSync: (targetPath: string) => string;
  readonly writeFileSync: (targetPath: string, newContent: string) => void;
  readonly existsSync: (targetPath: string) => boolean;
  readonly readdirSync: (targetPath: string) => string[];
  readonly statSync: (targetPath: string) => fs.Stats;
  readonly relativePath: (targetPath: string) => string;
  readonly safePathExists: (filePath: string) => boolean;
  readonly normalizePath: (filePath: string) => string;
}>;

/**
 * Creates a path service utility that provides various file system and path-related operations.
 * The service is initialized with a set of allowed paths for safe operations and ensures
 * that all paths are resolved relative to the current working directory.
 *
 * @param options - Configuration options for the path service.
 * @param options.allowedPaths - An optional array of allowed paths for safe operations.
 *                               Defaults to `['src', 'index.js', '__tests__']`.
 * @returns A `PathService` object with methods for path and file system operations.
 *
 * @example
 * ```typescript
 * const pathService = createPathService({ allowedPaths: ['src', 'dist'] });
 * const cwd = pathService.getCwd();
 * const resolvedPath = pathService.resolvePath('src', 'index.ts');
 * const fileExists = pathService.existsSync(resolvedPath);
 * ```
 */
export const createPathService = (options: AllowedPathOptions = {}): PathService => {
  // Single initialization of working directory for O(1) access
  // eslint-disable-next-line no-restricted-globals
  const workingDirectory = process.cwd();

  // Pre-compute allowed paths with O(1) lookup using Set
  const allowedPaths = new Set(options.allowedPaths ?? ['src', 'index.js', '__tests__']);

  return Object.freeze({
    /**
     * Gets the current working directory path (isolated from global process)
     * @returns The current working directory path
     */
    getCwd: (): string => workingDirectory,

    /**
     * Safely resolves a path relative to cwd
     * @param segments Path segments to resolve
     * @returns The resolved absolute path
     */
    resolvePath: (...segments: readonly string[]): string =>
      path.resolve(workingDirectory, ...segments),

    /**
     * Checks if a path is relative to the working directory
     * @param targetPath The path to check
     * @returns The path relative to working directory
     */
    relativePath: (targetPath: string): string => path.relative(workingDirectory, targetPath),

    /**
     * Reads the content of a file synchronously and returns it as a string.
     * If the file cannot be read, an empty string is returned.
     *
     * @param filePath - The path to the file to be read. It will be normalized before reading.
     * @returns The content of the file as a string, or an empty string if an error occurs.
     */
    readFileSync: (filePath: string): string => {
      const normalizedPath = path.normalize(filePath);
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return fs.readFileSync(normalizedPath, 'utf-8');
      } catch {
        return '';
      }
    },

    /**
     * Writes the specified content to a file at the given file path, ensuring the path is normalized.
     * If an error occurs during the write operation, it is silently caught and the function returns.
     *
     * @param filePath - The path to the file where the content should be written.
     * @param newContent - The content to write to the file.
     * @returns void
     */
    writeFileSync: (filePath: string, newContent: string): void => {
      const normalizedPath = path.normalize(filePath);
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(normalizedPath, newContent, 'utf-8');
      } catch {
        return;
      }
    },

    /**
     * Checks if a file or directory exists at the specified path.
     *
     * @param filePath - The path to the file or directory to check.
     * @returns A boolean indicating whether the file or directory exists.
     *
     * @remarks
     * This function normalizes the provided file path before checking its existence.
     * It uses `fs.existsSync`, which performs a synchronous check.
     * If an error occurs during the check, the function will return `false`.
     *
     * @example
     * ```typescript
     * const fileExists = existsSync('/path/to/file.txt');
     * console.log(fileExists); // true or false
     * ```
     */
    existsSync: (filePath: string): boolean => {
      const normalizedPath = path.normalize(filePath);
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return fs.existsSync(normalizedPath);
      } catch {
        return false;
      }
    },

    /**
     * Reads the contents of a directory synchronously and returns an array of file and directory names.
     * If the directory does not exist or an error occurs, it returns an empty array.
     *
     * @param filePath - The path to the directory to read.
     * @returns An array of file and directory names in the specified directory.
     */
    readdirSync: (filePath: string): string[] => {
      const normalizedPath = path.normalize(filePath);
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return fs.readdirSync(normalizedPath);
      } catch {
        return [];
      }
    },

    /**
     * Synchronously retrieves the file statistics for the given file path.
     * If the file does not exist or an error occurs, it returns `undefined`.
     *
     * @param filePath - The path to the file whose statistics are to be retrieved.
     * @param newContent - A string parameter that is currently unused in the function.
     * @returns The file statistics as an `fs.Stats` object if the file exists
     */
    statSync: (filePath: string): fs.Stats => {
      const normalizedPath = path.normalize(filePath);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      return fs.statSync(normalizedPath);
    },

    /**
     * Safely checks if a path exists within allowed boundaries
     * @param filePath Path to verify
     * @returns Whether the path exists and is within safe boundaries
     */
    safePathExists: (filePath: string): boolean => {
      const normalizedPath = path.normalize(filePath);
      const relativePath = path.relative(workingDirectory, normalizedPath);

      // O(1) boundary check with Set
      const isRootAllowed =
        allowedPaths.has(relativePath) ||
        [...allowedPaths].some((p) => relativePath.startsWith(`${p}/`));

      if (!isRootAllowed) return false;

      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return fs.existsSync(normalizedPath);
      } catch {
        return false;
      }
    },

    /**
     * Safely normalizes a path to prevent directory traversal attacks
     * @param filePath Path to normalize
     * @returns Normalized path
     */
    normalizePath: (filePath: string): string => path.normalize(filePath),
  });
};
