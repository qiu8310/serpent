import path from 'path'
import os from 'os'
import findup from 'mora-scripts/libs/fs/findup'
import { getEnv } from '../env'

const rootDir = path.dirname(findup.pkg())
const fixturesDir = path.join(__dirname, 'fixtures')

describe('env', () => {
  test('env current project', () => {
    expect(getEnv()).toEqual({
      rootDir,
      srcDir: path.join(rootDir, 'src'),
      distDir: path.join(rootDir, 'dist'),
      userConfig: {},
    })
  })

  test('env project with custom config', () => {
    const root = path.join(fixturesDir, 'env-custom-config')
    switchRoot(root, () => {
      expect(getEnv()).toEqual({
        rootDir: root,
        srcDir: path.join(root, 's'),
        distDir: path.join(root, 'd'),
        userConfig: { src: 's', dist: 'd' },
      })
    })
  })

  test('env folder without package.json', () => {
    const root = os.tmpdir()
    switchRoot(root, () => {
      expect(() => {
        getEnv()
      }).toThrowErrorMatchingInlineSnapshot(`"无法定位 package.json 文件，请确保在项目中运行 serpent 命令"`)
    })
  })
})

function switchRoot(root: string, fn: () => void) {
  const cwd = process.cwd()
  process.chdir(root)
  fn()
  process.chdir(cwd)
}
