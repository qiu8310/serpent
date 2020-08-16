import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import type { RollupOptions, OutputOptions } from 'rollup'
import path from 'path'

export { resolve, commonjs, json, typescript, terser }

export function customTerser(...args: Parameters<typeof terser>) {
  return terser({
    ie8: false,
    format: {
      comments: false,
    },
    compress: {
      booleans: true,
      if_return: true,
      sequences: true,
      unused: true,
      conditionals: true,
      dead_code: true,
      drop_debugger: true,
      drop_console: true,
    },
  })
}

export function getPlugins(
  options: {
    replace?: Parameters<typeof replace>[0]
    resolve?: Parameters<typeof resolve>[0]
    commonjs?: Parameters<typeof commonjs>[0]
    json?: Parameters<typeof json>[0]
    typescript?: Parameters<typeof typescript>[0]
    terser?: Parameters<typeof terser>[0]
  } = {}
) {
  const normal = [
    replace(options.replace),
    resolve(options.resolve),
    commonjs(options.commonjs),
    json(options.json),
    typescript(options.typescript),
  ]
  return {
    normalPlugins: normal,
    minifyPlugins: [...normal, customTerser(options.terser)],
  }
}

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
  external?: string[]

  outputDir?: string
  /** 是否生成压缩版本 */
  minify?: boolean
  /** 指定要生成的格式 */
  formats?: ({ format: 'cjs' | 'es'; file?: string } | { format: 'iife' | 'umd'; name?: string; file?: string })[]
  normalPlugins?: any[]
  minifyPlugins?: any[]
  pluginOptions?: Parameters<typeof getPlugins>[0]
}): RollupOptions[] {
  const plugins = getPlugins(options.pluginOptions)
  const {
    pkg,
    entry,
    name,
    external = Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies }),
    outputDir = 'dist',
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
      const output: OutputOptions[] = formats.map(ft => ({
        name,
        ...ft,
        file: ft.file ? ft.file.replace(/\.\w+$/, ext) : path.join(outputDir, `${baseName}.${ft.format}${ext}`),
      }))
      return output
    }

    if (formatsWithoutExternal.length) {
      result.push({
        input: entry,
        output: getOutput(formatsWithoutExternal),
        plugins,
      })
    }
    if (formatsWithExternal.length) {
      result.push({
        input: entry,
        output: getOutput(formatsWithExternal),
        plugins,
        external,
      })
    }
  })

  return result
}

function getBaseName(name: string) {
  return path.basename(name, path.extname(name))
}
