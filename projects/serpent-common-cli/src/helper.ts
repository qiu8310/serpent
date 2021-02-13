import warn from 'mora-scripts/libs/sys/warn'

/**
 * 获取环境变量中的 boolean 类型的变量
 *
 * 如 `process.env.FOO = false` 时使用 `getBoolEnv('FOO') === false`
 * @param key 环境变量的键名
 */
export function getBoolEnv(key: string) {
  let val = process.env[key]
  if (val == null) return false
  if (/^(0|no|false|null|nil)$/i.test(val.trim())) return false
  return true
}

/**
 * 加载文件模块，如果文件模块不存在或加载失败，会使用 defaults 内容
 * @param filePath 文件模块路径
 * @param defaults 默认内容（文件模块不存在，或字段不全时会使用此字段中的内容）
 * @param options 配置项
 */
export function loadScript<T>(
  filePath: string,
  defaults: Required<T>,
  options: { validateKey?: boolean; validateType?: boolean } = {}
) {
  let mod: T = {} as any
  const { validateKey = true, validateType = true } = options
  try {
    mod = require(filePath)

    const defaultKeys: (keyof T)[] = Object.keys(defaults) as any
    const modKeys: (keyof T)[] = Object.keys(mod) as any

    modKeys.forEach(k => {
      const modType = typeof mod[k]
      const defType = typeof defaults[k]

      if (validateKey && !defaultKeys.includes(k)) {
        warn(`  find extra property "${k}", in file "${filePath}"`)
      }

      if (validateType && modType && defType && modType !== defType) {
        warn(`  expect property ${k}'s type to be "${defType}", not ${modType}, in file "${filePath}"`)
      }
    })
  } catch (e) {}

  return {
    ...defaults,
    ...mod,
  }
}
