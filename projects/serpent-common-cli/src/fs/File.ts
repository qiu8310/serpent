import fs from 'fs'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import path from 'path'

export class File {
  rootDir: string
  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir)
  }

  /** 获取相对根目录的相对路径 */
  rel(absPath: string) {
    return path.relative(this.rootDir, absPath)
  }

  /** 获取相对于根目录的绝对路径 */
  abs(relPath: string) {
    return path.join(this.rootDir, relPath)
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
