import path from 'path'
import findup from 'mora-scripts/libs/fs/findup'

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
