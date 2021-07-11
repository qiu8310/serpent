import execa from 'execa'
import info from 'mora-scripts/libs/sys/info'
import { getBoolEnv } from './helper'

interface SilentOptions {
  /** 是否输出当前执行的命令，也可以通过环境变量 DURKA_SILENT_RUN 来控制 */
  silent?: boolean
}

interface ChildOptions<EncodingType = string> extends execa.Options<EncodingType>, SilentOptions {
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

export function run(args: string[], options?: ChildOptions): execa.ExecaChildProcess
export function run(args: string[], options?: ChildOptions<null>): execa.ExecaChildProcess<Buffer>
export function run(args: string[], options?: OutputOptions): Promise<string>
export function run(args: string[], options: any = {}): any {
  const { debug, output, ...opts } = options

  // 开启 debug 后还需要将环境变量 DURKA_NODE_DEBUG 设置成 true
  if (debug && process.env[typeof debug === 'string' ? debug : 'DURKA_NODE_DEBUG']) {
    return runNodeDebug(args, opts)
  } else if (output) {
    return runOutput(args, opts)
  } else {
    const [cmd, ...rest] = args
    if (!opts.silent) log(cmd, rest)
    return execa(cmd, rest, { stdio: 'inherit', ...opts })
  }
}

export function runOutput(args: string[], options: execa.Options & SilentOptions = {}) {
  const { silent = true, ...opts } = options
  const [cmd, ...rest] = args
  if (!silent) log(cmd, rest)
  return execa(cmd, rest, { ...opts, stdio: 'pipe' }).then(d => d.stdout)
}

export function runNodeDebug(args: string[], options: execa.Options & SilentOptions = {}) {
  const { silent, ...opts } = options
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

function log(cmd: string, args: string[]) {
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

export { execa }
