export const logger = {
  error: (message: string): void => {
    console.error(message);
  },

  warn: (message: string): void => {
    console.warn(message);
  },

  info: (message: string): void => {
    console.info(message);
  },

  debug: (message: string): void => {
    console.debug(message);
  },
};
