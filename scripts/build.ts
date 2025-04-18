// External Dependencies
import { resolve } from 'node:path';

// Sibling Directory Imports
import { safeArrayAccess } from './utils/array-utils';
import { createPathService } from './utils/path-service';

const pathService = createPathService();

try {
  // Read TypeScript config with robust error handling
  const tsConfigPath = resolve('./tsconfig.json');
  const tsConfigContent = pathService.readFileSync(tsConfigPath);

  // Parse with explicit error catching
  const tsConfig = JSON.parse(tsConfigContent);

  if (!tsConfig.compilerOptions?.paths) {
    throw new Error('No path aliases found in tsconfig.json');
  }

  // Create imports mapping with defensive programming
  const imports = Object.entries(tsConfig.compilerOptions.paths).reduce<Record<string, string>>(
    (acc, [key, pathValues]) => {
      if (!key || !pathValues) return acc;

      const alias = key.replace('/*', '');
      const path =
        Array.isArray(pathValues) && pathValues.length > 0
          ? String(safeArrayAccess(pathValues, 0, 0)).replace('/*', '')
          : null;

      if (!path) return acc;

      // Create optimized V8-friendly string paths
      acc[`${alias}/*`] = `./dist/${path}/*.js`;
      return acc;
    },
    {}
  );

  // Read and update package.json with validation
  const packageJsonPath = resolve('./package.json');
  const packageJsonContent = pathService.readFileSync(packageJsonPath);
  const packageJson = JSON.parse(packageJsonContent);

  packageJson.imports = imports;

  // Write with error handling
  pathService.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('✅ Successfully updated package.json with import maps');
} catch (error) {
  console.error('❌ Error in build script:', error);
  process.exit(1);
}
