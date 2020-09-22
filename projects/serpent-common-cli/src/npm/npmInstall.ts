import path from 'path'
import { run } from '../run'
import { isProjectRootDir } from '../fs'
import { getDurkaInstallPrefix, getDurkaRegistry } from './common'
/**
 * 安装模块
 * @param name 要安装的模块名
 * @param version 要安装的模块版本，必须是一个具体是版本，不能是 tag 或 "^"、"~" 开头的版本号
 * @param options
 * @returns 返回安装后的模块根目录
 */
export async function npmInstall(
  name: string,
  version: string,
  options: {
    /** 如果模块存在，是否强制重新安装 */
    force?: string
    registry?: string
    prefix?: string
  } = {}
) {
  const { prefix = getDurkaInstallPrefix(), registry = getDurkaRegistry() } = options

  const ns = name.split('/')
  const p = path.join(prefix, ...ns, version)
  const rtn = path.join(p, 'lib', 'node_modules', ...ns)

  if (!isProjectRootDir(rtn) || options.force) {
    console.log()
    await run(['npm', 'install', '--global', '--prefix', p, '--registry', registry, `${name}@${version}`])
    console.log()
  }

  return rtn
}
