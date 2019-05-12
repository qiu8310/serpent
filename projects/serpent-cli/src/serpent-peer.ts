import fs from 'fs'
import path from 'path'

export function peer(rootDir: string) {
  const pkgFile = path.join(rootDir, 'package.json')
  /* eslint-disable @typescript-eslint/no-var-requires */
  const pkg = require(pkgFile)

  if (JSON.stringify(pkg.dependencies) !== JSON.stringify(pkg.peerDependencies)) {
    pkg.peerDependencies = pkg.dependencies
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2))
  }
}
