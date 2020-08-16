import type { env } from './types'

export function getEnv<T>(options: env.Options<T>) {
  const defaultEnv: any = options.defaultEnv
  const env = { ...defaultEnv }

  Object.keys(defaultEnv).forEach(key => {
    env[key] = getEnvSingly(key, options)
  })

  return env
}

export function getEnvSingly<T>(key: string, options: env.Options<T>) {
  const prefixedKey = options.prefix + key
  const value = process.env[prefixedKey]
  const defaultEnv = options.defaultEnv as any

  if (!defaultEnv.hasOwnProperty(key)) throw new Error(`Environment variable("${prefixedKey}") not exists`)

  if (typeof value === 'string') {
    if (typeof defaultEnv[key] === 'string') {
      return value
    } else {
      try {
        return JSON.parse(value)
      } catch (e) {
        throw new Error(`Environment variable(${prefixedKey}) value(${value}) is not valid json`)
      }
    }
  }
}
