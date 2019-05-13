const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const DllConfig = require('./dll-config.json')
const getAlias = require('../alias')

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
  const distDir = path.resolve(__dirname, '..', 'dll', mode)
  // const version = require('../package.json').version

  /** @type {import('webpack').Configuration} */
  const config = {
    entry: {
      [`${name}`]: packages
    },
    output: {
      path: distDir,
      library: name
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
    stats: {
      all: false,
      entrypoints: true,
      modules: false,
      maxModules: 6,
      publicPath: true,
      performance: true,
      timings: true,
      version: true,
      errors: true,
      errorDetails: true,
      warnings: true,
      colors: true
    },
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /antd\.js/,
          loader: require.resolve('./remove-antd-warn')
        }
      ]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new CleanWebpackPlugin(),
      new webpack.DllPlugin({
        path: path.join(distDir, `[name].json`),
        name: `[name]`
      }),
      new webpack.ContextReplacementPlugin(/moment\/locale$/, /zh-cn/),
    ]
  }
  return config
}