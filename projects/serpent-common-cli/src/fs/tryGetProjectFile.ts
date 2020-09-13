import path from 'path'
import exists from 'mora-scripts/libs/fs/exists'
import { tryGetProjectRootDir } from './tryGetProjectRootDir'
import { toOSPath } from './toOSPath'

/**
 * 根据相对路径，获取其绝对路径(只能获取文件的，无法获取文件夹的)
 *
 * @param relativeProjectFilePath 相对于项目根目录的路径
 * @param refAbsoluteFilePath 用于定位项目根目录的一个绝对路径，如果不传，默认使用 process.cwd
 *
 */
export function tryGetProjectFile(relativeProjectFilePath: string, refAbsoluteFilePath?: string) {
  const rootDir = tryGetProjectRootDir(refAbsoluteFilePath)
  if (rootDir) {
    const file = path.join(rootDir, toOSPath(relativeProjectFilePath))
    if (exists(file)) return file
  }
  return
}
