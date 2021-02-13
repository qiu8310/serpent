import fs from 'fs'
import path from 'path'
import { getPlugins, getExternal, getRootDir, RollupOptions, getEntryMap } from './base'

export function makeCli(
  srcKeys: string[] = [],
  options: Omit<RollupOptions, 'input' | 'plugins'> & { plugins?: Parameters<typeof getPlugins>[0] } = {}
) {
  const { plugins, ...restOptions } = options
  const rootDir = getRootDir()
  const srcDir = path.join(rootDir, 'src')
  const pkg = require(path.join(rootDir, 'package.json'))

  const { npm_lifecycle_script: npmLifecycleEvent = '' } = process.env

  const enableSourceMap = npmLifecycleEvent.includes('sourcemap')

  const { normalPlugins, minifyPlugins } = getPlugins({
    run: npmLifecycleEvent.includes('watch'),
    replace: {
      __BUILD_VERSION__: pkg.version,
    },
    tsConfigPaths: true,
    typescript: {
      module: 'ESNext',
      noEmitOnError: false,
      sourceMap: enableSourceMap,
    },
    terser: {
      format: { comments: false },
      mangle: {},
      compress: { drop_console: false },
    },
    alias: {
      entries: fs.readdirSync(srcDir).map(n => {
        return {
          find: `src/${n}`,
          replacement: path.join(srcDir, n),
        }
      }),
    },
    ...plugins,
  })

  const keys = srcKeys
    .filter(key => {
      const dir = path.join(srcDir, key)
      return fs.statSync(dir).isDirectory() && fs.statSync(path.join(dir, 'index.ts')).isFile()
    })
    .map(key => 'cli-' + key)

  const config: RollupOptions = {
    input: getEntryMap(['index', 'cli', ...keys], n => {
      if (keys.includes(n)) {
        return path.join(srcDir, 'bin', n.substr(4), 'index.ts')
      } else {
        return path.join(srcDir, 'bin', n + '.ts')
      }
    }),
    plugins: enableSourceMap ? minifyPlugins : normalPlugins,
    external: getExternal(),
    output: {
      format: 'cjs',
      dir: path.join(__dirname, 'dist'),
      exports: 'auto',
    },
    ...restOptions,
  }

  return config
}
