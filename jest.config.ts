module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'test',
  testEnvironment: 'node',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageReporters:
    process.env.CI === 'true'
      ? ['text-summary', 'cobertura']
      : ['lcov'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '\.dto\.(t|j)s'],
  coverageDirectory: '../coverage',
  "transformIgnorePatterns": [
    "node_modules/(?!(ethr-revocation-list)/)"
  ]
};
