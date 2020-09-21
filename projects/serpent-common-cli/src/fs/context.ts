import fs from 'fs'
import assert from 'assert'
import _findup from 'mora-scripts/libs/fs/findup'
import _mkdirp from 'mora-scripts/libs/fs/mkdirp'
import _ospath from 'mora-scripts/libs/fs/ospath'
import _rm from 'mora-scripts/libs/fs/rm'
import _walk from 'mora-scripts/libs/fs/walk'

/** 向上递归查找指定的文件 */
export function findupFile(name: string, refRootPath?: string) {
  const ref = refRootPath || process.cwd()
  try {
    return _findup.file(ref, name)
  } catch (e) {
    throw new Error(`can't found up file whose name is "${name}" from directory ${ref} `)
  }
}

/** 向上递归查找指定名称的文件夹 */
export function findupDir(name: string, refRootPath?: string) {
  const ref = refRootPath || process.cwd()
  try {
    return _findup.dir(ref, name)
  } catch (e) {
    throw new Error(`can't found up directory whose name is "${name}" from directory ${ref} `)
  }
}

/** 向上递归查找 package.json 文件 */
export function findupPackage(refRootPath?: string) {
  const ref = refRootPath || process.cwd()
  try {
    return _findup.pkg(ref)
  } catch (e) {
    throw new Error(`can't found up "package.json" in directory ${ref}`)
  }
}

/** 递归删除指定路径上的内容 */
export function rm(absPath: string) {
  return _rm(absPath)
}

/** 遍历指定目录上的内容 */
export function walk(
  absDir: string,
  callback: (dir: string, name: string, absPath: string, stats: fs.Stats) => boolean | void | undefined
) {
  return _walk(absDir, callback)
}

export const ospath: {
  __platform: string
  data: () => string
  desktop: () => string
  home: () => string
  tmp: () => string
} = _ospath

/** 递归创建文件夹 */
export function mkdirp(absDir: string) {
  return _mkdirp(absDir)
}

/** 判断指定路径上是否存在内容 */
export function exists(absPath: string) {
  return !!tryGetFileStats(absPath)
}

/** 判断指定路径上是否存在文件 */
export function existsFile(absFile: string) {
  return tryStats(absFile, 'isFile')
}

/** 判断指定路径上是否存在非文件的内容 */
export function existsNotFile(absPath: string) {
  return tryStats(absPath, 'isFile', true)
}

/** 判断文件是否存在，不存在则抛出异常 */
export function assertFile(absFile: string, message?: string) {
  assert.ok(existsFile(absFile), message || `file "${absFile}" is not exists`)
}

/** 判断指定路径上是否存在文件夹 */
export function existsDir(absDir: string) {
  return tryStats(absDir, 'isDirectory')
}

/** 判断指定路径上是否存在非文件夹的内容 */
export function existsNotDir(absPath: string) {
  return tryStats(absPath, 'isDirectory', true)
}

/** 判断文件是否存在，不存在则抛出异常 */
export function assertDir(absDir: string, message?: string) {
  assert.ok(existsDir(absDir), message || `directory "${absDir}" is not exists`)
}

/** 尝试获取文件的 stats 对象，如果不存在返回 null */
export function tryGetFileStats(absPath: string) {
  try {
    return fs.statSync(absPath)
  } catch (e) {
    return null
  }
}

function tryStats(absPath: string, fnKey: 'isFile' | 'isDirectory', reverse?: boolean) {
  const stats = tryGetFileStats(absPath)
  if (!stats) return false
  let res = stats[fnKey]()
  return reverse ? !res : res
}
