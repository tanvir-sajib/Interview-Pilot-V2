module.exports = {
  testMatch: ['<rootDir>/apps/api/test/auth.integration.spec.ts',
    '<rootDir>/apps/api/test/question-versioning.integration.spec.ts',
    '<rootDir>/apps/api/test/swagger.integration.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'apps/api/tsconfig.json',
      diagnostics: false
    }
  },
  setupFilesAfterEnv: ['<rootDir>/apps/api/jest.setup.js'],
  testEnvironment: 'node',
};
