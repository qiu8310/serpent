import { getLocalPackageDetail, getPackageDetail } from './getPackageDetail'
import { compareVersion, parseVersion } from '../version'

type VERSION_FILTER_MODE = 'prerelease' | 'major' | 'minor' | 'patch' | 'all'
interface Options {
  /** 获取版本号规划，默认获取所有版本号 */
  filter?: VERSION_FILTER_MODE
  /** 获取版本号排序，默认 "desc" */
  sort?: 'desc' | 'asc'
}

/** 获取远程模块的版本号 */
export function getRemoteVersions(name: string, options?: Options) {
  return getVersions(getPackageDetail(name), options)
}

/** 获取本地模块的版本号 */
export function getLocalVersions(name: string, options?: Options) {
  return getVersions(getLocalPackageDetail(name), options)
}

function getVersions(detail: ReturnType<typeof getPackageDetail>, options: Options = {}) {
  const { sort = 'desc', filter = 'all' } = options
  return detail.then(d => {
    const versions = Object.keys(d.versions)
    if (filter === 'all') return sortVersions(versions, sort)
    return sortVersions(filterVersions(versions, filter), sort)
  })
}

function filterVersions(versions: string[], mode: VERSION_FILTER_MODE) {
  const map = new Map<string, string>()
  let maxMajor = -1
  type Target = NonNullable<ReturnType<typeof parseVersion>>
  const targets = versions.map(v => parseVersion(v)).filter(t => t != null) as Target[]

  const update = (key: string, target: Target) => {
    const prev = map.get(key)
    if (prev) {
      if (target.compare(prev) > 0) map.set(key, target.raw)
    } else {
      map.set(key, target.raw)
    }
  }

  targets.forEach(target => {
    const { major, minor, patch, prerelease } = target
    if (!prerelease.length) {
      if (mode === 'prerelease' || mode === 'major') update(`${major}.x.x`, target)
      else if (mode === 'minor') update(`${major}.${minor}.x`, target)
      else if (mode === 'patch') update(`${major}.${minor}.${patch}`, target)
      if (major > maxMajor) maxMajor = major
    }
  })

  if (mode === 'prerelease') {
    targets.forEach(target => {
      const { major, prerelease } = target
      // 预发布版本
      // 如果已经存在 2.0.0，则不再需要 2.0.0-rc.1 和 1.0.0-rc.1
      if (prerelease.length && major > maxMajor) {
        update(`${major}.x.x-${prerelease[0]}`, target)
      }
    })
  }

  return Array.from(map.values())
}

function sortVersions(versions: string[], mode: 'asc' | 'desc') {
  return versions.sort((a, b) => (mode === 'asc' ? compareVersion(a, b) : compareVersion(b, a)))
}
