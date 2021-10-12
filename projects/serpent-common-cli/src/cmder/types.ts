export interface CmdConf {
  /**
   * 指定命令行的用法
   *
   * @example
   * cli [options] <foo>
   */
  usage?: string | (() => string)
  /**
   * 命令行的描述
   */
  desc?: string | string[] | (() => string)
  /**
   * 命令行的使用示例
   */
  example?: string | string[] | (() => string)
  /**
   * 放在 help 末尾的信息，一般可以放一些版权之类的说明
   */
  epilog?: string | (() => string)

  /**
   * 初始化操作，在命令后面添加 ---run-bootstrap 才会触发此函数执行
   */
  bootstrap?: () => void
  /**
   * 指定版本号， 如 1.0.0
   *
   * 如果设置为 false，就不会自动加上 "v | version" 选项
   */
  version?: false | string | (() => string)
  /**
   * 禁用自动添加的 "h | help" 选项
   */
  help?: false
  /**
   * 在遇到第一个非 option 参数时就停止解析（很适用于子程序）
   */
  stopParseOnFirstNoOption?: boolean
  /**
   * 出错时显示帮助信息
   */
  showHelpOnError?: boolean
  /**
   * 严格模式，遇到无法解析的 option 是就报错
   */
  strict?: boolean
}
export interface CmdResponse {
  /**
   * 原始的未处理过的 args，默认是 process.argv.slice(2)
   */
  rawArgs: string[]

  /**
   * 记录所有用户自定义的选项
   */
  userDefined: { [key: string]: boolean }
  userDefinedOptions: { [key: string]: boolean }
  userDefinedEnv: { [key: string]: boolean }

  /** 子命令名称，由于子命令支持通配符，所以需要通过此字段来获取子命令实际的值 */
  $command: string

  /**
   * 解析完后剩下的给程序的参数
   */
  _: string[]

  /**
   * 读取到的系统的环境变量
   */
  env: Record<string, any>

  /**
   * 其它 options 中指定的键值，如果没设置也会存在，且值为 undefined
   */
  [optionKey: string]: any
}

// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
export type IsEquals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

/** 用于 type 类型验证 */
export function assertType<T, U extends T>() {}

// 确保本地的配置和 mora-scripts 模块中的配置一样
assertType<IsEquals<CmdConf, cli.Conf>, true>()
assertType<IsEquals<CmdResponse, cli.Response>, true>()
