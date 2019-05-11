#!/usr/bin/env node

import cli from 'mora-scripts/libs/tty/cli'
import cp from 'child_process'
import fs from 'fs'
import { index2json } from 'index-loader/dist/index2json'
import exists from 'mora-scripts/libs/fs/exists'
import clog from 'mora-scripts/libs/sys/clog'

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
        index(res._, getEnv()).forEach(({ moduleName, moduleFile, moduleContent, jsonFile }) => {
          writeFile(moduleFile, moduleContent)

          // 要先生成 moduleFile
          const jsonMap = index2json(moduleFile)
          writeFile(jsonFile, JSON.stringify(jsonMap, null, 2))
          clog(
            `%c create ${moduleName} module: %c${moduleName}.d.ts ${moduleName}.map.json`,
            'green',
            'bold'
          )
        })
      }
    }
  })
  .parse(function() {
    this.help()
  })

function writeFile(file: string, content: string) {
  if (!exists.file(file) || fs.readFileSync(file).toString() !== content) {
    fs.writeFileSync(file, content)
  }
}
