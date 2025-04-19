import { createPathService } from './../utils/path-service';
import { ImportGroup, ParseImports, Stats } from '../utils/types';
import path from 'path';
import { logger } from '../utils/logger';
import { safeArrayAccess } from '../utils/array-utils';

// ANSI Color Codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Import Group Configuration
const importGroupConfig: readonly ImportGroup[] = [
  {
    key: 'builtin',
    title: '// Node.js Core Modules',
    pattern:
      /^(node:|fs|path|os|util|stream|crypto|http|https|events|buffer|querystring|url|zlib|assert|child_process|cluster|dgram|dns|domain|net|readline|repl|tls|tty|v8|vm|worker_threads|node:os|node:path)$/,
  },
  {
    key: 'express',
    title: '// Express & Middleware',
    pattern:
      /^(express|cors|helmet|body-parser|compression|cookie-parser|express-validator|express-session|multer|passport|morgan|connect-redis|express-rate-limit|hpp)$/,
  },
  {
    key: 'prisma',
    title: '// Prisma & DB',
    pattern:
      /^(@prisma|@databases|pg|pg-connection-string|prisma|@prisma\/client|typeorm|knex|mysql|mongodb|mongoose|redis)$/,
  },
  {
    key: 'external',
    title: '// External Dependencies',
    pattern: /^(?!#|node:|express$|@prisma)([@a-z][\w-/]+)$/,
  },
  {
    key: 'app',
    title: '// Application Core',
    pattern: /^#(app|server|bootstrap)$/,
  },
  {
    key: 'api',
    title: '// API & Routes',
    pattern: /^#(api)(?:\/|$)/,
  },
  {
    key: 'config',
    title: '// Configuration',
    pattern: /^#(config)(?:\/|$)/,
  },
  {
    key: 'constant',
    title: '// Constants',
    pattern: /^#(constants)(?:\/|$)/,
  },
  {
    key: 'features',
    title: '// Features',
    pattern: /^#features(?:\/|$)/,
  },
  {
    key: 'infrastructure',
    title: '// Infrastructure & External Services',
    pattern: /^#(infrastructure)(?:\/|$)/,
  },
  {
    key: 'shared',
    title: '// Shared Modules',
    pattern: /^#(shared|decorators|errors|interceptors|middleware|validators|models)(?:\/|$)/,
  },
  {
    key: 'utils',
    title: '// Utilities',
    pattern: /^#(utils)(?:\/|$)/,
  },
  {
    key: 'parent',
    title: '// Parent Directory Imports',
    pattern: /^\.\./,
  },
  {
    key: 'sibling',
    title: '// Sibling Directory Imports',
    pattern: /^\.\/(?!index)/,
  },
  {
    key: 'index',
    title: '// Index Imports',
    pattern: /^(\.\/)?index/,
  },
  {
    key: 'type-imports',
    title: '// Type Imports',
    pattern: /^(import type)/,
  },
];

/**
 * An instance of the path service created using the `createPathService` function.
 * This service responsible for handling operations related to file or directory paths.
 */
const pathService = createPathService();

// Statistics object for better reporting
let stats: Stats = {
  processedFiles: 0,
  skippedFiles: 0,
  modifiedFiles: 0,
  errors: 0,
  startTime: null,
  endTime: null,
};

/**
 * Print a formatted section header
 * @param {string} message - The message to display
 */
const printSection = (message: string): void => {
  logger.info(`\n${colors.blue}${colors.bright}=== ${message} ===${colors.reset}`);
};

/**
 * Print a success message
 * @param {string} message - The message to display
 */
const printSuccess = (message: string): void => {
  logger.info(`${colors.green}✓ ${message}${colors.reset}`);
};

/**
 * Print a warning message
 * @param {string} message - The message to display
 */
const printWarning = (message: string): void => {
  logger.info(`${colors.yellow}⚠️ ${message}${colors.reset}`);
};

/**
 * Print an error message
 * @param {string} message - The message to display
 */
const printError = (message: string): void => {
  logger.error(`${colors.red}✗ ${message}${colors.reset}`);
  stats = { ...stats, errors: stats.errors + 1 };
};

/**
 * Print a info message
 * @param {string} message - The message to display
 */
const printInfo = (message: string): void => {
  logger.info(`${colors.cyan}ℹ ${message}${colors.reset}`);
};

/**
 * Clean previous header comments from content
 * @param {string} content - The file content
 * @returns {string} - Cleaned content
 */
const cleanPreviousHeaders = (content: string): string => {
  // Convert header patterns to regex pattern-safe strings
  const headerPatterns = importGroupConfig.map((group) => group.title);

  let cleanedContent = content;
  for (const pattern of headerPatterns) {
    cleanedContent = cleanedContent.split(pattern).join('');
  }

  return cleanedContent;
};

/**
 * Determine the import type based on import path
 * @param {string} importPath - The import path
 * @returns {string} - The import type
 */

const importTypeCache = new Map<string, string>();
const determineImportType = (importPath: string): string => {
  // Önce önbellekte ara - O(1) erişim
  if (importTypeCache.has(importPath)) {
    return importTypeCache.get(importPath)!;
  }

  // Önbellekte yoksa hesapla
  for (const group of importGroupConfig) {
    if (group.pattern.test(importPath)) {
      importTypeCache.set(importPath, group.key);
      return group.key;
    }
  }

  importTypeCache.set(importPath, 'external');
  return 'external';
};

/**
 * Check if a file should be processed based on its extension
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file should be processed
 */
const shouldProcessFile = (filePath: string): boolean => {
  const fileExtension = path.extname(filePath).toLowerCase();
  const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  return validExtensions.includes(fileExtension);
};

/**
 * Sort imports in a file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was modified
 */
const sortImports = (filePath: string): boolean => {
  try {
    const content = pathService.readFileSync(filePath);
    const cleanedContent = cleanPreviousHeaders(content);

    const hasDeclarationModule = content.includes('declare module');
    if (hasDeclarationModule) {
      return false;
    }

    const lines = cleanedContent.split('\n');

    const importLines: string[] = [];
    const codeLines: string[] = [];
    let consecutiveEmptyLines = 0;

    // Extract import statements
    for (let i = 0; i < lines.length; i++) {
      const line = safeArrayAccess(lines, i, '').trim();

      if (line === '') {
        if (consecutiveEmptyLines < 2 && codeLines.length > 0) {
          codeLines.push(safeArrayAccess(lines, i, ''));
          consecutiveEmptyLines++;
        }
        continue;
      }

      consecutiveEmptyLines = 0;

      if (line.startsWith('import ') || (line.startsWith('export ') && line.includes(' from '))) {
        let fullImport = safeArrayAccess(lines, i, '');
        let j = i + 1;

        while (j < lines.length && !fullImport.includes(';')) {
          fullImport += '\n' + lines[j];
          j++;
        }

        importLines.push(fullImport);
        i = j - 1;
      } else {
        codeLines.push(safeArrayAccess(lines, i, ''));
      }
    }

    if (importLines.length === 0) {
      printWarning(`No imports found in ${filePath}`);
      stats = { ...stats, skippedFiles: stats.skippedFiles + 1 };
      return false;
    }

    // Parse imports
    const parsedImports: ParseImports[] = [];
    for (const importLine of importLines) {
      let importPath = '';
      let isTypeImport = importLine.trim().startsWith('import type');

      const fromMatch = importLine.match(/from\s+['"](.+?)['"]/);
      if (fromMatch && safeArrayAccess(fromMatch, 1, '')) {
        importPath = safeArrayAccess(fromMatch, 1, '');
      } else {
        const directMatch = importLine.match(/import\s+['"]([^'"]+)['"]/);
        if (directMatch && safeArrayAccess(directMatch, 1, '')) {
          importPath = safeArrayAccess(directMatch, 1, '');
        }
      }

      if (!importPath) {
        continue;
      }

      const importType = isTypeImport ? 'type-imports' : determineImportType(importPath);

      parsedImports.push({
        statement: importLine,
        path: importPath,
        type: importType,
        sortValue: importPath.toLowerCase(),
      });
    }

    // Group imports
    const importGroups: Record<string, ParseImports[]> = {};
    importGroupConfig.forEach((group) => {
      importGroups[group.key] = parsedImports.filter((imp) => imp.type === group.key);
    });

    // Sort Node.js first within builtin group
    if (importGroups.builtin && importGroups.builtin.length > 0) {
      importGroups.builtin.sort((a, b) => {
        // Core modules prioritization logic
        const coreModules = new Set(['fs', 'path', 'http', 'https', 'crypto', 'stream', 'events']);
        const aIsCore = coreModules.has(a.path.replace('node:', ''));
        const bIsCore = coreModules.has(b.path.replace('node:', ''));

        if (aIsCore && !bIsCore) return -1;
        if (!aIsCore && bIsCore) return 1;

        // Alphabetic sort for the rest
        return a.sortValue.localeCompare(b.sortValue);
      });
    }

    // Sort other groups alphabetically
    importGroupConfig
      .filter((group) => group.key !== 'builtin')
      .forEach((group) => {
        if (importGroups[group.key] && importGroups[group.key].length > 0) {
          importGroups[group.key].sort((a, b) => a.sortValue.localeCompare(b.sortValue));
        }
      });

    // Build import sections
    const importSections: string[] = [];

    for (const group of importGroupConfig) {
      const imports = importGroups[group.key] || [];

      if (imports.length === 0) {
        continue;
      }

      importSections.push(group.title);
      for (const imp of imports) {
        importSections.push(imp.statement);
      }

      const nextGroups = importGroupConfig
        .slice(importGroupConfig.findIndex((g) => g.key === group.key) + 1)
        .filter((g) => importGroups[g.key] && importGroups[g.key].length > 0);

      if (nextGroups.length > 0) {
        importSections.push('');
      }
    }

    // Clean and format code
    let cleanCode = codeLines.join('\n').trim();
    cleanCode = cleanCode.replace(/\n{3,}/g, '\n\n'); // 3+ boş satırı 2'ye indir

    let newContent = '';
    if (importSections.length > 0 && cleanCode) {
      newContent = importSections.join('\n') + '\n\n' + cleanCode;
    } else if (importSections.length > 0) {
      newContent = importSections.join('\n');
    } else {
      newContent = cleanCode;
    }

    // Ensure exactly one final newline
    if (!newContent.endsWith('\n')) {
      newContent = newContent + '\n';
    } else {
      // Fazla boş satırları temizle
      newContent = newContent.replace(/\n+$/, '\n');
    }

    // Only write if content has changed
    if (content !== newContent) {
      pathService.writeFileSync(filePath, newContent);
      stats = { ...stats, modifiedFiles: stats.modifiedFiles + 1 };
      printSuccess(`Imports organized: ${path.relative(pathService.getCwd(), filePath)}`);
      return true;
    } else {
      printInfo(`No changes needed: ${path.relative(pathService.getCwd(), filePath)}`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      printError(`Error processing ${filePath}: ${error.message}`);
    } else {
      printError(`Error processing ${filePath}: Unknown error`);
    }
    return false;
  }
};

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was processed successfully
 */
const processSingleFile = (filePath: string): boolean => {
  if (!pathService.existsSync(filePath)) {
    printError(`File not found: ${filePath}`);
    return false;
  }

  if (!shouldProcessFile(filePath)) {
    printWarning(`Skipped unsupported file type: ${filePath}`);
    stats = { ...stats, skippedFiles: stats.skippedFiles + 1 };
    return false;
  }

  try {
    stats = { ...stats, processedFiles: stats.processedFiles + 1 };
    return sortImports(filePath);
  } catch (error) {
    if (error instanceof Error) {
      printError(`Error processing ${filePath}: ${error.message}`);
    } else {
      printError(`Error processing ${filePath}: Unknown error`);
    }
    return false;
  }
};

/**
 * Process all files in a directory recursively
 * @param {string} dirPath - Path to the directory
 * @returns {number} - Number of processed files
 */
const walkDir = (dirPath: string): number => {
  try {
    if (!pathService.existsSync(dirPath)) {
      printError(`Directory not found: ${dirPath}`);
      return 0;
    }

    let processedCount = 0;
    const files = pathService.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      try {
        const stat = pathService.statSync(fullPath);

        if (stat.isDirectory()) {
          processedCount += walkDir(fullPath);
        } else if (shouldProcessFile(fullPath)) {
          if (sortImports(fullPath)) {
            processedCount++;
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          printError(`Error accessing ${fullPath}: ${error.message}`);
        } else {
          printError(`Error accessing ${fullPath}: Unknown error`);
        }
      }
    }

    return processedCount;
  } catch (error) {
    if (error instanceof Error) {
      printError(`Directory scan error ${dirPath}: ${error.message}`);
    } else {
      printError(`Directory scan error ${dirPath}: Unknown error`);
    }
    return 0;
  }
};

/**
 * Prints a summary of the execution statistics, including execution time,
 * number of files processed, modified, skipped, and errors encountered.
 *
 * The function calculates the execution duration based on the start and end times,
 * logs the summary details to the console, and returns the number of errors encountered.
 *
 * @returns {number} - Returns the number of errors encountered during execution.
 *                     If no errors occurred, returns 0.
 */
const printSummary = (): number => {
  stats = { ...stats, endTime: new Date() };

  const duration = (Number(stats.endTime) - Number(stats.startTime)) / 1000;

  printSection('Summary');
  logger.info(
    `${colors.cyan}Execution time: ${colors.white}${duration.toFixed(2)}s${colors.reset}`
  );
  logger.info(
    `${colors.cyan}Files processed: ${colors.white}${stats.processedFiles}${colors.reset}`
  );
  logger.info(`${colors.cyan}Files modified: ${colors.white}${stats.modifiedFiles}${colors.reset}`);
  logger.info(`${colors.cyan}Files skipped: ${colors.white}${stats.skippedFiles}${colors.reset}`);
  logger.info(`${colors.cyan}Errors encountered: ${colors.white}${stats.errors}${colors.reset}`);

  if (stats.errors > 0) {
    logger.info(`\n${colors.yellow}⚠️  Completed with ${stats.errors} errors${colors.reset}`);
    return stats.errors;
  } else {
    logger.info(`\n${colors.green}✓ Successfully completed${colors.reset}`);
    return 0;
  }
};

/**
 * The main function serves as the entry point for the import organizer script.
 * It processes command-line arguments to validate and organize imports within
 * specified files or directories. The function ensures that only valid paths
 * within the 'src' directory, `index.js`, or `__tests__` are processed.
 *
 * @returns {number} - Returns `0` on successful execution, or `1` if an error
 * occurs or invalid arguments are provided.
 *
 * @throws {Error} - Catches and logs any unhandled errors during execution.
 *
 * Functionality:
 * - Validates command-line arguments to ensure they point to valid files or directories.
 * - Processes each valid path by either walking through directories or handling individual files.
 * - Logs errors for invalid paths or missing targets.
 * - Prints a summary of the operation upon completion.
 */
const main = (): number => {
  stats = { ...stats, startTime: new Date() };
  printSection('Import Sorter');

  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      return args.length === 0 ? 1 : 0;
    }

    // Process each path argument
    for (const arg of args) {
      const targetPath = path.resolve(arg);

      if (pathService.existsSync(targetPath)) {
        const stat = pathService.statSync(targetPath);

        if (stat.isDirectory()) {
          printInfo(`Processing directory: ${arg}`);
          walkDir(targetPath);
        } else if (stat.isFile()) {
          printInfo(`Processing file: ${arg}`);
          processSingleFile(targetPath);
        }
      } else {
        printError(`Target not found: ${arg}`);
      }
    }

    return printSummary();
  } catch (error) {
    if (error instanceof Error) {
      printError(`Unhandled error: ${error.message}`);
    } else {
      printError(`Unhandled error: Unknown error`);
    }
    return 1;
  }
};

// Run the script if called directly
if (import.meta.url.startsWith('file://') && import.meta.url === `file://${process.argv[1]}`) {
  const exitCode = main() !== 0 ? main() : 0;
  if (exitCode !== 0) {
    throw new Error(`Script exited with code ${exitCode}`);
  }
}
