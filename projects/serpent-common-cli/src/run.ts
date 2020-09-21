import execa from 'execa'

interface ChildOptions<EncodingType = string> extends execa.Options<EncodingType> {
  /**
   * 是否开户 node 调试模式，即给 node 命令添加 `node --inspect-brk`
   *
   * 指定了此值之后，还需要设置环境变量 DURKA_DEBUG
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

  // 开启 debug 后还需要将环境变量 DURKA_DEBUG 设置成 true
  if (debug && process.env[typeof debug === 'string' ? debug : 'DURKA_NODE_DEBUG']) {
    return runNodeDebug(args, opts)
  } else if (output) {
    return runOutput(args, opts)
  } else {
    const [cmd, ...rest] = args
    return execa(cmd, rest, { stdio: 'inherit', ...opts })
  }
}

export function runOutput(args: string[], options?: execa.Options) {
  const [cmd, ...rest] = args
  return execa(cmd, rest, { ...options, stdio: 'pipe' }).then(d => d.stdout)
}

export function runNodeDebug(args: string[], options?: execa.Options) {
  let [cmd, ...rest] = args
  if (cmd === 'node') {
    rest.unshift('--inspect-brk')
  } else {
    cmd = 'node'
    rest = ['--inspect-brk', ...args]
  }
  return execa(cmd, rest, { ...options, stdio: 'inherit' })
}
