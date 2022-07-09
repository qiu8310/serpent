import fs from 'fs'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import path from 'path'
import { toOSPath, toPosixPath } from './toOSPath'
import { existsFile, existsDir } from './context'

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
    return path.resolve(this.rootDir, toOSPath(relPath))
  }

  /**
   * 返回指定文件的绝对路径，如果没有指定文件路径，则返回默认文件的绝对路径（用在命令行中，如果用户没有提供路径就使用根目录下的一个路径）
   * @param customPath 指定的文件路径（相对于当前工作目录）
   * @param defaultPath 默认文件路径（相对于根目录）
   */
  path(customPath: string | undefined, defaultPath: string) {
    if (customPath) return path.resolve(customPath)
    return this.abs(defaultPath)
  }

  /**
   * 指定路径上是否存在文件
   */
  existsFile(filePath: string) {
    return existsFile(this.abs(filePath))
  }

  /**
   * 指定路径上是否存在文件夹
   */
  existsDir(filePath: string) {
    return existsDir(this.abs(filePath))
  }

  /**
   * 获取指定路径的文件内容 （如果文件不存在会报错）
   */
  getContent(filePath: string) {
    return fs.readFileSync(this.abs(filePath))
  }

  /**
   * 获取指定路径的文件内容 （如果文件不存会返回 undefined）
   */
  tryGetContent(filePath: string, defaultValue?: string | Buffer) {
    try {
      return fs.readFileSync(this.abs(filePath))
    } catch (e) {
      return defaultValue
    }
  }

  /**
   * 获取指定路径的文件内容 （如果文件不存在或JSON解析失败会报错）
   */
  getJsonContent(filePath: string) {
    let content = this.getContent(filePath).toString()
    return JSON.parse(content)
  }

  /**
   * 获取指定路径的文件内容 （如果文件不存在或JSON解析失败会返回 undefined）
   */
  tryGetJsonContent(filePath: string, defaultValue?: any) {
    try {
      let content = this.getContent(filePath).toString()
      return JSON.parse(content)
    } catch (e) {
      return defaultValue
    }
  }

  /**
   * 设置指定路径的文件内容
   * @param filePath 相对于根目录的路径，也可以是绝对路径
   */
  setContent(filePath: string, content: string | Buffer, options?: fs.WriteFileOptions) {
    const absPath = this.abs(filePath)
    mkdirp(path.dirname(absPath))
    fs.writeFileSync(absPath, content, options)
  }

  /**
   * 设置指定路径的文件 JSON 内容
   */
  setJsonContent(filePath: string, json: any) {
    this.setContent(filePath, JSON.stringify(json, null, 2))
  }

  /** 根目录路径 */
  toString() {
    return this.rootDir
  }
}
