import fs from 'fs'
import path from 'path'

const PROJECTS_ROOT = path.resolve(__dirname, '..', '..')

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
    peerDependencies[key] = value.replace(/^(\d+\.)/, '^$1')
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
      const pkg = require(path.join(PROJECTS_ROOT, key.substr(1).replace('/', '-'), 'package.json'))
      res = { ...deep(pkg.dependencies || {}), ...res }
    }
  }
  return res
}
