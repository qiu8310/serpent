import fs from 'fs'
import path from 'path'

// const PROJECTS_ROOT = path.resolve(__dirname, '..', '..')

interface D {
  [key: string]: string
}

export function peer(rootDir: string) {
  const pkgFile = path.join(rootDir, 'package.json')
  /* eslint-disable @typescript-eslint/no-var-requires */
  const pkg = require(pkgFile)

  if (!pkg.dependencies) return

  const dependencies = deep(pkg.dependencies)
  const peerDependencies: D = {}
  for (const [key, value] of Object.entries(dependencies)) {
    // 版本的第一位前添加 ^
    // 版本的最后一位修改成 0 # 第三方有可能不会那么快更新到最新的模块
    peerDependencies[key] = value.replace(/^([~^]?)(\d+)\.(\d+)\.(\d+)/, (raw, prefix, major, minor, patch) => {
      if (major === '0' && minor === '0') return raw
      return `${prefix || '^'}${major}.${minor}.0`
    })
  }

  if (JSON.stringify(peerDependencies) !== JSON.stringify(pkg.peerDependencies)) {
    pkg.peerDependencies = peerDependencies
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2))
  }
}

function deep(dependencies: D) {
  let res: D = { ...dependencies }
  for (const [key] of Object.entries(dependencies)) {
    if (key.startsWith('@serpent/')) {
      // 不需要继续解析，否则会导致 npm warn 多次
      // const pkg = require(path.join(PROJECTS_ROOT, key.substr(1).replace('/', '-'), 'package.json'))
      // res = { ...deep(pkg.dependencies || {}), ...res }
    }
  }
  return res
}
