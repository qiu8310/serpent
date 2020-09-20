import path from 'path'

/**
 * 将文件路径转化成操作系统相关的路径
 * @param filePath 文件路径
 */
export function toOSPath(filePath: string, sep: string = path.sep) {
  return filePath.split(/[\\\/]/).join(sep)
}

/**
 * 将文件路径转化成 posix 系统相关的路径
 * @param filePath 文件路径
 */
export function toPosixPath(filePath: string) {
  return toOSPath(filePath, path.posix.sep)
}

/**
 * 将文件路径转化成 win32 系统相关的路径
 * @param filePath 文件路径
 */
export function toWin32Path(filePath: string) {
  return toOSPath(filePath, path.win32.sep)
}
