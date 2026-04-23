const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: ['dist/**', 'artifacts/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      camelcase: ['error', { properties: 'never' }],
    },
  },
  {
    files: ['tests/unit/**/*.ts'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      camelcase: ['error', { properties: 'never' }],
    },
  },
];
