# @serpent/{{name}}

{{description}}

**项目没有文档，全部采用 ts 来编写，你可以从 ts 的自动补全中获取足够的文档信息，所以请采用支持 ts 的编辑器来使用此模块**


## 注意一：

项目根目录下有 index.d.ts，但没有 index.js 文件，所以不要使用下面这种写法：

```js
import {} from "@serpent/{{name}}"
```

而应该使用这种写法：

```js
import {} from "@serpent/{{name}}/path/to/file"
```

如果一定要使用第一种方式的话，可以使用 webpack 的 [index-loader](https://github.com/qiu8310/index-loader) 来动态加载依赖

## 注意二：

所有 serpent 项目需要环境默认支持下面的模块：

* es5
* es2015.promise
* es2015.core
* es2015.collection
* es2016.array.include

如果没有，请使用对应的 polyfill，或者使用 [@durka/polyfill](https://github.com/qiu8310/durka/tree/master/projects/durka-polyfill-builder/res/durka-polyfill)
