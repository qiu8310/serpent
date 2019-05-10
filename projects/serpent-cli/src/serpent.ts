import * as cli from 'mora-scripts/libs/tty/cli'
import * as rm from 'mora-scripts/libs/fs/rm'
import * as exists from 'mora-scripts/libs/fs/exists'
import * as findup from 'mora-scripts/libs/fs/findup'
import * as path from 'path'

cli({
  usage: 'serpent <command> [options]',
  version() {
    return require('../package.json').version
  }
}).commands({
  clean: {
    desc: `删除项目根目录下的 dist 文件夹`,
    cmd() {
      const { distDir } = getEnv()
      if (exists(distDir)) rm(distDir)
    }
  },
  index: {
    desc: `根据项目根目录下的 serpent.json 文件自动生成 index 入口文件`,
    cmd() {}
  }
})

function getEnv() {
  let pkgFile
  try {
    pkgFile = findup.pkg()
  } catch (e) {
    throw new Error(`无法定位 package.json 文件，请确保在项目中运行 serpent 命令`)
  }
  const rootDir = path.dirname(pkgFile)
  const srcDir = path.join(rootDir, 'src')
  const distDir = path.join(rootDir, 'dist')

  return { rootDir, srcDir, distDir }
}
