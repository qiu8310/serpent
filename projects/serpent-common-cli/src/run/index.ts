import execa from 'execa'
import info from 'mora-scripts/libs/sys/info'
import { getBoolEnv } from '../helper'
import { runTypes } from './types'

interface SilentOptions {
  /** 是否输出当前执行的命令，也可以通过环境变量 DURKA_SILENT_RUN 来控制 */
  silent?: boolean
}

interface ChildOptions<EncodingType = string> extends runTypes.Options<EncodingType>, SilentOptions {
  /**
   * 是否开户 node 调试模式，即给 node 命令添加 `node --inspect-brk`
   *
   * 指定了此值之后，还需要设置环境变量 DURKA_NODE_DEBUG
   */
  debug?: boolean | string

  /**
   * 返回执行命令输出的结果，而不是 ExecaChildProcess
   */
  output?: false
}

interface OutputOptions extends Omit<ChildOptions, 'output'> {
  /**
   * 返回执行命令输出的结果，而不是 ExecaChildProcess
   */
  output: true
}

/**
 * 执行某个命令，根据配置项不同，可以返回命令输出的内容，或者子进程
 * @param args
 *  - 如果是字符串，会当作 shell 命令执行，如 `runOutput('echo "abc"')`，注意，如果命令中有 shell 相关的功能时，如 "||" 或 "&&"，一定要指定 `shell: true`
 *  - 如果是数组，会当作普通调用，如 `runOutput(["echo", "abc"])`
 * @param options
 *  配置选项
 */
export function run(args: string | string[], options?: ChildOptions): runTypes.ExecaChildProcess
export function run(args: string | string[], options?: ChildOptions<null>): runTypes.ExecaChildProcess<Buffer>
export function run(args: string | string[], options?: OutputOptions): Promise<string>
export function run(args: string | string[], options: any = {}): any {
  const { debug, output, ...opts } = options
  // 开启 debug 后还需要将环境变量 DURKA_NODE_DEBUG 设置成 true
  if (debug && process.env[typeof debug === 'string' ? debug : 'DURKA_NODE_DEBUG']) {
    return runNodeDebug(args, opts)
  } else if (output) {
    return runOutput(args, opts)
  } else {
    if (typeof args === 'string') {
      if (!opts.silent) log(args)
      return execa.command(args, { stdio: 'inherit', ...opts })
    } else {
      const [cmd, ...rest] = args
      if (!opts.silent) log(cmd, rest)
      return execa(cmd, rest, { stdio: 'inherit', ...opts })
    }
  }
}

/**
 * 执行某个命令，并返回命令输出的内容
 * @param args
 *  - 如果是字符串，会当作 shell 命令执行，如 `runOutput('echo "abc"')`，注意，如果命令中有 shell 相关的功能时，如 "||" 或 "&&"，一定要指定 `shell: true`
 *  - 如果是数组，会当作普通调用，如 `runOutput(["echo", "abc"])`
 * @param options
 *  配置选项
 */
export function runOutput(args: string | string[], options: runTypes.Options & SilentOptions = {}) {
  const { silent = true, ...opts } = options
  if (typeof args === 'string') {
    if (!silent) log(args)
    return execa.command(args, { ...opts, stdio: 'pipe' }).then(d => d.stdout)
  } else {
    const [cmd, ...rest] = args
    if (!silent) log(cmd, rest)
    return execa(cmd, rest, { ...opts, stdio: 'pipe' }).then(d => d.stdout)
  }
}

export function runNodeDebug(args: string | string[], options: runTypes.Options & SilentOptions = {}) {
  const { silent, ...opts } = options
  if (typeof args === 'string') {
    let cmd = args
    if (/^\s*node\s/.test(cmd)) {
      cmd = cmd.replace('node', 'node --inspect-brk')
    } else {
      cmd = `node --inspect-brk ${cmd}`
    }
    if (!silent) log(cmd)
    return execa.command(cmd, { ...opts, stdio: 'inherit' })
  } else {
    let [cmd, ...rest] = args
    if (cmd === 'node') {
      rest.unshift('--inspect-brk')
    } else {
      cmd = 'node'
      rest = ['--inspect-brk', ...args]
    }
    if (!silent) log(cmd, rest)
    return execa(cmd, rest, { ...opts, stdio: 'inherit' })
  }
}

function log(cmd: string, args: string[] = []) {
  if (!getBoolEnv('DURKA_SILENT_RUN')) {
    info([cmd, ...args].join(' '))
  }
}

/** 在命令行的入口处使用此程序，直接可以开启支持调试模式 */
export function runCliWithDebug(exec: () => void, currentFile: string) {
  if (getBoolEnv('DURKA_NODE_DEBUG')) {
    runNodeDebug([currentFile, ...process.argv.slice(2)], { env: { DURKA_NODE_DEBUG: 'false' } })
  } else {
    exec()
  }
}
