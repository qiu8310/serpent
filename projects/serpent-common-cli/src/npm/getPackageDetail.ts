import url from 'url'
import path from 'path'
import http from 'http'
import https from 'https'
import fs from 'fs'
import { getDurkaInstallPrefix, getDurkaRegistry } from './common'
import { existsDir, isProjectRootDir } from '../fs'
import { compareVersion } from '../version'
import { logger } from '../logger'

interface DetailPackage {
  name: string
  version: string
  description: string
  /** 本地模块才有此字段，远程模块没有 */
  durkaLocalFolder?: string
  [key: string]: any
}

interface Detail extends DetailPackage {
  /**
   * { beta: "3.5.1", latest: "3.5.1" }
   * （远程模块才有此字段）
   */
  'dist-tags'?: Record<string, string | undefined>
  /**
   * { modified: "2020-05-04T22:50:25.000Z", created: "2011-03-19T07:19:56.956Z", 3.5.1: "2020-05-04T22:50:08.819Z" }
   *（远程模块才有此字段）
   */
  time?: Record<string, string | undefined>
  versions: Record<string, DetailPackage>
}

/**
 * 获取 npm 模块的详细信息（如果远程获取失败则自动切换到本地
 * @param name npm 模块名称
 * @param registry npm registry
 */
export async function getPackageDetail(name: string, registry?: string) {
  try {
    return await getRemotePackageDetail(name, registry)
  } catch (e) {
    const detail = await getLocalPackageDetail(name)
    if (!Object.keys(detail.versions).length) throw e // 本地也没有对应的模块
    logger.warn(` fetch "${name}" error: ${e.message}`)
    logger.warn(` fallback to offline mode`)
    return detail
  }
}

/** 获取在线模块信息 */
export async function getRemotePackageDetail(name: string, registry?: string): Promise<Detail> {
  return _getRemotePackageDetail(name, registry)
}

async function _getRemotePackageDetail(name: string, registry?: string, retryCount = 0): Promise<Detail> {
  const pkgUrl = url.resolve(registry || getDurkaRegistry(), name)

  try {
    const { timeout, data: res = {} } = await wait(fetch(pkgUrl), 5000)
    if (timeout) {
      throw new Error(`Request ${pkgUrl} timeout`)
    }

    if (res.status === 404) {
      throw new Error(`Not found package "${name}" in ${pkgUrl}`)
    }

    if (res.status && res.status >= 400) {
      throw new Error(`HTTP status error: ${res.status} ${res.message || ''}`)
    }

    return res.data
  } catch (e) {
    // https://zhuanlan.zhihu.com/p/86953757
    if (e.error === 'ECONNRESET' && retryCount <= 2) {
      return await _getRemotePackageDetail(name, registry, retryCount + 1)
    }
    throw e
  }
}

/** 获取本地模块信息 */
export async function getLocalPackageDetail(name: string) {
  const baseDir = path.join(getDurkaInstallPrefix(), ...name.split('/'))
  const detail: Detail = { name, version: '', description: '', versions: {} }
  if (existsDir(baseDir)) {
    let localVersions = fs.readdirSync(baseDir)

    localVersions.forEach(v => {
      const rootDir = path.join(baseDir, v, 'lib', 'node_modules', name)
      if (isProjectRootDir(rootDir)) {
        const pkg = require(path.join(rootDir, 'package.json'))
        detail.versions[v] = Object.keys(pkg).reduce((res, k) => {
          // _ 开头的字段是 npm 在发布或安装的时候自动生成的字段
          if (!k.startsWith('_')) res[k] = pkg[k]
          return res
        }, {} as any)

        // 记录当前版本所在的文件目录
        detail.versions[v].durkaLocalFolder = rootDir
      }
    })

    localVersions = Object.keys(detail.versions)

    if (localVersions.length) {
      const maxVersion = localVersions.sort(compareVersion)[localVersions.length - 1]
      const versions = detail.versions
      Object.assign(detail, detail.versions[maxVersion], { name, versions })
    }
  }

  return detail
}

function fetch(url: string) {
  return new Promise<{ status?: number; message?: string; data?: any }>((resolve, reject) => {
    const isHTTPS = url.startsWith('https:')
    let client: http.ClientRequest
    if (isHTTPS) {
      client = https.get(url, { timeout: 5000 }, fetchCallback)
    } else {
      client = http.get(url, { timeout: 5000 }, fetchCallback)
    }
    client.on('error', e => {
      reject(e)
    })
    function fetchCallback(res: http.IncomingMessage) {
      let _data = ''
      let status = res.statusCode
      let message = res.statusMessage

      res.on('close', () => {
        res.removeAllListeners()
        let data: any
        if (_data) {
          try {
            data = JSON.parse(_data)
          } catch (e) {
            data = _data
          }
        }
        resolve({ data, status, message })
      })
      res.on('data', chunk => {
        if (typeof chunk === 'string') _data += chunk
        if (Buffer.isBuffer(chunk)) _data += chunk.toString()
      })
    }
  })
}

/**
 * 给异步函数设置一个超时时间，如果超过指定的时间还没返回，则直接 resolve 掉
 */
function wait<T>(promiseObj: Promise<T>, maxWaitTime: number): Promise<{ timeout: boolean; data?: T }> {
  const main = promiseObj.then(res => {
    return { timeout: false, data: res }
  })

  return Promise.race([
    main,
    sleep(maxWaitTime).then(() => {
      return { timeout: true }
    }),
  ])
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })
}
