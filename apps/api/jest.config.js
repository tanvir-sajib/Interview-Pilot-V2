module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.ts', '<rootDir>/**/*.spec.js'],
  transform: { '^.+\.ts$': 'ts-jest' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
