import path from 'path'
import DotProp from 'mora-scripts/libs/lang/DotProp'
import { File, tryGetProjectRootDir, writeFileSync } from '../fs'
import { run } from '../run'

/**
 * 安装脚本到 durka/scripts 目录下
 */
export function installDurkaScript(options: {
  name: string
  subname: string
  content: string
  devOnly?: boolean
  installToPackage?: boolean
}) {
  const { name, subname, content, devOnly, installToPackage } = options

  const root = tryGetProjectRootDir()
  if (!root) throw new Error(`Not a valid node project, can not install durka script.`)

  const dist = new File(path.join(root, 'durka', 'scripts'))

  const config = dist.tryGetJsonContent('config.json', {}) as Record<string, string[]>

  if (!config[name]) config[name] = []

  // 安装过，就不需要安装了
  if (!config[name].includes(subname)) {
    config[name].push(subname)
    dist.setContent('config.json', JSON.stringify(config, null, 2))
  }

  dist.setContent(`${name}-${subname}`, content, { mode: 0o777 })

  if (installToPackage) {
    const pkgFile = path.join(root, 'package.json')
    const dp = new DotProp(require(pkgFile))
    const dkKey = `scripts.${name}`
    const update = () => writeFileSync(pkgFile, JSON.stringify(dp.data, null, 2))

    const prevValue: string | undefined = dp.get(dkKey)

    const appendCmd1 = `durka --devOnly runScript ${name}`
    const appendCmd2 = `durka runScript ${name}`
    const needAppendedValue = devOnly ? appendCmd1 : appendCmd2
    const notNeedAppendValue = devOnly ? appendCmd2 : appendCmd1
    if (!prevValue) {
      dp.set(dkKey, needAppendedValue)
      update()
    } else if (!prevValue.includes(needAppendedValue) && prevValue.includes(notNeedAppendValue)) {
      throw new Error(`已经存在命令 ${notNeedAppendValue}，无法再添加命令 ${needAppendedValue}`)
    } else if (!prevValue.includes(needAppendedValue)) {
      dp.set(dkKey, `${prevValue} && ${needAppendedValue}`)
      update()
    }
  }
}

/**
 * 运行 durka/scripts 中的脚本
 */
export async function runDurkaScript(options: { name: string; subname?: string; args?: string[] }) {
  const { name, args = [], subname: onlyRunSubname } = options

  const root = tryGetProjectRootDir()
  if (!root) throw new Error(`Not a valid node project, can not run durka script.`)
  const dist = new File(path.join(root, 'durka', 'scripts'))
  const config = dist.tryGetJsonContent('config.json', {}) as Record<string, string[]>
  const subnameList = config[name] || []

  if (onlyRunSubname) {
    if (subnameList.includes(onlyRunSubname)) {
      await run([dist.abs(`${name}-${onlyRunSubname}`)])
    } else {
      throw new Error(`Not found ${name}:${onlyRunSubname} script in durka/scripts/config.json`)
    }
  } else {
    for (const subname of subnameList) {
      const file = dist.abs(`${name}-${subname}`)
      await run([file, ...args])
    }
  }
}
