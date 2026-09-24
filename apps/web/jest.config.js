/**
 * Jest configuration for the Next.js web app.
 * Uses babel-jest to transpile TypeScript/TSX files (including JSX) and jsdom environment.
 */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    // Use Babel to handle both .ts and .tsx files, enabling JSX transformation.
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-typescript', '@babel/preset-react'] }],
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // No need for ts-jest globals anymore.
};
