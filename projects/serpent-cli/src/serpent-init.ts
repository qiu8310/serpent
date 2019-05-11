import { copy } from './copy'

export function init(
  fromDir: string,
  distDir: string,
  data: { name: string; description: string }
) {
  return copy(fromDir, distDir, {
    rename(file) {
      return file.replace(/\.tpl$/, '')
    },
    replacers: [
      {
        type: 'json',
        match: /package\.json\.tpl$/,
        data: {
          ...data,
          name: '@serpent/' + data.name,
          keywords: ['serpent', data.name]
        }
      },
      {
        type: 'text',
        match: /\.md\.tpl$/,
        data
      }
    ]
  })
}

export function initInit(fromDir: string, distDir: string) {
  return copy(fromDir, distDir, {
    excludes(relativePath) {
      return ['node_modules', 'coverage', 'dist'].includes(relativePath)
    },
    rename(distFile) {
      return distFile + '.tpl'
    }
  })
}
