import exists from 'mora-scripts/libs/fs/exists'
import findup from 'mora-scripts/libs/fs/findup'
import mkdirp from 'mora-scripts/libs/fs/mkdirp'
import ospath from 'mora-scripts/libs/fs/ospath'
import rm from 'mora-scripts/libs/fs/rm'
import walk from 'mora-scripts/libs/fs/walk'
import clog from 'mora-scripts/libs/sys/clog'
import info from 'mora-scripts/libs/sys/info'
import isWin from 'mora-scripts/libs/sys/isWin'
import success from 'mora-scripts/libs/sys/success'
import warn from 'mora-scripts/libs/sys/warn'
import cli from 'mora-scripts/libs/tty/cli'
import table from 'mora-scripts/libs/tty/table'
import path from 'path'
import { spiltTrim2array } from './helper'
import { opt } from './opt-env'

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

    /** 是否是 window 操作系统 */
    isWin: boolean

    /** 输出成功信息 */
    success(message: string, ...optionalParams: any[]): void
    /** 输出错误信息 */
    error(message: string, ...optionalParams: any[]): void
    /** 输出警告信息 */
    warn(message: string, ...optionalParams: any[]): void
    /** 输出详细信息 */
    info(message: string, ...optionalParams: any[]): void
    /** 输出带颜色的信息 */
    clog(...args: Parameters<typeof clog>): ReturnType<typeof clog>
    /** 将一个二维组转化成 table，以便于显示在终端上 */
    table(...args: Parameters<typeof table>): ReturnType<typeof table>

    /** 输出命令的帮助文案 */
    help(): void

    /** 遍历文件夹 */
    walk(...args: Parameters<typeof walk>): ReturnType<typeof walk>
    /** 删除文件或文件夹 */
    rm(...args: Parameters<typeof rm>): ReturnType<typeof rm>
    /** 创建文件夹 */
    mkdirp(...args: Parameters<typeof mkdirp>): ReturnType<typeof mkdirp>
    /** 文件或文件夹（需要指定第二个参数）是否存在 */
    exists(...args: Parameters<typeof exists>): ReturnType<typeof exists>
    /** 操作系统相关的一些目录 */
    ospath: typeof ospath

    /** 获取当前项目根目录（含 package.json 文件的目录） */
    rootDir: string
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
    commands?: Record<string, Promise<ReturnType<typeof cmd>> | (() => ReturnType<typeof cmd>)>
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

    let rootDir: null | string = null

    cmder.parse(args || process.argv.slice(2), function (res, instance) {
      const { $command, _, userDefinedOptions, userDefinedEnv, userDefined, env, rawArgs, ...options } = res
      run({
        $command: parentRes?.$command,
        args: _,
        userDefinedOptions: userDefinedOptions as any,
        userDefinedEnv: userDefinedEnv as any,
        options: options as any,
        rawArgs,
        env,
        isWin,
        help: () => instance.help(),
        error: (...args: any[]) => instance.error(...args),
        info,
        warn,
        success,
        clog,
        table,
        walk,
        rm,
        mkdirp,
        exists,
        ospath,
        get rootDir() {
          if (rootDir === null) {
            try {
              rootDir = path.dirname(findup.pkg())
            } catch (e) {
              rootDir = ''
            }
          }
          if (rootDir === '')
            throw new Error(
              `Can't found project root directory, make sure you are under a directory which contains package.json file`
            )
          return rootDir
        },
      })
    })
  }
}

/**
 * @param strCmd 类似这种结构：`'<aliasA,aliasB> 命令描述': () => require(file) `
 * @param modFn 文件路径或文件名称
 */
function parseStrCmd2ObjCmd(strCmd: string, modFn: Promise<ReturnType<typeof cmd>> | (() => ReturnType<typeof cmd>)) {
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
