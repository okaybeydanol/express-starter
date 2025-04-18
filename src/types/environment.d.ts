declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly PORT: string;
      readonly API_URL: string;
      readonly CORS_ORIGIN: string;

      readonly DATABASE_URL: string;

      readonly JWT_SECRET: string;
      readonly JWT_EXPIRES_IN: string;
      readonly REFRESH_TOKEN_SECRET: string;
      readonly REFRESH_TOKEN_EXPIRES_IN: string;

      readonly LOG_LEVEL: 'debug' | 'error' | 'http' | 'info' | 'warn';
      readonly LOG_FORMAT: 'combined' | 'common' | 'dev' | 'short' | 'tiny';

      readonly RATE_LIMIT_WINDOW_MS: string;
      readonly RATE_LIMIT_MAX: string;
    }
  }
}

export {};
