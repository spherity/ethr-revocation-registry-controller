module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testEnvironment: 'node',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageReporters:
    process.env.CI === 'true'
      ? ['text-summary', 'cobertura']
      : ['lcov'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageDirectory: '../coverage',
  transformIgnorePatterns: []
};
