
module.exports = function(content) {
  const search = `console.warn('You are using a whole package of antd, '`
  return content.replace(search, `// ` + search)
}
