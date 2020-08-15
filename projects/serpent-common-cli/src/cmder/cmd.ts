import cli from 'mora-scripts/libs/tty/cli'
import info from 'mora-scripts/libs/sys/info'
import warn from 'mora-scripts/libs/sys/warn'
import success from 'mora-scripts/libs/sys/success'

import { opt } from './opt-env'
import { spiltTrim2array, walk } from './helper'

export namespace cmd {
  export interface Context<Opts, Env> {
    /** 当前子命令的名称（由于子命令支持通配符，所以需要通过此字段来获取子命令实际的值） */
    $command?: string

    /** 提供给命令的选项 */
    options: Opts
    /** 提供给命令的环境变量 */
    env: Env
    /** 提供给命令的参数（选项被过滤掉）*/
    args: string[]
    /** 提供给命令的原始的参数*/
    rawArgs: string[]
    /** 用于判断选项是用户在命令行中提供的，还是程序指定的默认值 */
    userDefinedOptions: Record<keyof Opts, boolean>
    /** 用于判断环境变量是用户在命令行中提供的，还是程序指定的默认值 */
    userDefinedEnv: Record<keyof Env, boolean>

    /** 输出成功信息 */
    success(message: string, ...optionalParams: any[]): void
    /** 输出错误信息 */
    error(message: string, ...optionalParams: any[]): void
    /** 输出警告信息 */
    warn(message: string, ...optionalParams: any[]): void
    /** 输出详细信息 */
    info(message: string, ...optionalParams: any[]): void

    /** 输出命令的帮助文案 */
    help(): void

    /** 遍历文件夹 */
    walk(...args: Parameters<typeof walk>): ReturnType<typeof walk>
  }
}

export function cmd<Opts, Env>(
  params: {
    /**
     * **字符串的表示法：**
     * ```
     * { foo: opt('string', '[groupName] <aliasA,aliasB> 选项描述 {{ defaultValue }}') }
     * ```
     */
    options?: Opts
    /**
     * **字符串的表示法：**
     * ```
     * { bar: opt('string', '[groupName] <aliasA,aliasB> 环境变量描述 {{ defaultValue }}') }
     * ```
     */
    env?: Env
    /**
     * **command 字符串的表示法：**
     * ```
     * { '<aliasA,aliasB> 命令描述': () => require(file) }
     * ```
     */
    commands?: Record<string, () => ReturnType<typeof cmd>>
  } & cli.Conf,
  run: (ctx: cmd.Context<Opts, Env>) => void
) {
  return function (args?: string[], parentConf?: cli.Conf, parentRes?: cli.Response) {
    const { options = {}, env = {}, commands = {}, ...conf } = params
    const optionsParam: Record<string, opt.InternalReturn> = options as any
    const envParam: Record<string, opt.InternalReturn> = env as any
    const cmder = cli({ ...parentConf, ...conf })

    initCmder('options', cmder, optionsParam)
    initCmder('env', cmder, envParam)

    cmder.commands(
      Object.entries(commands).reduce((subs, [strCmd, modFn]) => {
        return {
          ...subs,
          ...parseStrCmd2ObjCmd(strCmd, modFn),
        }
      }, {} as cli.Commands)
    )

    cmder.parse(args || process.argv.slice(2), function (res, cli) {
      const { $command, _, userDefinedOptions, userDefinedEnv, userDefined, env, rawArgs, ...options } = res
      run({
        $command: parentRes?.$command,
        args: _,
        userDefinedOptions: userDefinedOptions as any,
        userDefinedEnv: userDefinedEnv as any,
        options: options as any,
        rawArgs,
        env: env,
        help: () => cli.help(),
        error: (...args: any[]) => cli.error(...args),
        info,
        warn,
        success,
        walk,
      })
    })
  }
}

/**
 * @param strCmd 类似这种结构：`'<aliasA,aliasB> 命令描述': () => require(file) `
 * @param modFn 文件路径或文件名称
 */
function parseStrCmd2ObjCmd(strCmd: string, modFn: () => ReturnType<typeof cmd>) {
  const aliasReg = /^\s*<([^>]+)>/
  const error = () => {
    throw new Error(`command config string "${strCmd}" did not includes any command name`)
  }
  if (!aliasReg.test(strCmd)) error()
  const keys = spiltTrim2array(RegExp.$1)
  if (!keys.length) error()
  const desc = strCmd.replace(aliasReg, '').trim()

  const commands: cli.Commands = {
    [keys.join(' | ')]: {
      desc,
      cmd: function (res) {
        modFn()(res._, { version: false, desc }, res) // 子命令默认不需要
      },
    },
  }
  return commands
}

function initCmder(
  fnKey: 'options' | 'env',
  cmder: ReturnType<typeof cli>,
  params: Record<string, opt.InternalReturn>
) {
  Object.entries(params).forEach(([key, opts]) => {
    const {
      type,
      options: { alias = [], defaultValue, desc, group },
    } = opts
    const obj: cli.Options = {
      [[key, ...alias].join(' | ')]: {
        type,
        desc,
        defaultValue,
      },
    }
    if (group) cmder[fnKey](group, obj)
    else cmder[fnKey](obj)
  })
}
