import exists from 'mora-scripts/libs/fs/exists'
import path from 'path'

export function jest(userArgs: string[], env: { rootDir: string }) {
  const { rootDir } = env
  const cmd = path.join(rootDir, 'node_modules', '.bin', 'jest')
  const disablePrefixConfig =
    exists.file(path.join(rootDir, 'jest.config.js')) ||
    userArgs.some(arg => /^(-c|--config)(=.+)$/.test(arg))

  const config = path.join(rootDir, 'node_modules', '@serpent', 'dev-kits', 'jest.config.js')
  const prefixArgs = disablePrefixConfig ? [] : ['-c', config]

  return {
    cmd,
    args: [...prefixArgs, ...userArgs]
  }
}
