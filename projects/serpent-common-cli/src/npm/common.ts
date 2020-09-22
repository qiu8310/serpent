import path from 'path'
import { ospath } from '../fs'

export function getDurkaRegistry() {
  return process.env.DURKA_REGISTRY || 'https://registry.npm.taobao.org/'
}

export function getDurkaHome() {
  return process.env.DURKA_HOME || path.join(ospath.home(), '.durka')
}

export function getDurkaInstallPrefix() {
  return path.join(getDurkaHome(), 'packages', process.version)
}
