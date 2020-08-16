export namespace env {
  export interface Options<T> {
    /** 环境变量前缀（一定要设置，否则获取不方便） */
    prefix: string
    /** 默认注入的环境变量（系统存在则不会注入这些默认的变量） */
    defaultEnv: T
  }
}
