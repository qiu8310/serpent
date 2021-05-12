import fs from 'fs'
import path from 'path'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import { existsFile } from './context'

/**
 * 将内容写入到指定的路径中
 * @return 文件是否写入成功（不成功可能是因为文件没变化）
 */
export function writeFileSync(
  absPath: string,
  content: string | Buffer,
  options: { writeWhenChanged?: boolean } = { writeWhenChanged: true }
) {
  mkdirp(path.dirname(absPath))
  if (!options.writeWhenChanged || !equals(absPath, content)) {
    fs.writeFileSync(absPath, content)
    return true
  }
  return false
}

function equals(absPath: string, content: string | Buffer) {
  if (!existsFile(absPath)) return false
  const buffer = fs.readFileSync(absPath)
  if (typeof content === 'string') return buffer.toString() === content
  return buffer.equals(content)
}
