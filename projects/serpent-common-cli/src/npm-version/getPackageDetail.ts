import axios from 'axios'
import url from 'url'
import { REGISTRY } from './constants'

/**
 * 获取 npm 模块的详细信息
 * @param name npm 模块名称
 * @param registry npm registry
 */
export async function getPackageDetail(
  name: string,
  registry = REGISTRY
): Promise<{
  name: string
  description: string
  /** dist-tags: { beta: "3.5.1", latest: "3.5.1" } */
  'dist-tags': Record<string, string>
  /**
   * time: {
   *    modified: "2020-05-04T22:50:25.000Z",
   *    created: "2011-03-19T07:19:56.956Z",
   *    3.5.1: "2020-05-04T22:50:08.819Z",
   *    3.0.0-rc1: "2016-05-20T19:13:48.387Z",
   * }
   */
  time: Record<string, string>
  versions: Record<
    string,
    {
      name: string
      version: string
      description: string
      [key: string]: any
    }
  >
  [key: string]: any
}> {
  const pkgUrl = url.resolve(registry, name)
  return axios
    .get(pkgUrl, { responseType: 'json' })
    .then(res => {
      return res.data
    })
    .catch(e => {
      if (e?.request?.res?.statusCode === 404) {
        throw new Error(`Not found package ${name} in ${pkgUrl}`)
      } else {
        throw e
      }
    })
}
