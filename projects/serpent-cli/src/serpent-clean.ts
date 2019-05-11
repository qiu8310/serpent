import rm from 'mora-scripts/libs/fs/rm'
import exists from 'mora-scripts/libs/fs/exists'

export function clean(env: { distDir: string }) {
  const { distDir } = env
  if (exists.directory(distDir)) rm(distDir)
}
