/* eslint "@typescript-eslint/no-var-requires": "off", @typescript-eslint/no-triple-slash-reference: "off" */
// @ts-check
/// <reference path='./node_modules/@types/jest/index.d.ts' />

/** @type {Partial<jest.DefaultOptions>} */
const config = {}

/**
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
  ...require('@serpent/dev-kits/jest.config'),
  ...config,
  displayName: '@serpent/cli',
  coverageReporters: ['text', 'html', 'lcov']
}
