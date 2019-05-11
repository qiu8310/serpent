import path from 'path'
import os from 'os'
import findup from 'mora-scripts/libs/fs/findup'
import { jest } from '../serpent-jest'

const rootDir = path.dirname(findup.pkg())

describe('serpent-jest', () => {
  it('should prefix config params', () => {
    const root = os.tmpdir()
    const { args, cmd } = jest(['a'], { rootDir: root })
    expect(cmd).toBe(path.join(root, 'node_modules', '.bin', 'jest'))
    expect(args).toHaveLength(3)
    expect(args[0]).toBe('-c')
    expect(args[2]).toBe('a')
  })

  it('should not prefix config params when config params already exists', () => {
    const { args: args1 } = jest(['a', '-c'], { rootDir })
    expect(args1).toEqual(['a', '-c'])

    const { args: args2 } = jest(['a', '--config=abc'], { rootDir })
    expect(args2).toEqual(['a', '--config=abc'])
  })

  it('should not prefix config params when rootDir has jest.config.js file in it', () => {
    const { args } = jest(['a', 'b'], { rootDir })
    expect(args).toEqual(['a', 'b'])
  })
})
