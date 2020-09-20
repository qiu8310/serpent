import { makeLib } from '@serpent/rollup-kits'
import exists from 'mora-scripts/libs/fs/exists'
import path from 'path'
import fs from 'fs'

const rootDir = path.resolve(__dirname)
const srcDir = path.join(rootDir, 'src')

const modules = fs.readdirSync(srcDir).reduce((res, k) => {
  if (k.endsWith('.ts')) {
    res[k.replace(/\.ts$/, '')] = path.join(srcDir, k)
  } else if (exists(path.join(srcDir, k, 'index.ts'))) {
    res[k] = path.join(srcDir, k, 'index.ts')
  }
  return res
}, {})

export default makeLib({
  modules,
})
