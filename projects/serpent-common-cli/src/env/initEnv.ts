import type { env } from './types'
import { setEnv, setEnvSingly } from './setEnv'
import { getEnvSingly } from './getEnv'

export function initEnv<T>(options: env.Options<T>) {
  const result = {} as T
  setEnv(options)

  Object.entries(options.defaultEnv).forEach(([key, defaultValue]) => {
    Object.defineProperty(result, key, {
      enumerable: true,
      get() {
        return getEnvSingly(key, options)
      },
      set(value: any) {
        return setEnvSingly(key, value, options)
      },
    })
  })

  return result
}
