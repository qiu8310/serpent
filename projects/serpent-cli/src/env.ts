import findup from 'mora-scripts/libs/fs/findup'
import path from 'path'

export function getEnv() {
  let pkgFile
  try {
    pkgFile = findup.pkg()
  } catch (e) {
    throw new Error(`无法定位 package.json 文件，请确保在项目中运行 serpent 命令`)
  }
  /* eslint "@typescript-eslint/no-var-requires": "off" */
  const pkg = require(pkgFile)
  const userConfig = (pkg.serpent || {}) as { src?: string; dist?: string; ignores?: string[] }
  const rootDir = path.dirname(pkgFile)
  const srcDir = path.resolve(rootDir, userConfig.src || 'src')
  const distDir = path.resolve(rootDir, userConfig.dist || 'dist')

  return { rootDir, srcDir, distDir, userConfig }
}
