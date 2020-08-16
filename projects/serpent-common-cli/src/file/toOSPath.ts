import path from 'path'

/**
 * 将文件路径转化成操作系统相关的路径
 * @param filePath 文件路径
 */
export function toOSPath(filePath: string) {
  return filePath.split(/[\\\/]/).join(path.sep)
}
