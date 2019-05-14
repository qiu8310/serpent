const fs = require('fs')
const getConfig = require('../../get-config')

module.exports = class CollectDllDependencies {

  constructor(mode, name) {
    this.mode = mode
    this.name = name
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CollectDllDependencies', (compilation) => {
      const config = getConfig(this.mode, this.name)
      const map = require(config.manifestFile).content
      fs.writeFileSync(
        config.depsFile,
        JSON.stringify(getDllDependencies(map), null, 2)
      )
    })
  }
}

function getDllDependencies(map) {
  const result = {}
  Object.keys(map).forEach(key => {
    const prefix = './node_modules/'
    if (!key.startsWith(prefix)) return
    key = key.substr(prefix.length)
    const parts = key.split('/')
    const pkgName = key.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
    const pkgFile = key.substr(pkgName.length + 1)

    if (!result[pkgName]) {
      result[pkgName] = {
        version: require(pkgName + '/package.json').version,
        files: []
      }
    }
    result[pkgName].files.push(pkgFile)
  })
  return result
}
