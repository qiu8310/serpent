// assertProjectRoot
// isProjectRoot
// tryGetProjectRoot
// tryGetProjectFile

import path from 'path'
import assert from 'assert'
import findup from 'mora-scripts/libs/fs/findup'
import { existsFile, exists, existsDir } from './context'
import { toOSPath } from './toOSPath'

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
  assert.ok(isProjectRootDir(absDir), message || `file path ${absDir} is not a valid project root directory`)
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
