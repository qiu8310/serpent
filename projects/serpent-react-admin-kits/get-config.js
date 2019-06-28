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
  const r = require.resolve

  if (!packages) throw new Error(`dll key not exists, only supports ${Object.keys(DllConfig).join(', ')}`)

  const umd = {
    'react': ['umd/react.development', 'umd/react.production.min'],
    'react-dom': ['umd/react-dom.development', 'umd/react-dom.production.min'],
    'react-router': ['umd/react-router', 'umd/react-router.min'],
    'react-router-dom': ['umd/react-router-dom', 'umd/react-router-dom.min'],
    'react-transition-group': ['dist/react-transition-group', 'dist/react-transition-group.min'],
  }

  const all = {
    'lodash': r('lodash'),
    'mobx': mode === 'development' ? r('mobx/lib/mobx.js') : r('mobx/lib/mobx.min.js'),
    // 'mobx-react': mode === 'development' ? r('mobx-react/dist/index.js') : r('mobx-react/dist/index.min.js'),
    'antd': mode === 'development' ? r('antd/dist/antd.js') : r('antd/dist/antd.min.js'),
    'react': r('react/index'),
    'react-dom': r('react-dom/index'),
    'react-router': r('react-router/index'),
    'react-router-dom': r('react-router-dom/index'),
    'react-transition-group': r('react-transition-group/cjs/index'),
  }

  if (name.includes('umd')) {
    Object.entries(umd).forEach(([key, value]) => {
      all[key] = r(`${key}/${value[mode === 'development' ? 0 : 1]}`)
    })
  }

  return packages.reduce((res, key) => {
    if (!all[key]) {
      res[key + '$'] = r(key)
    } else {
      res[key + '$'] = all[key]
    }
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
    /**
     * 检查当前指定的 node_modules 中的依赖是否和 dll 中的依赖一致
     *
     * @param {string} projectDir
     * @param {boolean} strict
     *  * 严格模式会检查 dll 中的所有引用模块
     *  * 非严格模式只会检查 alias 中指定的模块及当前项目 package.json 中使用的模块
     */
    checkDependencies(projectDir, strict = false) {
      return checkDependencies(projectDir, strict, mode, name, getAlias(mode, name))
    },

    copyScriptTo(filepath) {
      mkdirp(path.dirname(filepath))
      fs.copyFileSync(entryFile, filepath)
    },

    copyStyleTo(filepath) {
      mkdirp(path.dirname(filepath))
      const style1 = fs.readFileSync(require.resolve('antd/dist/antd.min.css'))
      const style2 = fs.readFileSync(require.resolve('braft-editor/dist/index.css'))
      const style3 = fs.readFileSync(require.resolve('braft-editor/dist/output.css'))
      fs.writeFileSync(filepath, Buffer.concat([style1, style2, style3]))
    },

    init({outputDir, outputName = 'dll', checkProjectDir = '', strictCheck = false }) {
      this.copyScriptTo(path.join(outputDir, outputName + '.js'))
      this.copyStyleTo(path.join(outputDir, outputName + '.css'))
      if (checkProjectDir) {
        let result = this.checkDependencies(checkProjectDir, strictCheck)
        result.forEach(obj => {
          console.log(`\x1b[33m  warning: ${obj.name} 在 dll 中的版本是 ${obj.dllVersion} 而本地版本是 ${obj.localVersion}，请不要依赖它 \x1b[0m`)
        })
      }
    }
  }
}

/**
 * 检查当前的依赖是否和 dll 中的依赖一致
 * @param {string} projectDir
 * @param {Mode} mode
 * @param {Name} name
 * @returns {({name: string, dllVersion: string, localVersion: string})[]} 返回所有不一致的 package 名称
 */
function checkDependencies(projectDir, strict, mode, name, alias) {
  /** @type {{[key: string]: {version: string, files: string[]}}} */
  const depsJson = require(getConfig(mode, name).depsFile)
  const warnings = []
  const aliasNames = Object.keys(alias).map(k => k.replace(/\$$/, ''))

  const userPkg = require(path.join(projectDir, 'package.json'))
  const userPkgNames = Object.keys({...userPkg.devDependencies, ...userPkg.dependencies})

  Object.keys(depsJson).forEach(pkgName => {
    if (!strict && !aliasNames.includes(pkgName) && !userPkgNames.includes(pkgName)) {
      return
    }
    const pkgVersion = depsJson[pkgName].version
    const pkgJsonFile = path.join(projectDir, 'node_modules', ...pkgName.split('/'), 'package.json')

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

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    mkdirp(path.dirname(dir))
    fs.mkdirSync(dir)
  }
}

module.exports = getConfig
module.exports.getAlias = getAlias
