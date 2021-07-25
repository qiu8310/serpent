import clog from 'mora-scripts/libs/sys/clog'
import info from 'mora-scripts/libs/sys/info'
import success from 'mora-scripts/libs/sys/success'
import error from 'mora-scripts/libs/sys/error'
import warn from 'mora-scripts/libs/sys/warn'

const logHead = (msg: string) => clog(`\n%c${prefix(msg, ' ')}`, 'bold.green')

const logBody = (msg: string) => clog(`%c${prefix(msg, '  ')}`, 'gray')

const logBlock = (head: string, body: string) => {
  logHead(head)
  logBody(body)
}

export const logger = {
  head: logHead,
  body: logBody,
  block: logBlock,
  info: (...args: any[]) => info(...args),
  success: (...args: any[]) => success(...args),
  error: (...args: any[]) => error(...args),
  warn: (...args: any[]) => warn(...args),
  clog: (...args: any[]) => clog(...args),
  format: (...args: any[]) => clog.format(...args),
}

function prefix(msg: string, some: string) {
  return msg
    .split('\n')
    .map(l => some + l)
    .join('\n')
}
