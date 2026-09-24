/**
 * Jest configuration for the Next.js web app.
 * Uses ts-jest to transpile TypeScript/TSX files and jsdom environment.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};
