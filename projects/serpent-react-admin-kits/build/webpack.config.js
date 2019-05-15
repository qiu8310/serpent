const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackSizePlugin = require('webpack-size-plugin').default
const CollectDllDependencies = require('./lib/collect-dll-dependencies')

const DllConfig = require('./dll-config.json')
const { getAlias } = require('../get-config')

const config = []

Object.entries(DllConfig).map(([name, packages]) => {
  config.push(
    getConfig('development', name, packages),
    getConfig('production', name, packages)
  )
})

module.exports = config

/**
 * @param {'development' | 'production'} mode
 * @param {string} name
 * @param {string[]} packages
 */
function getConfig(mode, name, packages) {
  const distDir = path.resolve(__dirname, '..', 'dll')
  const library = `__serpent_${name}`.replace(/[^\w]/g, '_')

  /** @type {import('webpack').Configuration} */
  const config = {
    entry: {
      [`${name}`]: packages
    },
    output: {
      path: distDir,
      library,
      filename: `dll.[name].${mode}.js`
    },
    mode,
    target: 'web',
    devtool: false,
    resolve: {
      alias: getAlias(mode, name),
      modules: ['node_modules'],
    },
    optimization: {
      minimize: mode === 'production',
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        })
      ]
    },
    stats: 'errors-only',
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /antd\.js/,
          loader: require.resolve('./lib/remove-antd-warn')
        }
      ]
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new CleanWebpackPlugin(),
      new WebpackSizePlugin({
        stripHash: name => name,
        jsonFile: path.resolve(__dirname, '..', 'node_modules', '.cache', `size.${name}.${mode}.json`)
      }),
      new webpack.DllPlugin({
        path: path.join(distDir, `manifest.[name].${mode}.json`),
        name: library
      }),
      new webpack.ContextReplacementPlugin(/moment\/locale$/, /zh-cn/),
      new CollectDllDependencies(mode, name)
    ]
  }
  return config
}
