import { regexpTrim, spiltTrim2array } from './helper'

export namespace opt {
  export interface Options<V> {
    desc?: string
    alias?: string[] | string
    group?: string
    hideInHelp?: boolean
    defaultValue?: V
  }

  export type ComboOptions<V> = Options<V> | string

  export type Type = 'boolean' | 'string' | 'bstr' | 'number' | 'bnum' | 'array' | 'count'

  export type Return<V> = V | undefined

  export interface InternalReturn<V = any> {
    options: Options<V>
    type: Type
  }
}

/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'boolean', opts?: opt.ComboOptions<boolean>): opt.Return<boolean>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'string', opts?: opt.ComboOptions<string>): opt.Return<string>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'bstr', opts?: opt.ComboOptions<boolean | string>): opt.Return<boolean | string>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'number', opts?: opt.ComboOptions<number>): opt.Return<number>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'bnum', opts?: opt.ComboOptions<boolean | number>): opt.Return<boolean | number>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'count', opts?: opt.ComboOptions<number>): opt.Return<number>
/**
 * @param type 选项类型
 * @param opts 选项配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function opt(type: 'array', opts?: opt.ComboOptions<string[]>): opt.Return<string[]>
export function opt<V>(type: opt.Type, opts?: opt.ComboOptions<V>): opt.Return<V> {
  let options: opt.Options<V>
  if (!opts) {
    options = {}
  } else if (typeof opts === 'string') {
    options = parseStringOpt2ObjectObj<V>(opts)
  } else {
    options = opts
  }
  return { type, options } as any
}

/**
 * @param type 环境变量类型
 * @param opts 环境变量配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function env(type: 'boolean', opts?: opt.ComboOptions<boolean>): opt.Return<boolean>
/**
 * @param type 环境变量类型
 * @param opts 环境变量配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function env(type: 'string', opts?: opt.ComboOptions<string>): opt.Return<string>
/**
 * @param type 环境变量类型
 * @param opts 环境变量配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function env(type: 'bstr', opts?: opt.ComboOptions<boolean | string>): opt.Return<boolean | string>
/**
 * @param type 环境变量类型
 * @param opts 环境变量配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function env(type: 'number', opts?: opt.ComboOptions<number>): opt.Return<number>
/**
 * @param type 环境变量类型
 * @param opts 环境变量配置，如果是字符串，可以配置成 `"[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}"`
 */
export function env(type: 'bnum', opts?: opt.ComboOptions<boolean | number>): opt.Return<boolean | number>
export function env<V>(type: any, opts?: any): opt.Return<V> {
  return opt(type, opts) as any
}

/**
 * 解析这种结构: `[groupName] !<aliasA | aliasB> 选项描述 {{ defaultValue }}`
 */
function parseStringOpt2ObjectObj<V>(strOpt: string): opt.Options<V> {
  const options: opt.Options<V> = {}

  const groupReg = /^\s*\[([^\]]+)\]/
  const aliasReg = /^\s*(!?)<([^\]]+)>/
  const valueReg = /\{\{(.*?)\}\}$/

  strOpt = regexpTrim(strOpt, groupReg, group => {
    group = group.trim()
    if (group) options.group = group
  })

  strOpt = regexpTrim(strOpt, aliasReg, (prefix, alias) => {
    options.hideInHelp = prefix === '!'
    options.alias = spiltTrim2array(alias)
  })

  strOpt = regexpTrim(strOpt, valueReg, value => {
    options.defaultValue = JSON.parse(value.trim())
  })

  options.desc = strOpt.trim()

  return options
}
