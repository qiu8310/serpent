/**
 * 获取环境变量中的 boolean 类型的变量
 *
 * 如 `process.env.FOO = false` 时使用 `getBoolEnv('FOO') === false`
 * @param key 环境变量的键名
 */
export function getBoolEnv(key: string) {
  let val = process.env[key]
  if (val == null) return false
  if (/^(0|no|false)$/i.test(val.trim())) return false
  return true
}
