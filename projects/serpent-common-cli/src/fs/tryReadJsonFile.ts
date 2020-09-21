import fs from 'fs'
import { existsFile } from './context'

/**
 * 获取 json 文件的内容，如果没有或者解析 json 失败则返回 undefined
 */
export function tryReadJsonFile(absJsonPath: string) {
  if (existsFile(absJsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(absJsonPath).toString())
    } catch (e) {}
  }
  return
}
