import exists from 'mora-scripts/libs/fs/exists'
import path from 'path'

import { getEnv } from './env'

export function jest(userArgs: string[], env: ReturnType<typeof getEnv>) {
  const { rootDir } = env
  const cmd = path.join(rootDir, 'node_modules', '.bin', 'jest')
  const disablePrefixConfig =
    exists(path.join(rootDir, 'jest.config.js')) ||
    userArgs.includes('-c') ||
    userArgs.includes('--config')

  const config = path.join(rootDir, 'node_modules', '@serpent', 'dev-kits', 'jest.config.js')
  const prefixArgs = disablePrefixConfig ? [] : ['-c', config]

  return {
    cmd,
    args: [...prefixArgs, ...userArgs]
  }
}
