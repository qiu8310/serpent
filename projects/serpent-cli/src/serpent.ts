#!/usr/bin/env node

import cli from 'mora-scripts/libs/tty/cli'
import cp from 'child_process'

import { index } from './serpent-index'
import { clean } from './serpent-clean'
import { jest } from './serpent-jest'

import { getEnv } from './env'

cli({
  usage: 'serpent <command> [options]',
  version() {
    return require('../package.json').version
  }
})
  .commands({
    clean: {
      desc: `删除项目根目录下的 dist 文件夹`,
      cmd() {
        clean(getEnv())
      }
    },

    jest: {
      desc: `用 dev-kits 中的 jest.config.js 来运行 jest 命令`,
      cmd(res) {
        const { cmd, args } = jest(res._, getEnv())
        const child = cp.spawn(cmd, args, { stdio: 'inherit' })
        child.on('exit', code => (process.exitCode = code || 0))
      }
    },

    index: {
      desc: `根据项目根目录下的 serpent.json 文件自动生成 index 入口文件`,
      cmd(res) {
        index(res._, getEnv())
      }
    }
  })
  .parse(function() {
    this.help()
  })
