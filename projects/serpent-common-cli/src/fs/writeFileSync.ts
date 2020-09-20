import fs from 'fs'
import path from 'path'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'

/**
 * 将内容写入到指定的路径中
 */
export function writeFileSync(absPath: string, content: string | Buffer) {
  mkdirp(path.dirname(absPath))
  fs.writeFileSync(absPath, content)
}
