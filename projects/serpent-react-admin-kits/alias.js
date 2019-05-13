const DllConfig = require('./build/dll-config.json')
/**
 * webpack resolve.alias 配置
 * @param {'development' | 'production'} mode
 * @param {string} dllKey
 */
function getAlias(mode, dllKey) {

  const packages = DllConfig[dllKey]
  if (!packages) throw new Error(`dll key not exists, only supports ${Object.keys(DllConfig).join(', ')}`)

  const all = {
    'antd$': mode === 'development' ? require.resolve('antd/dist/antd.js') : require.resolve('antd/dist/antd.min.js'),
    'react$': require.resolve('react/index'),
    'react-dom$': require.resolve('react-dom/index'),
    'react-router$': require.resolve('react-router/index'),
    'react-router-dom$': require.resolve('react-router-dom/index'),
    'react-transition-group$': require.resolve('react-transition-group/cjs/index'),
  }

  return packages.reduce((res, name) => {
    const key = name + '$'
    res[key] = all[key]
    if (!res[key]) throw new Error(`internal error, need config alias`)
    return res
  }, {})
}

module.exports = getAlias
