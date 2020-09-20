import clog from 'mora-scripts/libs/sys/clog'

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
}

function prefix(msg: string, some: string) {
  return msg
    .split('\n')
    .map(l => some + l)
    .join('\n')
}
