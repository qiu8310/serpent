import type { RollupOptions, OutputOptions } from 'rollup'
import path from 'path'
import { getPlugins, getExternal, builtins } from './base'

/*
  format: amd, cjs, es, iife, umd, system
  amd – Asynchronous Module Definition, used with module loaders like RequireJS
  cjs – CommonJS, suitable for Node and other bundlers (alias: commonjs)
  iife – A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
  umd – Universal Module Definition, works as amd, cjs and iife all in one
  es – Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers (alias: esm, module)
  system – Native format of the SystemJS loader (alias: systemjs)
 */
export function make(options: {
  /** 项目的 package.json 内容 */
  pkg: any
  /** 入口文件 */
  entry: string
  /** 如果要生成 iife 或 umd 格式版本时，需要指定此变量，用于表示要暴露在全局的变量名称 */
  name?: string

  /** 自定义 external 模块 */
  external?: RollupOptions['external']

  outputDir?: string
  /**
   * 是否会生成多个文件，如果设置成 true: 则 output 选项会使用 dir 而不是 file
   */
  multiple?: boolean
  /** 是否生成压缩版本 */
  minify?: boolean
  /** 指定要生成的格式 */
  formats?: ({ format: 'cjs' | 'es'; file?: string } | { format: 'iife' | 'umd'; name?: string; file?: string })[]
  normalPlugins?: any[]
  minifyPlugins?: any[]
  pluginOptions?: Parameters<typeof getPlugins>[0]
  handleOutput?: (output: OutputOptions) => OutputOptions
}): RollupOptions[] {
  const plugins = getPlugins(options.pluginOptions)
  const {
    pkg,
    entry,
    name,
    external,
    outputDir = 'dist',
    multiple,
    minify,
    formats = [],
    normalPlugins = plugins.normalPlugins,
    minifyPlugins = plugins.minifyPlugins,
  } = options
  const baseName = getBaseName(entry)

  if (!formats.length) {
    if (pkg.main) formats.push({ format: 'cjs', file: pkg.main })
    if (pkg.module) formats.push({ format: 'es', file: pkg.module })
    if (pkg.browser) formats.push({ format: 'umd', file: pkg.browser, name })
  }

  const result: RollupOptions[] = []

  const requireNameFormats = ['umd', 'iife']
  const configs = [{ ext: '.js', plugins: normalPlugins }]
  if (minify) configs.push({ ext: '.min.js', plugins: minifyPlugins })

  configs.forEach(({ ext, plugins }) => {
    const formatsWithoutExternal = formats.filter(f => requireNameFormats.includes(f.format))
    const formatsWithExternal = formats.filter(f => !requireNameFormats.includes(f.format))

    const getOutput = (formats: typeof formatsWithoutExternal) => {
      return formats.map(ft => {
        let output: OutputOptions = {
          name,
          ...ft,
          dir: multiple ? outputDir : undefined,
          file: multiple
            ? undefined
            : ft.file
            ? ft.file.replace(/\.\w+$/, ext)
            : path.join(outputDir, `${baseName}.${ft.format}${ext}`),
        }
        if (options.handleOutput) output = options.handleOutput(output)
        return output
      })
    }

    if (formatsWithoutExternal.length) {
      result.push({
        input: entry,
        output: getOutput(formatsWithoutExternal),
        plugins,
        external: [...builtins],
      })
    }
    if (formatsWithExternal.length) {
      result.push({
        input: entry,
        output: getOutput(formatsWithExternal),
        plugins,
        external: external || getExternal(pkg),
      })
    }
  })

  return result
}

function getBaseName(name: string) {
  return path.basename(name, path.extname(name))
}
