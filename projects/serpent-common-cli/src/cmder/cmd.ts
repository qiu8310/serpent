import isWin from 'mora-scripts/libs/sys/isWin'
import cli from 'mora-scripts/libs/tty/cli'
import table from 'mora-scripts/libs/tty/table'
import { spiltTrim2array } from './helper'
import { opt } from './opt-env'
import { createContext } from './createContext'
import { CmdConf, CmdResponse } from './types'

export namespace cmd {
  export interface Context<Opts, Env> extends ReturnType<typeof createContext> {
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
    /** 是否是 window 操作系统 */
    isWin: boolean
    /**
     * 将一个二维组转化成 table，以便于显示在终端上
     */
    table(rows: string[][]): string
    /** 输出命令的帮助文案 */
    help: (returnString?: boolean) => void | string
    /** 获取当前项目根目录（含 package.json 文件的目录） */
    getRootDir: (refPath?: string) => string
  }
}

export function cmd<Opts, Env>(
  params: {
    /**
     * **字符串的表示法：**
     * ```
     * { foo: opt('string', '[groupName] !<aliasA,aliasB> 选项描述 {{ defaultValue }}') }
     * ```
     *
     * 其中的 ! 表示是否要在 help 中显示，可以不添加
     */
    options?: Opts
    /**
     * **字符串的表示法：**
     * ```
     * { bar: opt('string', '[groupName] !<aliasA,aliasB> 环境变量描述 {{ defaultValue }}') }
     * ```
     *
     * 其中的 ! 表示是否要在 help 中显示，可以不添加
     */
    env?: Env
    /**
     * **command 字符串的表示法：**
     * ```
     * { '!<aliasA,aliasB> 命令描述': () => require(file) }
     * ```
     *
     * 其中的 "!" 表示是否要在 help 中显示，可以不添加
     */
    commands?: Record<string, Promise<ReturnType<typeof cmd>> | (() => ReturnType<typeof cmd>)>
  } & CmdConf,
  run: (ctx: cmd.Context<Opts, Env>) => void
) {
  return function (args?: string[], parentConf?: CmdConf, parentRes?: CmdResponse) {
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

    const ctx = createContext()

    cmder.parse(args || process.argv.slice(2), async function (res, instance) {
      const { $command, _, userDefinedOptions, userDefinedEnv, userDefined, env, rawArgs, ...options } = res
      try {
        await run({
          $command: parentRes?.$command,
          args: _,
          userDefinedOptions: userDefinedOptions as any,
          userDefinedEnv: userDefinedEnv as any,
          options: options as any,
          rawArgs,
          env,
          help: (returnString?: boolean) => instance.help(returnString),
          isWin,
          table,
          ...ctx,
          getRootDir(refPath?: string) {
            const res = ctx.tryGetProjectRootDir(refPath)
            if (!res) {
              let ref = refPath ? ` in ${refPath}` : ''
              throw new Error(
                `Can't found project root directory${ref}, make sure you are under a directory which contains package.json file`
              )
            }
            return res
          },
        })
      } catch (e) {
        ctx.logger.error(e.message)
        console.error(e)
        process.exitCode = 88
        process.exit(process.exitCode)
      }
    })
  }
}

/**
 * @param strCmd 类似这种结构：`'!<aliasA,aliasB> 命令描述': () => require(file) `
 * @param modFn 文件路径或文件名称
 */
function parseStrCmd2ObjCmd(strCmd: string, modFn: Promise<ReturnType<typeof cmd>> | (() => ReturnType<typeof cmd>)) {
  const aliasReg = /^\s*(!?)<([^>]+)>/
  const error = () => {
    throw new Error(`command config string "${strCmd}" did not includes any command name`)
  }
  if (!aliasReg.test(strCmd)) error()
  const hideInHelp = RegExp.$1 === '!'
  const keys = spiltTrim2array(RegExp.$2)
  if (!keys.length) error()
  const desc = strCmd.replace(aliasReg, '').trim()

  const commands: cli.Commands = {
    [keys.join(' | ')]: {
      desc,
      hideInHelp,
      cmd: function (res) {
        let run = (fn: ReturnType<typeof cmd>) => fn(res._, { version: false, desc }, res) // 子命令默认不需要 version
        if (typeof modFn === 'function') {
          run(modFn)
        } else {
          modFn.then(run)
        }
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
