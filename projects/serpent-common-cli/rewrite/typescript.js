const Module = require('module')
let originalRequire = Module.prototype.require

Module.prototype.require = function (...args) {
  if (args[0] === 'typescript') {
    // 使用本地的 typescript
    const local = require.resolve(args[0], { paths: [process.cwd()] })
    return originalRequire.apply(this, local)
  }
  return originalRequire.apply(this, args)
}
