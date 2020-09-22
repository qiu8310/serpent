import parse from 'semver/functions/parse'
import compare from 'semver/functions/compare'
import satisfies from 'semver/functions/satisfies'

export type VERSION_FILTER_MODE = 'pre&major' | 'pre&minor' | 'pre&minor' | 'major' | 'minor' | 'patch' | 'all'
export type VERSION_SORT_MODE = 'asc' | 'desc'
export interface VERSION_INSTANCE {
  raw: string
  major: number
  minor: number
  patch: number
  version: string
  /* eslint-disable @typescript-eslint/array-type */
  build: ReadonlyArray<string>
  prerelease: ReadonlyArray<string | number>
  /* eslint-enable @typescript-eslint/array-type */
  /**
   * Compares two versions excluding build identifiers (the bit after `+` in the semantic version string).
   *
   * @return
   * - `0` if `this` == `other`
   * - `1` if `this` is greater
   * - `-1` if `other` is greater.
   */
  compare(other: string): 1 | 0 | -1
}

/**
 * Compares two versions excluding build identifiers (the bit after `+` in the semantic version string).
 *
 * Sorts in ascending order when passed to `Array.sort()`.
 *
 * @return
 * * v1  <  v2  => -1
 * * v1 === v2  => 0
 * * v1  >  v2  => 1
 */
export function compareVersion(v1: string, v2: string) {
  return compare(v1, v2)
}

/** Return true if the version satisfies the range. */
export function satisfiesVersion(version: string, range: string) {
  return satisfies(version, range)
}

/** 解析 version，生成一个对象 */
export function parseVersion(version: string): null | VERSION_INSTANCE {
  return parse(version)
}

/** 过滤出需要的版本号 */
export function filterVersions(versions: string[], mode: VERSION_FILTER_MODE = 'all') {
  const map = new Map<string, string>()
  let maxMajor = -1
  const targets = versions.map(v => parseVersion(v)).filter(t => t != null) as VERSION_INSTANCE[]

  const update = (key: string, target: VERSION_INSTANCE) => {
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
      if (mode.endsWith('major')) update(`${major}.x.x`, target)
      else if (mode.endsWith('minor')) update(`${major}.${minor}.x`, target)
      else if (mode.endsWith('patch')) update(`${major}.${minor}.${patch}`, target)
      if (major > maxMajor) maxMajor = major
    }
  })

  if (mode.startsWith('pre&')) {
    targets.forEach(target => {
      const { major, prerelease } = target
      // 预发布版本
      // 如果已经存在 2.0.0，则不再需要 2.0.0-rc.1 和 1.0.0-rc.1
      if (prerelease.length && major > maxMajor) {
        update(`${major}.x.x-pre`, target)
      }
    })
  }

  return Array.from(map.values())
}

/** 版本号排序，默认从大到小排 */
export function sortVersions(versions: string[], mode?: VERSION_SORT_MODE) {
  return versions.sort((a, b) => (mode === 'asc' ? compareVersion(a, b) : compareVersion(b, a)))
}
