import path from 'path'
import assert from 'assert'
import findup from 'mora-scripts/libs/fs/findup'
import { existsFile, exists, existsDir } from './context'
import { toOSPath } from './toOSPath'

/** package.json 中的 name 的正则 */
export const PROJECT_NAME_REGEXP = /(?:@([\w-]+)\/)?([\w-]+)/
/** package.json 中的 name 的正则（匹配字符串的开始和结束） */
export const PROJECT_NAME_REGEXP_FULL = /^(?:@([\w-]+)\/)?([\w-]+)$/
/** package.json 中的 name 的正则（匹配字符串的开始） */
export const PROJECT_NAME_REGEXP_START = /^(?:@([\w-]+)\/)?([\w-]+)/
/** package.json 中的 name 的正则（匹配字符串的结束） */
export const PROJECT_NAME_REGEXP_END = /(?:@([\w-]+)\/)?([\w-]+)$/

/**
 * 获取项目的根目录
 * @param refAbsoluteFilePath 用于定位项目根目录的一个绝对路径，如果不传，默认使用 process.cwd
 */
export function tryGetProjectRootDir(refAbsoluteFilePath?: string): string | undefined {
  let refPath = refAbsoluteFilePath || process.cwd()
  try {
    // 移除后面 node_modules 目录
    const pkg = findup.pkg(refPath.replace(/[\\\/]node_modules(\b|[\\\/].*)$/, ''))
    return path.dirname(pkg)
  } catch (e) {
    return
  }
}

/**
 * 判断指定的路径是否是一个项目（是否包含 package.json 文件）的根目录
 */
export function isProjectRootDir(absDir: string) {
  return existsFile(path.join(absDir, 'package.json'))
}

/** 确保指定的路径是项目根目录 */
export function assertProjectRootDir(absDir: string, message?: string) {
  assert.ok(isProjectRootDir(absDir), message || `path ${absDir} is not a valid project root directory`)
}

/**
 * 根据相对路径，获取其绝对路径(只能获取文件的，无法获取文件夹的)
 *
 * @param relativeProjectFilePath 相对于项目根目录的路径
 * @param refAbsoluteFilePath 用于定位项目根目录的一个绝对路径，如果不传，默认使用 process.cwd
 *
 */
export function tryGetProjectFile(relativeProjectFilePath: string, refAbsoluteFilePath?: string) {
  return tryGetProjectPath(relativeProjectFilePath, refAbsoluteFilePath, existsFile)
}

/**
 * 根据相对路径，获取其绝对路径(只能获取文件夹的，无法获取文件的)
 *
 * @param relativeProjectFilePath 相对于项目根目录的路径
 * @param refAbsoluteFilePath 用于定位项目根目录的一个绝对路径，如果不传，默认使用 process.cwd
 *
 */
export function tryGetProjectDir(relativeProjectFilePath: string, refAbsoluteFilePath?: string) {
  return tryGetProjectPath(relativeProjectFilePath, refAbsoluteFilePath, existsDir)
}

function tryGetProjectPath(relativeProjectFilePath: string, refAbsoluteFilePath?: string, fn = exists) {
  const rootDir = tryGetProjectRootDir(refAbsoluteFilePath)
  if (rootDir) {
    const file = path.join(rootDir, toOSPath(relativeProjectFilePath))
    if (fn(file)) return file
  }
  return
}

/**
 * 解析项目安装时可能会用的名称
 * @param installName 项目名称，可以带有版本号，如：`vue`、`vue@^1`、`jquery@1.0.0`、`@serpent/foo@latest`
 * @returns
 * - `parseProjectInstallName("@serpent/foo@latest")  =>  { scope: 'serpent', name: 'foo', tag: 'latest', range: '' }`
 * - `parseProjectInstallName("foo@^1")               =>  { scope: '', name: 'foo', tag: '', range: '^1' }`
 * - `parseProjectInstallName("foo@*")                =>  { scope: '', name: 'foo', tag: '', range: '' }`
 */
export function parseProjectInstallName(installName: string) {
  let scope = ''
  let range = ''
  let tag = ''
  let name = ''

  let newName = installName
  let error = () => {
    throw new Error(`"${installName}" is not a valid project name`)
  }

  if (newName[0] === '@') {
    ;[scope, newName] = newName.substr(1).split('/')
    if (!scope || !newName) error()
  }

  ;[name, range = ''] = newName.split('@')
  if (!name || !PROJECT_NAME_REGEXP_FULL.test(name)) error()

  // range 还要支持 "*"
  if (range && range !== '*' && /^[a-zA-Z][-\w]*$/.test(range)) {
    tag = range
    range = ''
  }

  return {
    scope,
    range,
    tag,
    name,
  }
}

/**
 * 根据项目根目录，获取到 package.json 中指定的 bin 文件所在的绝对路径
 */
export function tryGetProjectBinFile(rootDir: string) {
  let bin = ''
  let file = ''

  try {
    const pkg = require(path.join(rootDir, 'package.json'))
    bin = pkg.bin
  } catch (e) {}

  if (bin && typeof bin === 'string') {
    file = path.resolve(rootDir, bin)
  } else if (typeof bin === 'object') {
    const binKeys = Object.keys(bin)
    if (binKeys.length === 1) {
      file = path.resolve(rootDir, bin[binKeys[0]])
    }
  }

  if (file) {
    try {
      return require.resolve(file)
    } catch (e) {}
  }
  return
}
