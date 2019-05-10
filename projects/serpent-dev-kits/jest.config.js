/* eslint "@typescript-eslint/no-var-requires": "off" */
const findup = require('mora-scripts/libs/fs/findup')
const path = require('path')

const rootDir = (function() {
  try {
    return path.dirname(findup.pkg())
  } catch (e) {
    return '<rootDir>'
  }
})()

module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
        pathRegex: /\.(spec|test)\.tsx?$/
      }
    }
  },
  roots: [rootDir + '/src'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*\\.(test|spec))\\.(ts|tsx)$',
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest')
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  collectCoverage: true,
  coverageDirectory: rootDir + '/coverage',
  coverageReporters: ['text', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageThreshold: {
    // with the following configuration jest will fail
    // if there is less than 90% branch, line, and function
    // coverage, or if there are more than 10 uncovered
    // statements:
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: -20
    }
  }
}
