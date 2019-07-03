import { getEnv } from './env'
import fs from 'fs'
import path from 'path'
import exists from 'mora-scripts/libs/fs/exists'
import minimatch from 'minimatch'

const NAME_FILTER = (name: string) => !name.startsWith('.') && !name.startsWith('_')
const MODULE_FILE_EXTS = ['.ts', '.tsx', '.js', '.jsx']
const isModuleFile = (file: string) => MODULE_FILE_EXTS.some(ext => file.endsWith(ext))
const removeModuleExt = (file: string) => file.replace(/\.(tsx?|jsx?)$/, '')

export function index(subModules: string[], env: ReturnType<typeof getEnv>) {
  const {
    rootDir,
    srcDir,
    distDir,
    userConfig: { ignores = [] },
  } = env

  if (subModules.includes('index')) {
    throw new Error(`"index" 是默认的模块名称，不能用作子模块名`)
  }

  const fileNames = fs.readdirSync(srcDir).filter(NAME_FILTER)

  const map: { [key: string]: string[] } = {
    index: [],
  }

  subModules.forEach(sub => {
    if (!fileNames.includes(sub)) {
      throw new Error(`目录 "${path.relative(rootDir, srcDir)}" 中不存在子模块 "${sub}"`)
    }
  })

  fileNames.forEach(n => {
    if (subModules.includes(n)) map[n] = [path.join(srcDir, n)]
    else map.index.push(path.join(srcDir, n))
  })

  return Object.keys(map).map(key => generateModule(rootDir, srcDir, distDir, key, map[key], ignores))
}

function generateModule(
  rootDir: string,
  srcDir: string,
  distDir: string,
  key: string,
  entries: string[],
  ignores: string[]
) {
  const exportFiles: string[] = []
  entries.forEach(file => {
    let files = getAllExportFiles(file)
    if (ignores.length) {
      files = files.filter(f => ignores.every(ignore => !minimatch(path.relative(rootDir, f), ignore)))
    }
    exportFiles.push(...files)
  })

  if (!exportFiles.length) throw new Error(`模块 "${key}" 下没有任何文件`)
  const moduleName = removeModuleExt(key)
  const moduleFile = path.join(rootDir, moduleName + '.d.ts')
  const moduleContent = getModuleContent(rootDir, exportFiles.map(f => f.replace(srcDir, distDir)))
  const jsonFile = path.join(rootDir, moduleName + '.map.json')

  return {
    moduleName,
    moduleFile,
    moduleContent,
    jsonFile,
  }
}

function getModuleContent(rootDir: string, exportFiles: string[]) {
  return exportFiles
    .map(file => removeModuleExt('./' + path.relative(rootDir, file).replace(/\\/g, '/')))
    .map(file => `export * from '${file}'\n`)
    .join('')
}

function getAllExportFiles(file: string) {
  const entries: string[] = []
  const stat = fs.statSync(file)
  if (stat.isFile() && isModuleFile(file)) {
    entries.push(file)
  } else if (stat.isDirectory()) {
    const indexes = MODULE_FILE_EXTS.map(ext => path.join(file, 'index' + ext))
    for (const file of indexes) {
      if (exists.file(file)) {
        entries.push(file)
        return entries
      }
    }
    fs.readdirSync(file)
      .filter(NAME_FILTER)
      .forEach(n => {
        entries.push(...getAllExportFiles(path.join(file, n)))
      })
  }
  return entries
}
