import path from 'path'
import { run } from '../run'
import { getDurkaInstallPrefix, getDurkaRegistry } from './common'
/**
 * 安装项目
 * @param name 要安装的项目名
 * @param version 要安装的项目版本，必须是一个具体是版本，不能是 tag 或 "^"、"~" 开头的版本号
 * @param options
 */
export async function npmInstall(
  name: string,
  version: string,
  options: {
    registry?: string
    prefix?: string
  } = {}
) {
  const { prefix = getDurkaInstallPrefix(), registry = getDurkaRegistry() } = options

  console.log()
  const p = path.join(prefix, name, version)
  await run(['npm', 'install', '--global', '--prefix', p, '--registry', registry, `${name}@${version}`])
  console.log()
}
