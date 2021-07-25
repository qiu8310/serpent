import path from 'path'
import { ospath, findupPackage } from '../fs'

export function getDurkaRegistry() {
  return process.env.DURKA_REGISTRY || 'https://registry.npm.taobao.org/'
}

export function getDurkaConfig() {
  /* eslint-disable @typescript-eslint/ban-types */
  type LiteralUnion<T extends U, U = string> = T | (U & {})
  let res = {} as {
    language?: LiteralUnion<'typescript' | 'javascript'>
    env?: LiteralUnion<'node' | 'browser' | 'electron' | 'vscode' | 'any'>
    framework?: LiteralUnion<'react' | 'vue'>
    [key: string]: any
  }
  try {
    res = require(findupPackage()).durka || {}
  } catch (e) {}
  return res
}

export function getDurkaHome() {
  return process.env.DURKA_HOME || path.join(ospath.home(), '.durka')
}

export function getDurkaInstallPrefix() {
  return path.join(getDurkaHome(), 'packages', process.version)
}
