import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import builtins from 'builtin-modules'
import type { RollupOptions, OutputOptions } from 'rollup'

export { resolve, commonjs, json, typescript, terser, builtins, RollupOptions, OutputOptions }

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
    resolve({
      preferBuiltins: true,
      ...options.resolve,
    }),
    commonjs(options.commonjs),
    json(options.json),
    typescript(options.typescript),
  ]
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
