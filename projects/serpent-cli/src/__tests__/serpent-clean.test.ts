import path from 'path'
import fs from 'fs'
import os from 'os'
import { clean } from '../serpent-clean'

describe('serpent-clean', () => {
  test('should ignore not exists folder', () => {
    expect(() => {
      const dir = path.join(os.tmpdir(), 'serpent-' + Math.random())
      clean({ distDir: dir })
    }).not.toThrow()
  })

  test('should clean exists folder', () => {
    const dir = path.join(os.tmpdir(), 'serpent-' + Math.random())
    fs.mkdirSync(dir)
    clean({ distDir: dir })
    expect(fs.existsSync(dir)).toBe(false)
  })

  test('should not clean exists text file', () => {
    const file = path.join(os.tmpdir(), 'serpent-' + Math.random())
    fs.writeFileSync(file, '')
    clean({ distDir: file })
    expect(fs.existsSync(file)).toBe(true)
    fs.unlinkSync(file)
  })
})
