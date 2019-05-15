const path = require('path')
const fs = require('fs')
const DllConfig = require('./build/dll-config.json')

/**
 * @typedef {'development' | 'production'} Mode  webpack 预置环境
 * @typedef {'umd' | 'cjs'} Name dll 的名称
 */

/**
 * 获取 webpack resolve.alias 配置
 * @param {Mode} mode
 * @param {Name} name
 */
function getAlias(mode, name) {
  const packages = DllConfig[name]
  if (!packages) throw new Error(`dll key not exists, only supports ${Object.keys(DllConfig).join(', ')}`)

  const umd = {
    'react': ['umd/react.development', 'umd/react.production.min'],
    'react-dom': ['umd/react-dom.development', 'umd/react-dom.production.min'],
    'react-router': ['umd/react-router', 'umd/react-router.min'],
    'react-router-dom': ['umd/react-router-dom', 'umd/react-router-dom.min'],
    'react-transition-group': ['dist/react-transition-group', 'dist/react-transition-group.min'],
  }

  const all = {
    'antd': mode === 'development' ? require.resolve('antd/dist/antd.js') : require.resolve('antd/dist/antd.min.js'),
    'react': require.resolve('react/index'),
    'react-dom': require.resolve('react-dom/index'),
    'react-router': require.resolve('react-router/index'),
    'react-router-dom': require.resolve('react-router-dom/index'),
    'react-transition-group': require.resolve('react-transition-group/cjs/index'),
  }

  if (name.includes('umd')) {
    Object.entries(umd).forEach(([key, value]) => {
      all[key] = require.resolve(`${key}/${value[mode === 'development' ? 0 : 1]}`)
    })
  }

  return packages.reduce((res, key) => {
    if (!all[key]) throw new Error(`internal error, need config alias`)
    res[key + '$'] = all[key]
    return res
  }, {})
}

/**
 * 获取 webpack resolve.alias 配置和其它相关信息
 * @param {Mode} mode
 * @param {Name} name
 */
function getConfig(mode, name) {
  const outDir = path.join(__dirname, 'dll')
  const base = `${name}.${mode}`
  const entryFile = path.join(outDir, `dll.${base}.js`)
  const manifestFile = path.join(outDir, `manifest.${base}.json`)
  const depsFile = path.join(outDir, `deps.${base}.json`)
  return {
    version: require('./package.json').version,
    entryFile,
    manifestFile,
    depsFile,

    /** webpack resolve.alias 的配置项 */
    alias: getAlias(mode, name),
    /** 检查当前指定的 node_modules 中的依赖是否和 dll 中的依赖一致 */
    checkDependencies(nodeModulesDir) {
      return checkDependencies(nodeModulesDir, mode, name)
    }
  }
}

/**
 * 检查当前的依赖是否和 dll 中的依赖一致
 * @param {string} nodeModulesDir
 * @param {Mode} mode
 * @param {Name} name
 * @returns {({name: string, dllVersion: string, localVersion: string})[]} 返回所有不一致的 package 名称
 */
function checkDependencies(nodeModulesDir, mode, name) {
  /** @type {{[key: string]: {version: string, files: string[]}}} */
  const depsJson = require(getConfig(mode, name).depsFile)
  const warnings = []

  Object.keys(depsJson).forEach(pkgName => {
    const pkgVersion = depsJson[pkgName].version
    const pkgJsonFile = path.join(nodeModulesDir, ...pkgName.split('/'), 'package.json')

    if (fs.existsSync(pkgJsonFile)) {
      const pkg = require(pkgJsonFile)
      if (pkg.version !== pkgVersion) warnings.push({
        name: pkgName,
        dllVersion: pkgVersion,
        localVersion: pkg.version
      })
    }
  })

  return warnings
}


module.exports = getConfig
module.exports.getAlias = getAlias
