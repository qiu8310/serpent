import fs from 'fs'
import path from 'path'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import { existsFile } from './context'

/**
 * 将内容写入到指定的路径中
 */
export function writeFileSync(
  absPath: string,
  content: string | Buffer,
  options: { writeWhenChanged?: boolean } = { writeWhenChanged: true }
) {
  mkdirp(path.dirname(absPath))
  if (!options.writeWhenChanged || !equals(absPath, content)) {
    fs.writeFileSync(absPath, content)
  }
}

function equals(absPath: string, content: string | Buffer) {
  if (!existsFile(absPath)) return false
  const buffer = fs.readFileSync(absPath)
  if (typeof content === 'string') return buffer.toString() === content
  return buffer.equals(content)
}
