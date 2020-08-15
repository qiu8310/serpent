import fs from 'fs'
import path from 'path'

export function regexpTrim(str: string, regexp: RegExp, callback: (...matches: string[]) => void) {
  if (regexp.test(str)) {
    callback(RegExp.$1, RegExp.$2, RegExp.$3)
    return str.replace(regexp, '')
  }

  return str
}

export function spiltTrim2array(str: string, split: RegExp | string = '|') {
  return str
    .split(split)
    .map(s => s.trim())
    .filter(s => !!s)
}

/**
 * 遍历文件夹
 * @param directory 要遍历的文件夹
 * @param cb 回调函数，如果返回 false，则不会继续遍历当前目录下的所有文件
 */
export function walk(
  directory: string,
  cb: (
    fileDirectory: string,
    fileBaseName: string,
    fileFullPath: string,
    fileStat: fs.Stats
  ) => boolean | void | undefined
) {
  fs.readdirSync(directory).forEach(name => {
    let fullPath = path.join(directory, name)
    let fileStat = fs.statSync(fullPath)

    if (false !== cb(directory, name, fullPath, fileStat)) {
      if (fileStat.isDirectory()) {
        walk(fullPath, cb)
      }
    }
  })
}
