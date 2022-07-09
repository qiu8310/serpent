import fs from 'fs'
import { existsFile } from './context'

/**
 * 获取文件的内容，如果没有对应的文件则返回 undefined
 */
export function tryReadTextFile(absPath: string) {
  if (existsFile(absPath)) {
    try {
      return fs.readFileSync(absPath).toString()
    } catch (e) {}
  }
  return
}
