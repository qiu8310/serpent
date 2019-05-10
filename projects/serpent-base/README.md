# @serpent/base

支持任意平台的通用组件库

**项目没有文档，全部采用 ts 来编写，你可以从 ts 的自动补全中获取足够的文档信息，所以请采用支持 ts 的编辑器来使用此模块**


## 注意：

项目根目录下有 index.d.ts，但没有 index.js 文件，所以不要使用下面这种写法：

```js
import {} from "@serpent/base"
```

而应该使用这种写法：

```js
import {} from "@serpent/base/path/to/file"
```

如果一定要使用第一种方式的话，可以使用 webpack 的 [index-loader](https://github.com/qiu8310/index-loader) 来动态加载依赖
