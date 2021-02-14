import debug from 'debug'

export const createDebug: {
  (namespace: string): {
    (formatter: any, ...args: any[]): void
    [key: string]: any
  }
  [key: string]: any
} = debug
