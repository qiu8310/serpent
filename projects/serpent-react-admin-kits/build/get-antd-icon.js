/* eslint "@typescript-eslint/no-var-requires": "off" */
const fs = require('fs')
const path = require('path')
const typesDir = path.resolve(__dirname, '..')

/**
 * 解析 node_modules/@ant-design/icons/svg/ 中的 svg 名称
 * 生成 res/generate/types/antd-icon.d.ts 文件
 */
function getAntdIcon() {
  const target = 'node_modules/@ant-design/icons/svg/'
  const folder = path.resolve(__dirname, '..', ...target.split('/'))
  /** @type {string[]} */
  const result = []
  const map = {}
  let content = `// prettier-ignore\ndeclare type ANTD_ICON =`
  fs.readdirSync(folder).forEach(name => {
    if (name.startsWith('.')) return
    const dir = path.join(folder, name)
    map[name] = fs
      .readdirSync(dir)
      .filter(n => n.endsWith('.svg'))
      .map(n => `${n.replace(/\.svg$/, '')}`)

    result.push(map[name])
  })

  content += result.map(n => `'${n}'`).join('\n  | ') + '\n'
  console.log('generate ' + path.join(typesDir, 'antd-icon.d.ts'))
  fs.writeFileSync(path.join(typesDir, 'antd-icon.d.ts'), content)
  fs.writeFileSync(path.join(typesDir, 'antd-icon.json'), JSON.stringify(map))
}

getAntdIcon()
