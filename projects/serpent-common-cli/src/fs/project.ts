import path from 'path'
import assert from 'assert'
import findup from 'mora-scripts/libs/fs/findup'
import { existsFile, exists, existsDir } from './context'
import { toOSPath } from './toOSPath'

/** package.json 中的 name 的正则 */
export const PROJECT_NAME_REGEXP = /(?:@([\w-]+)\/)?([\w-]+)/
export const PROJECT_NAME_REGEXP_FULL = /^(?:@([\w-]+)\/)?([\w-]+)$/
export const PROJECT_NAME_REGEXP_START = /^(?:@([\w-]+)\/)?([\w-]+)/
export const PROJECT_NAME_REGEXP_END = /(?:@([\w-]+)\/)?([\w-]+)$/

/**
 * 获取项目的根目录
 * @param refAbsoluteFilePath 用于定位项目根目录的一个绝对路径，如果不传，默认使用 process.cwd
 */
export function tryGetProjectRootDir(refAbsoluteFilePath?: string): string | undefined {
  try {
    const pkg = findup.pkg(refAbsoluteFilePath)
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
 * 解析项目名称
 * @param name 项目名称，可以带有版本号，如：`vue`、`jquery@1.0.0`、`@serpent/foo@latest`
 */
export function parseProjectName(nameOrVersion: string) {
  let scope = ''
  let version = ''
  let name = ''

  let original = nameOrVersion
  let error = () => {
    throw new Error(`"${original}" is not a valid project name`)
  }

  if (name[0] === '@') {
    ;[scope, nameOrVersion] = name.substr(1).split('/')
    if (!scope || !nameOrVersion) error()
  }

  ;[name, version = ''] = nameOrVersion.split('@')
  if (!name || !PROJECT_NAME_REGEXP_FULL.test(name)) error()

  return { scope, version, name }
}
