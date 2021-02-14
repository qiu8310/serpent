import { getLocalPackageDetail, getPackageDetail } from './getPackageDetail'
import { sortVersions, filterVersions, VERSION_FILTER_MODE, VERSION_SORT_MODE, satisfiesVersion } from '../version'

interface VersionsOptions {
  registry?: string

  /** 获取版本号规则，默认获取所有版本号 */
  mode?: VERSION_FILTER_MODE

  /** 获取版本号排序，默认 "desc" */
  order?: VERSION_SORT_MODE

  /** 指定 tag (一个 tag 只会关联一个版本，而且只对远程模块有效) */
  tag?: string

  /** version range 用于过滤出需要的版本 */
  range?: string
}
interface LatestOptions {
  registry?: string
  /** 是否将 prerelease 版本也包含 */
  includePrerelease?: boolean
  /** 指定 tag (一个 tag 只会关联一个版本，而且只对远程模块有效) */
  tag?: string

  /** version range 用于过滤出需要的版本 */
  range?: string
}

/** 获取远程模块的版本号 */
export function getRemoteVersions(name: string, options: VersionsOptions = {}) {
  return getVersions(getPackageDetail(name, options.registry), options)
}

/** 获取本地模块的版本号 */
export function getLocalVersions(name: string, options?: VersionsOptions) {
  return getVersions(getLocalPackageDetail(name), options)
}

/** 获取远程所有 tag 及其关联的版本号 */
export function getRemoteTags(name: string, registry?: string) {
  return getPackageDetail(name, registry).then(d => d['dist-tags'] || {})
}

/** 获取远程中指定 tag 关联的版本号，有可能不存在 */
export function getRemoteTagVersion(name: string, tag: string, registry?: string) {
  return getRemoteTags(name, registry).then(d => d[tag])
}

/** 获取远程模块的最新版本号 */
export function getRemoteLatestVersion(name: string, options: LatestOptions = {}) {
  return getLatest(getRemoteVersions, name, options)
}
/** 获取本地模块的最新版本号 */
export function getLocalLatestVersion(name: string, options: LatestOptions = {}) {
  return getLatest(getLocalVersions, name, options)
}

function getLatest(fetch: typeof getRemoteVersions, name: string, options: LatestOptions = {}) {
  const { includePrerelease, range, tag, registry } = options
  return fetch(name, {
    mode: includePrerelease ? 'pre&major' : 'major',
    range,
    tag,
    order: 'desc',
    registry,
  }).then(versions => versions.shift())
}

function getVersions(prom: ReturnType<typeof getPackageDetail>, options: VersionsOptions = {}) {
  const { order = 'desc', mode = 'all', range, tag } = options
  return prom.then(detail => {
    let versions: string[] = []
    if (tag) {
      const tagVersion = (detail['dist-tags'] || {})[tag]
      if (tagVersion) versions.push(tagVersion)
    } else {
      versions = Object.keys(detail.versions)
    }

    if (range) versions = versions.filter(v => satisfiesVersion(v, range))
    if (mode === 'all') return sortVersions(versions, order)
    return sortVersions(filterVersions(versions, mode), order)
  })
}
