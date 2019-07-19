# @serpent/react-kits

给 serpent 相关项目用的套件，主要集成了:

* react
* react-dom
* react-router
* react-router-dom
* react-transition-group
* mobx
* mobx-react
* mobx-react-lite
* lodash


**为了保证此项目的所有依赖安装在最外层，所以此项目 package.json 中的 dependencies 和 peerDependencies 两字段是一样的**

另外不要以 link 的方式安装此项目，link 方式不会将此项目的依赖安装在使用的项目中。所以此项目不能用 lerna link 方式安装
