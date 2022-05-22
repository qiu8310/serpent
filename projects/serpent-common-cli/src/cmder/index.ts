import isCommandExists from 'mora-scripts/libs/tty/isCommandExists'

export * from './opt-env'
export * from './cmd'
export { CmdConf, CmdResponse } from './types'

/**
 * 判断命令行中是否存在某个命令
 */
export function isCmdExists(cmdName: string) {
  return isCommandExists(cmdName)
}
