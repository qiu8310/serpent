import path from 'path'
import findup from 'mora-scripts/libs/fs/findup'

import tsConfigPaths from 'rollup-plugin-ts-paths'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'
import run from '@rollup/plugin-run'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import builtins from 'builtin-modules'
import type { RollupOptions, OutputOptions } from 'rollup'

export interface StripParam {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  debugger?: boolean
  sourceMap?: boolean
  functions?: string[]
  labels?: string[]
}
export interface UrlParam {
  include?: string | string[]
  exclude?: string | string[]
  limit?: number
  publicPath?: string
  emitFiles?: boolean
  fileName?: string
  sourceDir?: string
  destDir?: string
}
const strip: (param?: StripParam) => any = require('@rollup/plugin-strip')
const url: (param?: UrlParam) => any = require('@rollup/plugin-url')

export { resolve, commonjs, json, typescript, terser, builtins, RollupOptions, OutputOptions }

export function customTerser(arg: Parameters<typeof terser>[0] = {}) {
  return terser({
    ie8: false,
    ...arg,
    format: {
      comments: false,
      ...arg.format,
    },
    compress:
      typeof arg.compress === 'object' || arg.compress == null
        ? {
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,
            conditionals: true,
            dead_code: true,
            drop_debugger: true,
            drop_console: true,
            ...arg.compress,
          }
        : arg.compress,
  })
}

export function getPlugins(
  options: {
    tsConfigPaths?: boolean | Parameters<typeof tsConfigPaths>[0]
    run?: boolean | Parameters<typeof run>[0]
    replace?: boolean | Parameters<typeof replace>[0]
    strip?: boolean | Parameters<typeof strip>[0]
    alias?: boolean | Parameters<typeof alias>[0]
    inject?: boolean | Parameters<typeof inject>[0]
    resolve?: boolean | Parameters<typeof resolve>[0]
    url?: boolean | Parameters<typeof url>[0]
    commonjs?: boolean | Parameters<typeof commonjs>[0]
    json?: boolean | Parameters<typeof json>[0]
    typescript?: boolean | Parameters<typeof typescript>[0]
    terser?: Parameters<typeof terser>[0]
  } = {}
) {
  const getPlugin = <T>(fn: (arg?: T) => any, opts: undefined | boolean | T, defaultOpts?: Partial<T>) => {
    if (typeof opts === 'boolean') {
      if (opts === true) return fn(defaultOpts as any)
    } else {
      if (defaultOpts) {
        return fn({ ...defaultOpts, ...opts } as any)
      }
      return fn(opts)
    }
  }

  const normal = [
    getPlugin(tsConfigPaths, options.tsConfigPaths == null ? false : options.tsConfigPaths),
    getPlugin(run, options.run == null ? false : options.run), // 默认禁用
    getPlugin(alias, options.alias == null ? false : options.alias), // 一定要配置 alias 才启用
    getPlugin(inject, options.inject == null ? false : options.inject),
    getPlugin(replace, options.replace == null ? false : options.replace),
    getPlugin(strip, options.strip == null ? false : options.strip),
    getPlugin(url, options.url == null ? false : options.url),
    getPlugin(resolve, options.resolve, { preferBuiltins: true }),
    getPlugin(commonjs, options.commonjs),
    getPlugin(json, options.json),
    getPlugin(typescript, options.typescript, { noEmitOnError: false }),
  ].filter(t => !!t)

  return {
    normalPlugins: normal,
    minifyPlugins: [...normal, customTerser(options.terser)],
  }
}

export function getExternal(pkg?: any) {
  const externals = [...builtins]
  if (pkg) externals.push(...Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies }))

  let external: RollupOptions['external'] = (id, parentId, isResolved) => {
    if (isResolved) return false
    return /^([\w-]+)/.test(id) && externals.includes(RegExp.$1)
  }
  return external
}

export function getRootDir() {
  try {
    return path.dirname(findup.pkg())
  } catch (e) {
    throw new Error('定位不到项目根目录')
  }
}

export function getEntryMap(names: string[], map: (name: string) => string) {
  return names.reduce((res, key) => {
    res[key] = map(key)
    return res
  }, {} as Record<string, string>)
}
