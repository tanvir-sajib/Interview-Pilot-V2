module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\.spec\.ts$|.*\.test\.ts$',
  transform: { '^.+\.ts$': 'ts-jest' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
