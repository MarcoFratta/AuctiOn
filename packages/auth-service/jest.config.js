module.exports = {
  // The root directory for Jest to scan for tests
  rootDir: '.',

  // A list of glob patterns for the test files
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Transform TypeScript files using ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      isolatedModules: true,
    }],
  },

  // Set up testing environment for Node.js (for backend projects)
  testEnvironment: 'node',

  // Enable a coverage collection (useful for testing code coverage)
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}', // Collect coverage from all source files
    '!src/**/*.d.ts', // Exclude TypeScript definition files
    '!**/node_modules/**',
    '!**/dist/**',
  ],

  // Specify where to output coverage reports
  coverageDirectory: 'coverage',

  // Clear mock calls and timers between each test
  clearMocks: true,

  // Automatically reset mock state between tests
  resetMocks: true,

  // Automatically restore mock state between tests
  restoreMocks: true,

  // Watch for file changes and run tests when files are modified
  watchPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Timeout for each test (default is 5000ms)
  testTimeout: 60000, // Set timeout to 60 seconds

  // If using Babel or custom transformers
  // transformIgnorePatterns: ['node_modules/'],

  // Setup files before each test (like global mocks)
  //setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // Path to setup file (e.g., jest.setup.js)

  // Handle global setup/teardown for Jest
  //globalSetup: './jest.globalSetup.js',
  //globalTeardown: './jest.globalTeardown.js',

  // Enabling Jest to handle async stack traces
  verbose: true,
}
