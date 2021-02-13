import fs from 'fs'
import path from 'path'
import exists from 'mora-scripts/libs/fs/exists'
import { getPlugins, getExternal, getRootDir, RollupOptions } from './base'

export function makeLib(options: Omit<RollupOptions, 'input'> & { modules?: Record<string, string> } = {}) {
  const { modules, ...rest } = options
  const rootDir = getRootDir()
  const srcDir = path.join(rootDir, 'src')
  const pkg = require(path.join(rootDir, 'package.json'))

  let input =
    modules ||
    fs.readdirSync(srcDir).reduce((res, k) => {
      if (k.endsWith('.ts')) {
        res[k.replace(/\.ts$/, '')] = path.join(srcDir, k)
      } else if (exists(path.join(srcDir, k, 'index.ts'))) {
        res[k] = path.join(srcDir, k, 'index.ts')
      }
      return res
    }, {} as any)

  const file = (...parts: string[]) => path.join(rootDir, ...parts)

  const { normalPlugins } = getPlugins({
    typescript: {
      declaration: true,
      emitDeclarationOnly: true,
      module: 'ESNext',
      outDir: file('lib', 'es'),
    },
  })

  const config: RollupOptions = {
    input,
    plugins: [
      ...normalPlugins,
      // 生成 .d.ts 入口文件
      {
        name: 'generate-d.ts',
        renderStart(output, input) {
          const keys = Object.keys(input.input)
          keys.forEach(key => {
            this.emitFile({
              type: 'asset',
              fileName: key + '.d.ts',
              source: `export * from "./es/${key}";\n`,
            })
          })
        },
      },
    ],
    external: getExternal(pkg),
    output: {
      format: 'es',
      dir: file('lib'),
      entryFileNames: '[name].js',
    },
    ...rest,
  }

  return config
}
