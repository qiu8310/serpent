import os from 'os'
import path from 'path'
import fs from 'fs'
import rm from 'mora-scripts/libs/fs/rm'

import { copy } from '../copy'

describe('copy', () => {
  let fromDir = ''
  let distDir = ''
  beforeEach(() => {
    fromDir = path.join(os.tmpdir(), 'serpent-src-' + Math.random())
    distDir = path.join(os.tmpdir(), 'serpent-dist-' + Math.random())
    fs.mkdirSync(fromDir)
    fs.mkdirSync(distDir)
  })
  afterEach(() => {
    if (fs.existsSync(fromDir)) rm(fromDir)
    if (fs.existsSync(distDir)) rm(distDir)
  })

  function toArray(str: string | string[]) {
    return Array.isArray(str) ? str : [str]
  }
  function createFile(file: string | string[], content = '', useDistDir?: boolean) {
    const fullPath = path.join(useDistDir ? distDir : fromDir, ...toArray(file))
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(fullPath, content)
  }
  function testFile(file: string | string[], content = '', useFromDir?: boolean) {
    const fullPath = path.join(useFromDir ? fromDir : distDir, ...toArray(file))
    expect(fs.existsSync(fullPath)).toBe(true)
    return expect(fs.readFileSync(fullPath).toString()).toBe(content)
  }
  function testNotFile(file: string | string[]) {
    const fullPath = path.join(distDir, ...toArray(file))
    expect(fs.existsSync(fullPath)).toBe(false)
  }

  test('should throws when fromDir not exists', () => {
    expect(() => {
      copy(path.join(fromDir, 'xxxx'), distDir)
    }).toThrowError(/xxxx not exists/)
  })

  test('should copy single dir', () => {
    createFile('file', 'hello')
    const { copied } = copy(fromDir, distDir)
    testFile('file', 'hello')
    expect(copied).toHaveLength(1)
  })

  test('should copy sub dir', () => {
    createFile(['a', 'b'], 'hello')
    copy(fromDir, distDir)
    testFile(['a', 'b'], 'hello')
  })

  test('should throws when dist file exists', () => {
    createFile('a', 'new', false)
    createFile('a', 'old', true)
    expect(() => {
      copy(fromDir, distDir)
    }).toThrowError(/目标文件 .* 已经存在/)
  })

  test('rename', () => {
    createFile('file', 'hello')
    copy(fromDir, distDir, {
      rename(dist) {
        return dist + '_xxx'
      }
    })
    testNotFile('file')
    testFile('file_xxx', 'hello')
  })

  test('excludes', () => {
    createFile('fileA')
    createFile('fileB')
    copy(fromDir, distDir, { excludes: f => f === 'fileA' })
    testNotFile('fileA')
    testFile('fileB')
  })

  test('excludes & includes', () => {
    createFile('file1')
    createFile('file2')
    copy(fromDir, distDir, {
      excludes: () => true,
      includes: f => f === 'file2'
    })
    testNotFile('file1')
    testFile('file2')
  })

  test('duplicate:error', () => {
    createFile('a1', 'new', false)
    createFile('a1', 'old', true)
    expect(() => {
      copy(fromDir, distDir, { duplicate: 'error' })
    }).toThrowError(/目标文件 .* 已经存在/)
  })

  test('duplicate:ignore', () => {
    createFile('a2', 'new', false)
    createFile('a2', 'old', true)
    const { ignored, copied } = copy(fromDir, distDir, { duplicate: 'ignore' })
    testFile('a2', 'old')
    expect(ignored).toHaveLength(1)
    expect(copied).toHaveLength(0)
  })

  test('duplicate:overwrite', () => {
    createFile('a3', 'new', false)
    createFile('a3', 'old', true)
    const { overwritten, copied } = copy(fromDir, distDir, { duplicate: 'overwrite' })
    testFile('a3', 'new')
    expect(overwritten).toHaveLength(1)
    expect(copied).toHaveLength(1)
  })

  test('duplicate:others', () => {
    createFile('a4', 'new', false)
    createFile('a4', 'old', true)
    expect(() => {
      copy(fromDir, distDir, { duplicate: 'others' as 'overwrite' })
    }).toThrowErrorMatchingInlineSnapshot(`"duplicate 字段不支持设置成 \\"others\\""`)
  })

  test('replace:text', () => {
    createFile('abc', '--{{a}}--abc')
    createFile('a.md', '--{{a}}--{{b}}--{{c}}--')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'text',
          match: /\.md$/,
          data: { a: '1', b: '2' }
        }
      ]
    })
    testFile('abc', '--{{a}}--abc')
    testFile('a.md', '--1--2--{{c}}--')
  })

  test('replace:text custom tag', () => {
    createFile('a.md', '-[<a>]-')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'text',
          match: /\.md$/,
          tagEnd: '>]',
          tagStart: '[<',
          data: { a: '1' }
        }
      ]
    })
    testFile('a.md', '-1-')
  })

  test('replace:json', () => {
    createFile('abc')
    createFile('a.json', '{"a":{"b":1}}')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'json',
          match: /\.json$/,
          data: { 'a.b': 2 },
          stringify: [null, 0]
        }
      ]
    })
    testFile('abc')
    testFile('a.json', '{"a":{"b":2}}')
  })

  test('replace:json default stringify', () => {
    createFile('abc')
    createFile('a.json', '{"a":{"b":1}}')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'json',
          match: /\.json$/,
          data: { 'a.b': 2 }
        }
      ]
    })
    testFile('abc')
    testFile('a.json', '{\n  "a": {\n    "b": 2\n  }\n}')
  })

  test('replace:manual', () => {
    createFile('abc')
    createFile('a.json', 'abc')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'manual',
          match: /abc$/,
          replace() {
            return 'hello'
          }
        }
      ]
    })
    testFile('abc', 'hello')
    testFile('a.json', 'abc')
  })

  test('replace:others', () => {
    createFile('abc')
    expect(() => {
      copy(fromDir, distDir, {
        replacers: [
          {
            type: 'others' as 'json',
            match: /abc$/,
            data: {}
          }
        ]
      })
    }).toThrowErrorMatchingInlineSnapshot(`"replacer 中的 type 字段不支持设置成 \\"others\\""`)
  })

  test('replace all', () => {
    createFile('a1', '{{a}}')
    createFile('a2', '{{a}}')
    copy(fromDir, distDir, {
      replacers: [
        {
          type: 'text',
          match: [/a1/],
          data: { a: 'hello' }
        },
        {
          type: 'text',
          match: [/a2/],
          data: { a: 'world' }
        }
      ]
    })
    testFile('a1', 'hello')
    testFile('a2', 'world')
  })
})
