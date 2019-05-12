#!/usr/bin/env node

import cli from 'mora-scripts/libs/tty/cli'
import fs from 'fs'
import path from 'path'
import { index2json } from 'index-loader/dist/index2json'
import exists from 'mora-scripts/libs/fs/exists'
import rm from 'mora-scripts/libs/fs/rm'
import clog from 'mora-scripts/libs/sys/clog'

import { index } from './serpent-index'
import { clean } from './serpent-clean'
import { init, initInit } from './serpent-init'

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
    },

    init: {
      desc: '初始化新项目',
      cmd(res) {
        const projectsDir = path.resolve(__dirname, '..', '..')
        const templateSrcDir = path.join(projectsDir, 'serpent-template')
        const templateDistDir = path.join(projectsDir, 'serpent-cli', 'res', 'template')

        // 内部命令，将模板文件复制到 cli 项目中
        if (res._[0] === 'init' && res._.length === 1) {
          if (exists.directory(templateDistDir)) rm(templateDistDir)
          initInit(templateSrcDir, templateDistDir)
          clog(`%c create template %c${templateDistDir} `, 'green', 'bold')
          return
        }
        if (res._.length !== 2) {
          return this.error(`serpent init <project-name> <project-description>`)
        }

        const [rawName, description] = res._
        let name = rawName.replace(/@serpent\//, '')
        if (!/^[-a-z]+$/.test(name)) {
          return this.error(`项目名 "${rawName}" 格式(/^[-a-z]+$/)不正确`)
        }

        const distDir = path.join(projectsDir, 'serpent-' + name)
        init(templateDistDir, distDir, { name, description })

        clog(`%c create project %c@serpent/${name} `, 'green', 'bold')
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
