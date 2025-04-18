export default {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'tsx scripts/deployment/import-organizer.ts src/',
    () => 'tsc-files --noEmit',
  ],
  '*.{json,md}': ['prettier --write'],
};
