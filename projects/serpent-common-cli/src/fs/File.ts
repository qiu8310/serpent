import fs from 'fs'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import path from 'path'
import { toOSPath, toPosixPath } from './toOSPath'

export class File {
  rootDir: string
  constructor(rootDir: string) {
    this.rootDir = toOSPath(path.resolve(rootDir))
  }

  /** 获取相对根目录的相对路径 (路径分隔符为：posix格式) */
  rel(absPath: string) {
    const p = path.relative(this.rootDir, toOSPath(absPath))
    return path.sep !== path.posix.sep ? toPosixPath(p) : p
  }

  /** 获取相对于根目录的绝对路径（路径分隔符为：操作系统相关的格式） */
  abs(relPath: string) {
    return path.join(this.rootDir, toOSPath(relPath))
  }

  /**
   * 返回指定文件的绝对路径，如果没有指定文件路径，则返回默认文件的绝对路径
   * @param customPath 指定的文件路径（相对于当前工作目录）
   * @param defaultPath 默认文件路径（相对于根目录）
   */
  path(customPath: string | undefined, defaultPath: string) {
    if (customPath) return path.resolve(customPath)
    return this.abs(defaultPath)
  }

  /**
   * 获取指定路径的文件内容
   * @param filePath 相对于根目录的路径，也可以是绝对路径
   */
  getContent(filePath: string) {
    return fs.readFileSync(this.abs(filePath))
  }

  /**
   * 设置指定路径的文件内容
   * @param filePath 相对于根目录的路径，也可以是绝对路径
   */
  setContent(filePath: string, content: string | Buffer) {
    const absPath = this.abs(filePath)
    mkdirp(path.dirname(absPath))
    fs.writeFileSync(absPath, content)
  }

  /** 根目录路径 */
  toString() {
    return this.rootDir
  }
}
