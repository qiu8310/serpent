import { writeFileSync } from './writeFileSync'

/**
 * 将 json 数据写入到指定的文件路径中
 */
export function writeJsonSync(absPath: string, json: any) {
  writeFileSync(absPath, JSON.stringify(json))
}
