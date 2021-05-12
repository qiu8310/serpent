import { writeFileSync } from './writeFileSync'

/**
 * 将 json 数据写入到指定的文件路径中
 * @return 文件是否写入成功（不成功可能是因为文件没变化）
 */
export function writeJsonSync(absPath: string, json: any) {
  return writeFileSync(absPath, JSON.stringify(json))
}
