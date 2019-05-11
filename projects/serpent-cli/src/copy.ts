import path from 'path'
import fs from 'fs'
import DotProp from 'mora-scripts/libs/lang/DotProp'
import escapeRegExp from 'mora-scripts/libs/lang/escapeRegExp'

export namespace copy {
  export interface Options {
    /**
     * 如果目标文件夹中有同名文件，如何处理；默认会报错
     *
     * * overwrite: 覆盖
     * * ignore: 忽略，即不执行任何操作
     * * error: 抛出异常
     * * collect: 收集出错的文件信息（后续可以单独处理）
     */
    duplicate?: 'overwrite' | 'ignore' | 'error'
    /** 要忽略的文件，为了方便避免递归太多文件，srcFile 可能会是文件夹 */
    excludes?: (relativePath: string, srcFile: string) => boolean
    /** 必须存在的文件，为了方便避免递归太多文件，srcFile 可能会是文件夹 */
    includes?: (relativePath: string, srcFile: string) => boolean
    /** 在 copy 某个文件时，可以对其内容替换 */
    replacers?: Replacer[]
  }
  export type RequiredOptions = Required<Options>
  export type Replacer = JsonReplacer | TextReplacer | ManualReplacer
  /** 使用 DotProp 对 json 内容替换，key 支持路径索引 */
  export interface JsonReplacer {
    type: 'json'
    /** JSON.stringify 的第二、三个参数 */
    stringify?: any[]
    /** 匹配文件相对 fromDir 的路径，只会对匹配到的文件替换 */
    match: RegExp | RegExp[]
    /** 要替换的所有字段及其值, key 支持 "path.to.field" 这种写法，用于索引到要更新的字段 */
    data: Record<string, any>
  }
  /** 使用正则替换文件中 "{{" 与 "}}" 中的名称 */
  export interface TextReplacer {
    type: 'text'
    /** 匹配文件相对 fromDir 的路径，只会对匹配到的文件替换 */
    match: RegExp | RegExp[]
    /** 要替换的所有字段及其值 */
    data: Record<string, string>

    /** 标签开头，默认为 "{{" */
    tagStart?: string
    /** 标签末尾，默认为 "}}" */
    tagEnd?: string
  }

  export interface ManualReplacer {
    type: 'manual'
    /** 匹配文件相对 fromDir 的路径，只会对匹配到的文件替换 */
    match: RegExp | RegExp[]
    replace: (buffer: Buffer, fileInfo: FileInfo) => string | Buffer
  }

  export interface Result {
    /** 覆盖了的文件信息 */
    overwritten: FileInfo[]
    /** 文件重复时忽略的文件信息，excludes 指定的文件不在这里（可能会太多，没必要记录） */
    ignored: FileInfo[]

    /** 复制成功的文件信息，包括 overwritten 的文件信息 */
    copied: FileInfo[]
  }

  export interface FileInfo {
    srcFile: string
    distFile: string
    relativePath: string
  }
}

const regexpCache: any = {}
const includes = () => false
const excludes = () => false

export function copy(fromDir: string, distDir: string, options: copy.Options = {}) {
  const requiredOptions: copy.RequiredOptions = {
    includes,
    excludes,
    duplicate: 'error',
    replacers: [],
    ...options
  }
  const result: copy.Result = {
    overwritten: [],
    ignored: [],
    copied: []
  }
  if (!fs.existsSync(fromDir)) throw new Error(`${fromDir} not exists`)

  walk(result, fromDir, distDir, fromDir, requiredOptions)

  result.copied.forEach(fileInfo => {
    const { srcFile, relativePath, distFile } = fileInfo
    const buffer = fs.readFileSync(srcFile)

    const replacer = requiredOptions.replacers.find(replacer => {
      if (Array.isArray(replacer.match)) return replacer.match.some(r => r.test(relativePath))
      return replacer.match.test(relativePath)
    })

    if (replacer) writeFile(distFile, replace(replacer, buffer, fileInfo))
    else writeFile(distFile, buffer)
  })

  return result
}

function writeFile(distFile: string, content: string | Buffer) {
  const dir = path.dirname(distFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(distFile, content)
}

function walk(
  result: copy.Result,
  fromDir: string,
  distDir: string,
  dir: string,
  options: copy.RequiredOptions
) {
  const { includes, excludes, duplicate } = options
  fs.readdirSync(dir).forEach(name => {
    const srcFile = path.join(dir, name)
    const relativePath = path.relative(fromDir, srcFile)
    if (includes(relativePath, srcFile) || !excludes(relativePath, srcFile)) {
      const stat = fs.statSync(srcFile)
      if (stat.isFile()) {
        const distFile = path.join(distDir, relativePath)
        const fileInfo = { srcFile, distFile, relativePath }
        if (fs.existsSync(distFile)) {
          if (duplicate === 'error') {
            throw new Error(`目标文件 ${distFile} 已经存在`)
          } else if (duplicate === 'ignore') {
            result.ignored.push(fileInfo)
            return
          } else if (duplicate === 'overwrite') {
            result.overwritten.push(fileInfo)
          } else {
            throw new Error(`duplicate 字段不支持设置成 "${duplicate}"`)
          }
        }
        result.copied.push(fileInfo)
      } else if (stat.isDirectory()) {
        walk(result, fromDir, distDir, srcFile, options)
      }
    }
  })
}

function replace(replacer: copy.Replacer, buffer: Buffer, fileInfo: copy.FileInfo) {
  const content = buffer.toString()
  if (replacer.type === 'json') {
    const dp = new DotProp(JSON.parse(content))
    Object.keys(replacer.data).forEach(key => {
      dp.set(key, replacer.data[key])
    })
    const args = replacer.stringify || [null, 2]
    return JSON.stringify(dp.data, ...args)
  } else if (replacer.type === 'text') {
    const { tagStart = '{{', tagEnd = '}}' } = replacer
    const regexp = getTextReplacerRegExp(tagStart, tagEnd)
    return buffer.toString().replace(regexp, (raw, key) => {
      if (replacer.data.hasOwnProperty(key)) return replacer.data[key]
      return raw
    })
  } else if (replacer.type === 'manual') {
    return replacer.replace(buffer, fileInfo)
  } else {
    throw new Error(`replacer 中的 type 字段不支持设置成 "${(replacer as any).type}"`)
  }
}

function getTextReplacerRegExp(tagStart: string, tagEnd: string): RegExp {
  const key = [tagStart, tagEnd].join('##')
  if (!regexpCache[key]) {
    regexpCache[key] = new RegExp(
      `${escapeRegExp(tagStart)}\\s*([\\w-]+)\\s*${escapeRegExp(tagEnd)}`,
      'g'
    )
  }
  return regexpCache[key]
}
