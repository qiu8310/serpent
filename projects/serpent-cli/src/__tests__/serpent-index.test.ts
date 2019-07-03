import path from 'path'
import { index } from '../serpent-index'
import { getEnv } from '../env'

const createEnv = (name: string, ignores?: string[]): ReturnType<typeof getEnv> => {
  const rootDir = path.resolve(__dirname, 'fixtures', name)
  return {
    rootDir: rootDir,
    distDir: path.join(rootDir, 'dist'),
    srcDir: path.join(rootDir, 'src'),
    userConfig: { ignores },
  }
}

describe('serpent-index', () => {
  test('指定 index 参数时要抛出异常（ index 是默认的模块，一定要存在）', () => {
    expect(() => {
      index(['index'], createEnv('index-basic'))
    }).toThrowErrorMatchingInlineSnapshot(`"\\"index\\" 是默认的模块名称，不能用作子模块名"`)
  })

  test('src 目录中没有指定的模块时要抛出异常', () => {
    expect(() => {
      index(['not-exist-module'], createEnv('index-basic'))
    }).toThrowErrorMatchingInlineSnapshot(`"目录 \\"src\\" 中不存在子模块 \\"not-exist-module\\""`)
  })

  test('指定的模块下没有任何脚本文件时要抛出异常', () => {
    expect(() => {
      index([], createEnv('index-empty'))
    }).toThrowErrorMatchingInlineSnapshot(`"模块 \\"index\\" 下没有任何文件"`)
  })

  test('full features', () => {
    const env = createEnv('index-basic', [])
    const res = index(['sub1', 'sub2'], env)
    expect(res).toHaveLength(3)

    expect(res[0].moduleContent).toBe("export * from './dist/a'\n")
    expect(res[1].moduleContent).toBe("export * from './dist/sub1/b'\n")
    expect(res[2].moduleContent).toBe("export * from './dist/sub2/index'\n")
  })

  test('ignores', () => {
    const env = createEnv('index-basic', ['src/sub1/**', 'src/sub2/**'])
    const res = index([], env)
    expect(res).toHaveLength(1)
    expect(res[0].moduleName).toBe('index')
    expect(res[0].moduleFile).toBe(path.join(env.rootDir, 'index.d.ts'))
    expect(res[0].jsonFile).toBe(path.join(env.rootDir, 'index.map.json'))
    expect(res[0].moduleContent).toBe("export * from './dist/a'\n")
  })
})
