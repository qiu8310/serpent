import { makeLib } from '@serpent/rollup-kits'
import path from 'path'

const rootDir = path.resolve(__dirname)
const src = (...parts) => path.join(rootDir, 'src', ...parts)

export default makeLib({
  modules: {
    debug: src('debug.ts'),
    cmder: src('cmder', 'index.ts'),
    env: src('env', 'index.ts'),
    fs: src('fs', 'index.ts'),
    npm: src('npm', 'index.ts'),
  },
})
