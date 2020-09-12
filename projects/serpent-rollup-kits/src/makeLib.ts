import path from 'path'
import findup from 'mora-scripts/libs/fs/findup'
import { getPlugins, getExternal, RollupOptions } from './base'

export function makeLib(options: Omit<RollupOptions, 'input'> & { modules: Record<string, string> }) {
  const { modules, ...rest } = options
  const rootDir = getRootDir()
  const pkg = require(path.join(rootDir, 'package.json'))

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
    input: modules,
    plugins: [
      ...normalPlugins,
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

function getRootDir() {
  try {
    return path.dirname(findup.pkg())
  } catch (e) {
    throw new Error('定位不到项目根目录')
  }
}
