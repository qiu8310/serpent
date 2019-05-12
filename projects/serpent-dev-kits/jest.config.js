/* eslint "@typescript-eslint/no-var-requires": "off", @typescript-eslint/no-triple-slash-reference: "off" */
// @ts-check
/// <reference path='./node_modules/@types/jest/index.d.ts' />

const findup = require('mora-scripts/libs/fs/findup')
const path = require('path')
const devKitsRootDir = path.resolve(__dirname)

const rootDir = (function() {
  try {
    return path.dirname(findup.pkg())
  } catch (e) {
    return '<rootDir>'
  }
})()

/** @type {Partial<jest.DefaultOptions>} */
const config = {
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
        pathRegex: /\.(spec|test)\.tsx?$/
      }
    }
  },
  rootDir: rootDir,
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*\\.(test|spec))\\.(ts|tsx)$',
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest')
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],

  // 在 webpack 中使用
  // https://jestjs.io/docs/en/webpack
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      devKitsRootDir + '/res/fileMock.js',
    '\\.(css|less|scss|sass)$': devKitsRootDir + '/res/styleMock.js'
  },

  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'html', 'lcov'],
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

module.exports = config
