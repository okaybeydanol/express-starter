/**
 * Represents the environment configuration keys for the application.
 * This type is designed to be immutable and provides a structured way
 * to define and access environment variables.
 */
export type EnvKeys = Readonly<{
  readonly nodeEnv: string;
  readonly port: number;
  readonly apiUrl: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
  readonly corsOrigin: string;
  readonly db: Readonly<{
    readonly url: string;
  }>;
  readonly jwt: Readonly<{
    readonly secret: string;
    readonly expiresIn: string;
    readonly refreshSecret: string;
    readonly refreshExpiresIn: string;
  }>;
  readonly logging: Readonly<{
    readonly level: 'debug' | 'error' | 'http' | 'info' | 'warn';
    readonly format: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
  }>;
  readonly rateLimit: Readonly<{
    readonly windowMs: number;
    readonly max: number;
  }>;
  readonly version: string;
}>;
