module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  modulePathIgnorePatterns: ['<rootDir>/frontend/.next/'],
  testTimeout: 600000 // In-memory DB can take several minutes to download/start the first time
};
