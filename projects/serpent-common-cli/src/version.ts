import parse from 'semver/functions/parse'
import compare from 'semver/functions/compare'
import satisfies from 'semver/functions/satisfies'

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
export function parseVersion(
  version: string
): null | {
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
} {
  return parse(version)
}
