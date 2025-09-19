// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    // Let eslint-import-plugin resolve TypeScript path aliases (e.g. @/...) using tsconfig
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'],
        },
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
]);
