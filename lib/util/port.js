/*
* @Author: shl
* @title: 检测端口是否被占用
* @Date:   2019-11-15 15:44:12
* @Last Modified by:   shl
* @Last Modified time: 2019-11-15 16:24:29
*/
const net = require('net')

function checkport (port) {
  const server = net.createServer().listen(port)
  return new Promise((resolve, reject) => {
    server.on('listening', function () {
      server.close()
      resolve(port)
    })
    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        resolve(checkport(port + 1))
      } else {
        reject(err)
      }
    })
  })
  
}
module.exports = checkport