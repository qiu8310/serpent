import path from 'path'
import { ospath, findupPackage, writeFileSync, toOSPath } from '../fs'

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

/**
 * 在指定的目录上生成一个 node 模块，常用于在 durka/vendors 下面注入新模块
 */
export function createPackage(
  nodeModulesDir: string,
  packageName: string,
  packageDetail: Record<string, any>,
  callback: (write: (fileName: string, fileContents: Buffer | string | string[]) => void, rootDir: string) => void
) {
  const packageRoot = path.join(nodeModulesDir, ...packageName.split('/'))
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    JSON.stringify({ name: packageName, version: '1.0.0', main: './index.js', ...packageDetail }, null, 2)
  )

  callback((fileName, fileContents) => {
    const file = toOSPath(path.join(packageRoot, fileName))
    const content = Array.isArray(fileContents) ? fileContents.join('\n') : fileContents

    writeFileSync(file, content || '')
  }, packageRoot)
}
