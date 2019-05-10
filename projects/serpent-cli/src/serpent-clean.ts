import rm from 'mora-scripts/libs/fs/rm'
import exists from 'mora-scripts/libs/fs/exists'
import { getEnv } from './env'

export function clean(env: ReturnType<typeof getEnv>) {
  const { distDir } = env
  if (exists(distDir)) rm(distDir)
}
