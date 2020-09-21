import dotenv from 'dotenv'
import { getEnv } from './getEnv'
import type { env } from './types'
import { tryGetProjectFile } from '../fs/project'

export function setEnv<T>(options: env.Options<T>) {
  setEnvFromEnvFile()
  return setEnvFromOptions(options)
}

function setEnvFromEnvFile() {
  const envFile = tryGetProjectFile('.env')
  if (envFile) {
    dotenv.config({ path: envFile })
  }
}

function setEnvFromOptions<T>(options: env.Options<T>): T {
  const env = getEnv(options)

  Object.entries(options.defaultEnv).forEach(([key, defaultValue]) => {
    setEnvSingly(key, env[key], options)
  })

  return env
}

export function setEnvSingly<T>(key: string, value: any, options: env.Options<T>) {
  const { defaultEnv, prefix } = options as any
  const prefixedKey = prefix + key

  if (!defaultEnv.hasOwnProperty(key)) throw new Error(`Environment variable("${prefixedKey}") not exists`)

  const defaultValue = defaultEnv[key]
  process.env[prefixedKey] = typeof defaultValue === 'string' ? value + '' : JSON.stringify(value)
}
