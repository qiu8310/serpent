
/**
 * @param {import("dot-template-types").Source} source
 * @returns {import("dot-template-types").IDtplConfig}
 */
const config = function(source) {
  return {
    templates: [
      {
        name: './template/jest-test.ts.dtpl',
        matches: '**/*.test.{ts,tsx}',
        localData: {
          name: source.basicData.rawModuleName.replace(/\.test$/, '')
        }
      }
    ],
    globalData: {}
  };
}

module.exports = config
