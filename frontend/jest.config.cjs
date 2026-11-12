module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.[jt]s?(x)'],
};
