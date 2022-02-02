const https = require('https')
const http = require('http')

function fetch(url) {
  return new Promise((resolve, reject) => {
    const isHTTPS = url.startsWith('https:')
    let client
    if (isHTTPS) {
      client = https.get(url, fetchCallback)
    } else {
      client = http.get(url, fetchCallback)
    }
    client.on('error', e => {
      reject(e)
    })
    function fetchCallback(res) {
      let _data = ''
      let status = res.statusCode
      let message = res.statusMessage
      console.log(message)

      res.on('close', e => {
        res.removeAllListeners()
        let data
        if (_data) {
          try {
            data = JSON.parse(_data)
          } catch (e) {
            data = _data
          }
        }
        resolve({ data, status })
      })
      res.on('data', chunk => {
        if (typeof chunk === 'string') _data += chunk
        if (Buffer.isBuffer(chunk)) _data += chunk.toString()
      })
    }
  })
}
fetch('https://registry.npmmirror.com/mora-common').then(d => {
  console.log(d.data)
})
